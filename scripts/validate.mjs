import fs from "node:fs";

const requiredFiles = [
  "README.md",
  "skills/absurd/SKILL.md",
  "output-styles/absurd.md",
  "commands/absurd.md",
  "codex/AGENTS-absurd.md",
  "evals/absurd.json",
  "docs/style-principles.md",
  "docs/ukrainian-absurd.md",
  "docs/anti-patterns.md",
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

for (const file of ["install-absurd.sh", "install-absurd-codex.sh"]) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes("ABSURD_REF") || !text.includes("tsutsman/absurd")) {
    throw new Error("Інсталятор не прив’язаний до standalone-репозиторію: " + file);
  }
}

console.log("OK: standalone-пакунок АБСУРД валідний; eval coverage >= 12 і всі режими покриті.");
