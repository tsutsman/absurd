#!/usr/bin/env bash
# Димова перевірка standalone-інсталяторів АБСУРД.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf -- "$WORK_DIR"' EXIT

CODEX_DIR="$WORK_DIR/codex"
CLAUDE_DIR="$WORK_DIR/claude"
HERMES_SKILLS_DIR="$WORK_DIR/hermes/skills"
OPENCLAW_SKILLS_DIR="$WORK_DIR/openclaw/skills"

mkdir -p "$CODEX_DIR"
printf '# Існуючі правила\n' > "$CODEX_DIR/AGENTS.md"

TARGET_CODEX_DIR="$CODEX_DIR" bash "$ROOT_DIR/install-absurd-codex.sh"
grep -Fq "<!-- absurd:start -->" "$CODEX_DIR/AGENTS.md"
test "$(grep -Fc "<!-- absurd:start -->" "$CODEX_DIR/AGENTS.md")" -eq 1

TARGET_CODEX_DIR="$CODEX_DIR" bash "$ROOT_DIR/install-absurd-codex.sh"
test "$(grep -Fc "<!-- absurd:start -->" "$CODEX_DIR/AGENTS.md")" -eq 1

TARGET_CODEX_DIR="$CODEX_DIR" bash "$ROOT_DIR/install-absurd-codex.sh" --uninstall
grep -Fq "# Існуючі правила" "$CODEX_DIR/AGENTS.md"
if grep -Fq "<!-- absurd:start -->" "$CODEX_DIR/AGENTS.md"; then
  echo "Помилка: блок АБСУРД для Codex не видалено." >&2
  exit 1
fi

TARGET_CLAUDE_DIR="$CLAUDE_DIR" bash "$ROOT_DIR/install-absurd.sh"
test -s "$CLAUDE_DIR/output-styles/absurd.md"
test -s "$CLAUDE_DIR/skills/absurd/SKILL.md"
grep -Fq "user-invocable: true" "$CLAUDE_DIR/skills/absurd/SKILL.md"
TARGET_CLAUDE_DIR="$CLAUDE_DIR" bash "$ROOT_DIR/install-absurd.sh" --uninstall
test ! -e "$CLAUDE_DIR/output-styles/absurd.md"
test ! -e "$CLAUDE_DIR/skills/absurd/SKILL.md"

TARGET_HERMES_SKILLS_DIR="$HERMES_SKILLS_DIR" bash "$ROOT_DIR/install-absurd-hermes.sh"
test -s "$HERMES_SKILLS_DIR/absurd/SKILL.md"
grep -Fq "name: absurd" "$HERMES_SKILLS_DIR/absurd/SKILL.md"
grep -Fq "user-invocable: true" "$HERMES_SKILLS_DIR/absurd/SKILL.md"
TARGET_HERMES_SKILLS_DIR="$HERMES_SKILLS_DIR" bash "$ROOT_DIR/install-absurd-hermes.sh" --uninstall
test ! -e "$HERMES_SKILLS_DIR/absurd"

TARGET_OPENCLAW_SKILLS_DIR="$OPENCLAW_SKILLS_DIR" bash "$ROOT_DIR/install-absurd-openclaw.sh"
test -s "$OPENCLAW_SKILLS_DIR/absurd/SKILL.md"
grep -Fq "name: absurd" "$OPENCLAW_SKILLS_DIR/absurd/SKILL.md"
grep -Fq "user-invocable: true" "$OPENCLAW_SKILLS_DIR/absurd/SKILL.md"
TARGET_OPENCLAW_SKILLS_DIR="$OPENCLAW_SKILLS_DIR" bash "$ROOT_DIR/install-absurd-openclaw.sh" --uninstall
test ! -e "$OPENCLAW_SKILLS_DIR/absurd"

echo "OK: Codex, Claude Code, Hermes Agent і OpenClaw інсталятори АБСУРД пройшли smoke-перевірку."
