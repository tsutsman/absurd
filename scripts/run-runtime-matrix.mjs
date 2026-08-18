import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const runtime = process.argv[2];
if (!new Set(["codex", "claude-code"]).has(runtime)) {
  console.error("Usage: node scripts/run-runtime-matrix.mjs <codex|claude-code>");
  process.exit(2);
}

const evalManifest = JSON.parse(fs.readFileSync("evals/absurd.json", "utf8"));
const matrix = JSON.parse(fs.readFileSync("evals/cross-model-matrix.json", "utf8"));
const evalById = new Map(evalManifest.evals.map((item) => [item.id, item]));
const outputDir = path.join("runtime-results", runtime);
fs.mkdirSync(outputDir, { recursive: true });

const cli = runtime === "codex" ? "codex" : "claude";
const version = spawnSync(cli, ["--version"], { encoding: "utf8", timeout: 30_000 });
const helpArgs = runtime === "codex" ? ["exec", "--help"] : ["--help"];
const help = spawnSync(cli, helpArgs, { encoding: "utf8", timeout: 30_000 });

const metadata = {
  runtime,
  git_sha: process.env.GITHUB_SHA || null,
  git_ref: process.env.GITHUB_REF || null,
  cli_version: (version.stdout || version.stderr || "").trim(),
  cli_version_exit_code: version.status,
  started_at: new Date().toISOString(),
  integration_delivery: null,
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
} else {
  metadata.integration_delivery = "installed AGENTS.md via install-absurd-codex.sh";
}

for (const matrixCase of matrix.cases) {
  const evaluation = evalById.get(matrixCase.eval_id);
  if (!evaluation) continue;

  const stem = `eval-${evaluation.id}-${evaluation.name}`;
  const stdoutPath = path.join(outputDir, `${stem}.stdout.txt`);
  const stderrPath = path.join(outputDir, `${stem}.stderr.txt`);
  const started = Date.now();

  let args;
  if (runtime === "codex") {
    const helpText = `${help.stdout || ""}\n${help.stderr || ""}`;
    args = ["exec"];
    if (helpText.includes("--sandbox") || helpText.includes("-s, --sandbox")) {
      args.push("--sandbox", "read-only");
    }
    args.push(evaluation.prompt);
  } else {
    args = ["-p", evaluation.prompt, "--output-format", "json", "--max-turns", "1"];
    if (claudeUsesOutputStyleFlag) {
      args.push("--output-style", "absurd");
    } else {
      args.push("--append-system-prompt", claudeSystemPrompt);
    }
  }

  const result = spawnSync(cli, args, {
    encoding: "utf8",
    timeout: 240_000,
    maxBuffer: 8 * 1024 * 1024,
    env: process.env
  });

  fs.writeFileSync(stdoutPath, result.stdout || "");
  fs.writeFileSync(stderrPath, result.stderr || result.error?.message || "");

  metadata.cases.push({
    eval_id: evaluation.id,
    name: evaluation.name,
    mode: evaluation.mode,
    exit_code: result.status,
    signal: result.signal || null,
    duration_ms: Date.now() - started,
    stdout_file: path.basename(stdoutPath),
    stderr_file: path.basename(stderrPath),
    error: result.error?.message || null
  });

  // Reduce the chance of short-burst rate limiting between six sequential calls.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
}

metadata.finished_at = new Date().toISOString();
metadata.completed_cases = metadata.cases.length;
metadata.successful_processes = metadata.cases.filter((item) => item.exit_code === 0).length;
fs.writeFileSync(path.join(outputDir, "summary.json"), JSON.stringify(metadata, null, 2) + "\n");

console.log(`${runtime}: ${metadata.successful_processes}/${metadata.completed_cases} CLI processes exited 0`);
