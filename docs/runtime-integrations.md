# Runtime integrations

АБСУРД зберігає одне джерело правил у `skills/absurd/SKILL.md`. Інтеграції не повинні форкати або переписувати ці правила окремо без необхідності.

## Codex

Інтеграція: `codex/AGENTS-absurd.md` + `install-absurd-codex.sh`.

Інсталятор додає керований блок АБСУРД у `~/.codex/AGENTS.md` або каталог, заданий через `TARGET_CODEX_DIR`.

## Claude Code

Інтеграція: `output-styles/absurd.md`, `commands/absurd.md`, `skills/absurd/SKILL.md` + `install-absurd.sh`.

Інсталятор копіює output style і skill у `~/.claude/` або каталог, заданий через `TARGET_CLAUDE_DIR`.

## Hermes Agent

Hermes Agent використовує AgentSkills-сумісні `SKILL.md` і локальний каталог `~/.hermes/skills/` як основне сховище skills.

Інсталяція:

```bash
export ABSURD_REF=v0.1.0-beta.1
curl -fsSL "https://raw.githubusercontent.com/tsutsman/absurd/${ABSURD_REF}/install-absurd-hermes.sh" -o /tmp/absurd-install-hermes.sh
ABSURD_REF="$ABSURD_REF" bash /tmp/absurd-install-hermes.sh
rm -f /tmp/absurd-install-hermes.sh
```

Видалення:

```bash
bash install-absurd-hermes.sh --uninstall
```

Для тестів або нестандартного профілю каталог можна змінити через `TARGET_HERMES_SKILLS_DIR`.

## OpenClaw

OpenClaw підтримує AgentSkills-сумісні skills. Shared skills за замовчуванням доступні з `~/.openclaw/skills/`; якщо задано `OPENCLAW_STATE_DIR`, інсталятор використовує `${OPENCLAW_STATE_DIR}/skills`.

Інсталяція:

```bash
export ABSURD_REF=v0.1.0-beta.1
curl -fsSL "https://raw.githubusercontent.com/tsutsman/absurd/${ABSURD_REF}/install-absurd-openclaw.sh" -o /tmp/absurd-install-openclaw.sh
ABSURD_REF="$ABSURD_REF" bash /tmp/absurd-install-openclaw.sh
rm -f /tmp/absurd-install-openclaw.sh
```

Видалення:

```bash
bash install-absurd-openclaw.sh --uninstall
```

Для тестів або окремого workspace каталог можна змінити через `TARGET_OPENCLAW_SKILLS_DIR`.

OpenClaw native local install також працює з клонованого репозиторію, бо `skills/absurd/` має `SKILL.md` у корені skill-директорії:

```bash
openclaw skills install ./skills/absurd --as absurd --global
```

Не використовуй `openclaw skills install git:tsutsman/absurd@<ref>` для цього monorepo-layout: Git install очікує `SKILL.md` у корені Git-джерела, а в АБСУРД він навмисно зберігається у `skills/absurd/`.

## Інваріанти

- `skills/absurd/SKILL.md` — єдине джерело повних правил стилю.
- `ABSURD_REF` дозволяє інсталювати конкретний release tag або commit SHA.
- Усі інсталятори мають підтримувати повторний install без накопичення дублікатів і `--uninstall`.
- Runtime compatibility не вважається доведеною лише фактом копіювання skill; для release потрібні фактичні eval-прогони з `evals/cross-model-matrix.json`.
