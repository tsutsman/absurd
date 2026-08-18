#!/usr/bin/env bash
# Інсталяція творчого стилю АБСУРД для Codex.

set -euo pipefail

TARGET_CODEX_DIR="${TARGET_CODEX_DIR:-${HOME}/.codex}"
ABSURD_REF="${ABSURD_REF:-main}"
RAW_BASE="${RAW_BASE:-https://raw.githubusercontent.com/tsutsman/absurd/${ABSURD_REF}}"
MODE="${1:-install}"

case "$MODE" in
  install|--uninstall)
    ;;
  *)
    echo "Використання: $0 [--uninstall]" >&2
    exit 2
    ;;
esac

command -v python3 >/dev/null 2>&1 || { echo "Потрібен python3" >&2; exit 1; }

if [ "$MODE" = "--uninstall" ]; then
  python3 - "$TARGET_CODEX_DIR" <<'PY'
import os, re, sys

target_dir = sys.argv[1]
agents_path = os.path.join(target_dir, "AGENTS.md")
if os.path.exists(agents_path):
    with open(agents_path, encoding="utf-8") as handle:
        text = handle.read()
    text = re.sub(r"\n?<!-- absurd:start -->.*?<!-- absurd:end -->\n?", "\n", text, flags=re.S)
    with open(agents_path, "w", encoding="utf-8") as handle:
        handle.write(text)
print("Стиль АБСУРД видалено з Codex.")
PY
  exit 0
fi

TMP_SECTION="$(mktemp)"
cleanup() { rm -f "$TMP_SECTION"; }
trap cleanup EXIT

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/codex/AGENTS-absurd.md" ]; then
  cp "$SCRIPT_DIR/codex/AGENTS-absurd.md" "$TMP_SECTION"
else
  curl -fsSL "$RAW_BASE/codex/AGENTS-absurd.md" -o "$TMP_SECTION"
fi

python3 - "$TARGET_CODEX_DIR" "$TMP_SECTION" <<'PY'
import os, re, sys

target_dir, section_path = sys.argv[1:]
agents_path = os.path.join(target_dir, "AGENTS.md")
with open(section_path, encoding="utf-8") as handle:
    section = handle.read().strip()
text = ""
if os.path.exists(agents_path):
    with open(agents_path, encoding="utf-8") as handle:
        text = handle.read()
if "<!-- absurd:start -->" in text:
    text = re.sub(r"<!-- absurd:start -->.*?<!-- absurd:end -->", section, text, flags=re.S)
else:
    text = (text.rstrip() + "\n\n" if text.strip() else "") + section + "\n"
with open(agents_path, "w", encoding="utf-8") as handle:
    handle.write(text)
PY

echo "Готово. Стиль АБСУРД підключено до Codex."
