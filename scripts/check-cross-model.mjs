import fs from "node:fs";

const requirePass = process.argv.includes("--require-pass");
const matrix = JSON.parse(fs.readFileSync("evals/cross-model-matrix.json", "utf8"));
const environments = (matrix.environments || []).map((environment) => environment.id);
const summary = { pending: 0, pass: 0, fail: 0 };

if (environments.length === 0) {
  throw new Error("Cross-model matrix не містить runtime environments.");
}

for (const testCase of matrix.cases || []) {
  for (const environment of environments) {
    const result = testCase.results?.[environment];
    if (!(result in summary)) {
      throw new Error(`Невідомий результат ${environment} для eval ${testCase.eval_id}: ${result}`);
    }
    summary[result] += 1;
  }
}

const total = summary.pending + summary.pass + summary.fail;
console.log(`Cross-model matrix (${environments.length} runtimes, ${total} cells): pass=${summary.pass}, fail=${summary.fail}, pending=${summary.pending}`);

if (requirePass && (summary.fail > 0 || summary.pending > 0)) {
  throw new Error("Cross-model gate не пройдено: для release потрібні лише pass без fail/pending.");
}

if (!requirePass && summary.pending > 0) {
  console.log("INFO: runtime-перевірки ще не завершені; це допустимо поза release-gate.");
}
