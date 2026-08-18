# Cross-runtime testing АБСУРДУ

## Мета

Перевірити, що однакові режими АБСУРДУ поводяться достатньо однаково в Codex, Claude Code, Hermes Agent і OpenClaw та не деградують у random nonsense, надмірні ремарки або невимкнений стиль.

Джерело контрактів: `evals/mode-contracts.json`.
Матриця запусків: `evals/cross-model-matrix.json`.
Набір сценаріїв: `evals/absurd.json`.

Назва файлу `cross-model-matrix.json` збережена для сумісності, але фактично матриця тепер порівнює чотири agent runtimes. Hermes Agent і OpenClaw можуть працювати з різними underlying models, тому під час реального прогону треба фіксувати runtime version, model/provider і commit/tag АБСУРДУ.

## Правило чесності

Статус `pass` можна ставити лише після реального запуску конкретного eval у конкретному runtime. Не допускається заповнювати матрицю на підставі припущення, документації або відповіді іншої моделі.

## Runtime targets

- `codex` — інтеграція через `codex/AGENTS-absurd.md`;
- `claude-code` — `output-styles/absurd.md` + `commands/absurd.md`;
- `hermes-agent` — `skills/absurd/SKILL.md` через `install-absurd-hermes.sh`;
- `openclaw` — `skills/absurd/SKILL.md` через `install-absurd-openclaw.sh`.

## Набір обов’язкових кейсів

| Eval | Режим | Що перевіряємо |
|---|---|---|
| #4 `dry-deadpan` | `dry` | короткі репліки, мінімум ремарок |
| #6 `scene-conflict` | `scene` | місце, конфлікт, 2–4 причинні сходинки |
| #8 `chaos-causal-escalation` | `chaos` | сильний гротеск без втрати причинності |
| #10 `normal-mode-off` | `normal` | повне вимкнення стилю |
| #11 `factual-boundary` | boundary | пріоритет фактів над стилем |
| #12 `author-imitation-boundary` | boundary | відсутність імітації конкретного автора |

## Протокол запуску

Для кожного середовища:

1. Встановити АБСУРД з одного й того самого commit SHA або release tag.
2. Зафіксувати runtime version і underlying model/provider, якщо runtime дозволяє їх змінювати.
3. Запустити кожен обов’язковий eval без додаткових підказок, які змінюють поведінку стилю.
4. Зберегти сирий output або посилання на артефакт запуску.
5. Оцінити відповідь за `expectations` відповідного eval і контрактом режиму.
6. Внести у `evals/cross-model-matrix.json` `pass` або `fail` та коротку примітку.
7. Якщо є `fail`, виправляти інтеграцію або контракт, а не підганяти конкретний prompt під модель.

## Критерії режимів

### `dry`

- 70–90% тексту — репліки;
- 1–2 сходинки ескалації;
- одна центральна дивина;
- ремарок мало або немає;
- фінал короткий і сухий.

### `scene`

- є конкретне місце або предмет конфлікту;
- 2–4 причинні сходинки;
- ремарки короткі;
- фінальний злам змінює значення початкової умови.

### `chaos`

- інтенсивність вища, ніж у `scene`;
- 3–6 причинних сходинок;
- усі великі події залишаються на одній причинній осі;
- випадкові непов’язані сутності є fail.

### `normal`

- відсутні непрохані персонажі й ремарки;
- немає абсурдної ескалації;
- фактична/технічна відповідь пряма.

## Поточна матриця

| Runtime | dry | scene | chaos | normal | factual boundary | author boundary |
|---|---:|---:|---:|---:|---:|---:|
| Codex | pending | pending | pending | pending | pending | pending |
| Claude Code | pending | pending | pending | pending | pending | pending |
| Hermes Agent | pending | pending | pending | pending | pending | pending |
| OpenClaw | pending | pending | pending | pending | pending | pending |

`pending` означає: runtime ще не був реально запущений у цьому циклі перевірки.

## DoD для issue #4

- усі 24 комірки матриці мають фактичний `pass`/`fail`;
- усі `fail` або виправлені, або явно прийняті з обґрунтуванням;
- `normal` не залишає стилістичних артефактів;
- `dry`, `scene`, `chaos` відрізняються структурою, а не лише назвою;
- для Hermes/OpenClaw зафіксовано underlying model/provider;
- `npm test` і installer smoke залишаються зеленими.
