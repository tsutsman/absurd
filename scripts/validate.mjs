import fs from "node:fs";

const requiredFiles = [
  "README.md",
  "skills/absurd/SKILL.md",
  "output-styles/absurd.md",
  "commands/absurd.md",
  "codex/AGENTS-absurd.md",
  "evals/absurd.json",
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
if (!Array.isArray(manifest.evals) || manifest.evals.length < 3) {
  throw new Error("Eval-manifest має містити щонайменше три перевірки.");
}

for (const file of ["install-absurd.sh", "install-absurd-codex.sh"]) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes("ABSURD_REF") || !text.includes("tsutsman/absurd")) {
    throw new Error("Інсталятор не прив’язаний до standalone-репозиторію: " + file);
  }
}

console.log("OK: standalone-пакунок АБСУРД валідний.");
