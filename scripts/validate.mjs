import fs from "node:fs";

const requiredFiles = [
  "README.md",
  "skills/absurd/SKILL.md",
  "output-styles/absurd.md",
  "commands/absurd.md",
  "codex/AGENTS-absurd.md",
  "evals/absurd.json",
  "evals/mode-contracts.json",
  "evals/cross-model-matrix.json",
  "docs/style-principles.md",
  "docs/ukrainian-absurd.md",
  "docs/anti-patterns.md",
  "docs/cross-model-testing.md",
  "install-absurd.sh",
  "install-absurd-codex.sh"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
    throw new Error("Відсутній або порожній файл: " + file);
  }
}

const manifest = JSON.parse(fs.readFileSync("evals/absurd.json", "utf8"));
if (manifest.skill_name !== "absurd") {
  throw new Error("Неправильне ім’я skill у eval-manifest.");
}
if (!Array.isArray(manifest.evals) || manifest.evals.length < 12) {
  throw new Error("Eval-manifest має містити щонайменше 12 перевірок.");
}

const allowedModes = new Set(["dry", "scene", "chaos", "normal", "boundary"]);
const requiredModes = ["dry", "scene", "chaos", "normal"];
const ids = new Set();
const names = new Set();
const coveredModes = new Set();

for (const evaluation of manifest.evals) {
  if (!Number.isInteger(evaluation.id) || ids.has(evaluation.id)) {
    throw new Error("Кожен eval повинен мати унікальний цілочисельний id.");
  }
  ids.add(evaluation.id);

  if (typeof evaluation.name !== "string" || !evaluation.name.trim() || names.has(evaluation.name)) {
    throw new Error("Кожен eval повинен мати унікальне непорожнє name.");
  }
  names.add(evaluation.name);

  if (!allowedModes.has(evaluation.mode)) {
    throw new Error("Невідомий режим eval: " + evaluation.mode);
  }
  coveredModes.add(evaluation.mode);

  if (typeof evaluation.prompt !== "string" || !evaluation.prompt.trim()) {
    throw new Error("Eval " + evaluation.name + " не має prompt.");
  }

  if (!Array.isArray(evaluation.expectations) || evaluation.expectations.length < 3) {
    throw new Error("Eval " + evaluation.name + " має містити щонайменше три expectations.");
  }
}

for (const mode of requiredModes) {
  if (!coveredModes.has(mode)) {
    throw new Error("Eval-manifest не покриває обов’язковий режим: " + mode);
  }
}
if (!coveredModes.has("boundary")) {
  throw new Error("Eval-manifest має містити boundary-перевірки.");
}

const contracts = JSON.parse(fs.readFileSync("evals/mode-contracts.json", "utf8"));
if (contracts.skill_name !== "absurd" || contracts.schema_version !== 1) {
  throw new Error("Неправильний mode-contract manifest.");
}
for (const mode of requiredModes) {
  const contract = contracts.modes?.[mode];
  if (!contract) {
    throw new Error("Відсутній контракт режиму: " + mode);
  }
  if (!Array.isArray(contract.escalation_steps_target) || contract.escalation_steps_target.length !== 2) {
    throw new Error("Режим " + mode + " не має escalation_steps_target [min,max].");
  }
}
if (contracts.modes.dry.requires_causality !== true || contracts.modes.scene.requires_causality !== true || contracts.modes.chaos.requires_causality !== true) {
  throw new Error("Творчі режими повинні вимагати причинність.");
}
if (contracts.modes.normal.escalation_steps_target[1] !== 0) {
  throw new Error("normal не повинен мати абсурдну ескалацію.");
}

const matrix = JSON.parse(fs.readFileSync("evals/cross-model-matrix.json", "utf8"));
if (matrix.skill_name !== "absurd" || matrix.schema_version !== 1) {
  throw new Error("Неправильний cross-model matrix manifest.");
}
const environmentIds = new Set((matrix.environments || []).map((environment) => environment.id));
for (const environment of ["codex", "claude-code"]) {
  if (!environmentIds.has(environment)) {
    throw new Error("Cross-model matrix не містить середовище: " + environment);
  }
}
if (!Array.isArray(matrix.cases) || matrix.cases.length < 6) {
  throw new Error("Cross-model matrix має містити щонайменше 6 обов’язкових кейсів.");
}
const requiredMatrixModes = new Set(["dry", "scene", "chaos", "normal", "boundary"]);
const matrixModes = new Set();
for (const testCase of matrix.cases) {
  if (!ids.has(testCase.eval_id)) {
    throw new Error("Cross-model matrix посилається на невідомий eval_id: " + testCase.eval_id);
  }
  matrixModes.add(testCase.mode);
  for (const environment of ["codex", "claude-code"]) {
    const result = testCase.results?.[environment];
    if (!new Set(["pending", "pass", "fail"]).has(result)) {
      throw new Error("Невідомий результат " + environment + " для eval " + testCase.eval_id + ": " + result);
    }
  }
}
for (const mode of requiredMatrixModes) {
  if (!matrixModes.has(mode)) {
    throw new Error("Cross-model matrix не покриває режим: " + mode);
  }
}

for (const file of ["install-absurd.sh", "install-absurd-codex.sh"]) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes("ABSURD_REF") || !text.includes("tsutsman/absurd")) {
    throw new Error("Інсталятор не прив’язаний до standalone-репозиторію: " + file);
  }
}

console.log("OK: АБСУРД валідний; mode contracts і cross-model matrix структурно коректні.");
