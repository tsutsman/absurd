#!/usr/bin/env bash
# Інсталяція творчого стилю АБСУРД для Claude Code.

set -euo pipefail

TARGET_CLAUDE_DIR="${TARGET_CLAUDE_DIR:-${HOME}/.claude}"
ABSURD_REF="${ABSURD_REF:-main}"
RAW_BASE="${RAW_BASE:-https://raw.githubusercontent.com/tsutsman/absurd/${ABSURD_REF}}"
MODE="${1:-install}"

case "$MODE" in
  install)
    ;;
  --uninstall)
    rm -f \
      "$TARGET_CLAUDE_DIR/output-styles/absurd.md" \
      "$TARGET_CLAUDE_DIR/skills/absurd/SKILL.md"
    rmdir "$TARGET_CLAUDE_DIR/skills/absurd" 2>/dev/null || true
    echo "Стиль АБСУРД видалено з Claude Code."
    exit 0
    ;;
  *)
    echo "Використання: $0 [--uninstall]" >&2
    exit 2
    ;;
esac

mkdir -p "$TARGET_CLAUDE_DIR/output-styles" "$TARGET_CLAUDE_DIR/skills/absurd"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/output-styles/absurd.md" ]; then
  cp "$SCRIPT_DIR/output-styles/absurd.md" "$TARGET_CLAUDE_DIR/output-styles/absurd.md"
  cp "$SCRIPT_DIR/skills/absurd/SKILL.md" "$TARGET_CLAUDE_DIR/skills/absurd/SKILL.md"
else
  curl -fsSL "$RAW_BASE/output-styles/absurd.md" -o "$TARGET_CLAUDE_DIR/output-styles/absurd.md"
  curl -fsSL "$RAW_BASE/skills/absurd/SKILL.md" -o "$TARGET_CLAUDE_DIR/skills/absurd/SKILL.md"
fi

echo "Готово. Обери output style АБСУРД або перезапусти Claude Code."
