import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const runtime = process.argv[2];
const supportedRuntimes = new Set(["codex", "claude-code", "hermes-agent", "openclaw"]);
if (!supportedRuntimes.has(runtime)) {
  console.error("Usage: node scripts/run-runtime-matrix.mjs <codex|claude-code|hermes-agent|openclaw>");
  process.exit(2);
}

const evalManifest = JSON.parse(fs.readFileSync("evals/absurd.json", "utf8"));
const matrix = JSON.parse(fs.readFileSync("evals/cross-model-matrix.json", "utf8"));
const evalById = new Map(evalManifest.evals.map((item) => [item.id, item]));
const outputDir = path.join("runtime-results", runtime);
fs.mkdirSync(outputDir, { recursive: true });

const runtimeConfig = {
  codex: {
    cli: "codex",
    helpArgs: ["exec", "--help"],
    integrationDelivery: "installed AGENTS.md via install-absurd-codex.sh"
  },
  "claude-code": {
    cli: "claude",
    helpArgs: ["--help"],
    integrationDelivery: null
  },
  "hermes-agent": {
    cli: "hermes",
    helpArgs: ["chat", "--help"],
    integrationDelivery: "installed skill + --skills absurd preload"
  },
  openclaw: {
    cli: "openclaw",
    helpArgs: ["agent", "exec", "--help"],
    integrationDelivery: "installed shared skill + isolated agent exec"
  }
}[runtime];

const cli = runtimeConfig.cli;
const version = spawnSync(cli, ["--version"], { encoding: "utf8", timeout: 30_000 });
const help = spawnSync(cli, runtimeConfig.helpArgs, { encoding: "utf8", timeout: 30_000 });
const openAiModel = process.env.ABSURD_RUNTIME_OPENAI_MODEL || "gpt-5.6";
const hermesProvider = process.env.HERMES_RUNTIME_PROVIDER || "openai-api";
const hermesModel = process.env.HERMES_RUNTIME_MODEL || openAiModel;
const openclawModel = process.env.OPENCLAW_RUNTIME_MODEL || `openai/${openAiModel}`;

const metadata = {
  runtime,
  git_sha: process.env.GITHUB_SHA || null,
  git_ref: process.env.GITHUB_REF || null,
  cli_version: (version.stdout || version.stderr || "").trim(),
  cli_version_exit_code: version.status,
  started_at: new Date().toISOString(),
  integration_delivery: runtimeConfig.integrationDelivery,
  prompt_transport: ["hermes-agent", "openclaw"].includes(runtime)
    ? "skill-preload-adapter"
    : "direct-eval-prompt",
  requested_provider: runtime === "hermes-agent" ? hermesProvider : runtime === "openclaw" ? openclawModel.split("/")[0] : null,
  requested_model: runtime === "hermes-agent" ? hermesModel : runtime === "openclaw" ? openclawModel : null,
  cases: []
};

if (version.error || version.status !== 0) {
  metadata.runtime_error = version.error?.message || version.stderr || "CLI version check failed";
  fs.writeFileSync(path.join(outputDir, "summary.json"), JSON.stringify(metadata, null, 2) + "\n");
  process.exit(0);
}

let claudeSystemPrompt = "";
let claudeUsesOutputStyleFlag = false;
if (runtime === "claude-code") {
  const helpText = `${help.stdout || ""}\n${help.stderr || ""}`;
  claudeUsesOutputStyleFlag = helpText.includes("--output-style");
  if (claudeUsesOutputStyleFlag) {
    metadata.integration_delivery = "--output-style absurd";
  } else {
    const style = fs.readFileSync("output-styles/absurd.md", "utf8");
    const skill = fs.readFileSync("skills/absurd/SKILL.md", "utf8");
    claudeSystemPrompt = `${style}\n\n${skill}`;
    metadata.integration_delivery = "fallback: exact output-style + skill via --append-system-prompt";
  }
}

