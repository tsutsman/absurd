#!/usr/bin/env bash
# Димова перевірка standalone-інсталяторів АБСУРД.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf -- "$WORK_DIR"' EXIT

CODEX_DIR="$WORK_DIR/codex"
CLAUDE_DIR="$WORK_DIR/claude"

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
TARGET_CLAUDE_DIR="$CLAUDE_DIR" bash "$ROOT_DIR/install-absurd.sh" --uninstall
test ! -e "$CLAUDE_DIR/output-styles/absurd.md"
test ! -e "$CLAUDE_DIR/skills/absurd/SKILL.md"

echo "OK: standalone Codex/Claude Code інсталятори АБСУРД пройшли smoke-перевірку."
