#!/usr/bin/env bash
# Інсталяція творчого skill АБСУРД для Hermes Agent.

set -euo pipefail

TARGET_HERMES_SKILLS_DIR="${TARGET_HERMES_SKILLS_DIR:-${HOME}/.hermes/skills}"
ABSURD_REF="${ABSURD_REF:-main}"
RAW_BASE="${RAW_BASE:-https://raw.githubusercontent.com/tsutsman/absurd/${ABSURD_REF}}"
MODE="${1:-install}"
SKILL_DIR="$TARGET_HERMES_SKILLS_DIR/absurd"

case "$MODE" in
  install)
    ;;
  --uninstall)
    rm -rf -- "$SKILL_DIR"
    echo "Стиль АБСУРД видалено з Hermes Agent."
    exit 0
    ;;
  *)
    echo "Використання: $0 [--uninstall]" >&2
    exit 2
    ;;
esac

mkdir -p "$SKILL_DIR"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -f "$SCRIPT_DIR/skills/absurd/SKILL.md" ]; then
  cp "$SCRIPT_DIR/skills/absurd/SKILL.md" "$SKILL_DIR/SKILL.md"
else
  command -v curl >/dev/null 2>&1 || { echo "Потрібен curl" >&2; exit 1; }
  curl -fsSL "$RAW_BASE/skills/absurd/SKILL.md" -o "$SKILL_DIR/SKILL.md"
fi

test -s "$SKILL_DIR/SKILL.md"
echo "Готово. АБСУРД встановлено для Hermes Agent: $SKILL_DIR"