function adaptSkillRuntimePrompt(evaluation) {
  const match = evaluation.prompt.match(/^\/absurd\s+(dry|scene|chaos|normal)\s+([\s\S]*)$/i);
  if (!match) return evaluation.prompt;
  const [, mode, rest] = match;
  return `Use the installed \"absurd\" skill in ${mode.toLowerCase()} mode. ${rest}`;
}

for (const matrixCase of matrix.cases) {
  const evaluation = evalById.get(matrixCase.eval_id);
  if (!evaluation) continue;

  const stem = `eval-${evaluation.id}-${evaluation.name}`;
  const stdoutPath = path.join(outputDir, `${stem}.stdout.txt`);
  const stderrPath = path.join(outputDir, `${stem}.stderr.txt`);
  const started = Date.now();
  const prompt = ["hermes-agent", "openclaw"].includes(runtime)
    ? adaptSkillRuntimePrompt(evaluation)
    : evaluation.prompt;

  let args;
  if (runtime === "codex") {
    const helpText = `${help.stdout || ""}\n${help.stderr || ""}`;
    args = ["exec"];
    if (helpText.includes("--sandbox") || helpText.includes("-s, --sandbox")) {
      args.push("--sandbox", "read-only");
    }
    args.push(evaluation.prompt);
  } else if (runtime === "claude-code") {
    args = ["-p", evaluation.prompt, "--output-format", "json", "--max-turns", "1"];
    if (claudeUsesOutputStyleFlag) {
      args.push("--output-style", "absurd");
    } else {
      args.push("--append-system-prompt", claudeSystemPrompt);
    }
  } else if (runtime === "hermes-agent") {
    args = [
      "chat",
      "--quiet",
      "-q",
      prompt,
      "--provider",
      hermesProvider,
      "--model",
      hermesModel,
      "--skills",
      "absurd",
      "--max-turns",
      "1"
    ];
  } else {
    const stateDir = process.env.OPENCLAW_STATE_DIR || path.join(process.env.HOME || ".", ".openclaw");
    args = [
      "agent",
      "exec",
      "--state-dir",
      stateDir,
      "--auth-env-only",
      "--model",
      openclawModel,
      "--json",
      "--timeout",
      "240",
      prompt
    ];
  }

  const result = spawnSync(cli, args, {
    encoding: "utf8",
    timeout: 300_000,
    maxBuffer: 8 * 1024 * 1024,
    env: process.env
  });

  fs.writeFileSync(stdoutPath, result.stdout || "");
  fs.writeFileSync(stderrPath, result.stderr || result.error?.message || "");

  const caseMetadata = {
    eval_id: evaluation.id,
    name: evaluation.name,
    mode: evaluation.mode,
    exit_code: result.status,
    signal: result.signal || null,
    duration_ms: Date.now() - started,
    stdout_file: path.basename(stdoutPath),
    stderr_file: path.basename(stderrPath),
    prompt_adapted: prompt !== evaluation.prompt,
    error: result.error?.message || null
  };

  if (runtime === "openclaw" && result.status === 0 && result.stdout) {
    try {
      const parsed = JSON.parse(result.stdout);
      caseMetadata.actual_provider = parsed.provider || parsed.meta?.agentMeta?.provider || null;
      caseMetadata.actual_model = parsed.model || parsed.meta?.agentMeta?.model || null;
    } catch {
      caseMetadata.output_parse_error = "OpenClaw stdout was not valid JSON";
    }
  }

  metadata.cases.push(caseMetadata);

  // Reduce the chance of short-burst rate limiting between sequential calls.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
}

metadata.finished_at = new Date().toISOString();
metadata.completed_cases = metadata.cases.length;
metadata.successful_processes = metadata.cases.filter((item) => item.exit_code === 0).length;
fs.writeFileSync(path.join(outputDir, "summary.json"), JSON.stringify(metadata, null, 2) + "\n");

console.log(`${runtime}: ${metadata.successful_processes}/${metadata.completed_cases} CLI processes exited 0`);
