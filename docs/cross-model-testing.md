# Cross-model testing АБСУРДУ

## Мета

Перевірити, що однакові режими АБСУРДУ поводяться достатньо однаково в Codex, Claude Code, Hermes Agent і OpenClaw та не деградують у random nonsense, надмірні ремарки або невимкнений стиль.

Джерело контрактів: `evals/mode-contracts.json`.
Матриця запусків: `evals/cross-model-matrix.json`.
Набір сценаріїв: `evals/absurd.json`.

## Правило чесності

Статус `pass` можна ставити лише після реального запуску конкретного eval у конкретному runtime. Не допускається заповнювати матрицю на підставі припущення, документації або відповіді іншої моделі.

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
2. Запустити кожен обов’язковий eval без додаткових творчих підказок, які змінюють поведінку стилю.
3. Зберегти сирий output або посилання на artifact запуску.
4. Зафіксувати runtime version і, де runtime сам обирає provider/model, фактичний або запитаний provider/model.
5. Оцінити відповідь за `expectations` відповідного eval і контрактом режиму.
6. Внести у `evals/cross-model-matrix.json` `pass` або `fail` та коротку примітку.
7. Якщо є `fail`, виправляти інтеграцію або контракт, а не підганяти конкретний prompt під модель.

## Transport adapters

Eval-manifest зберігає користувацьку форму `/absurd <mode> ...`, але не кожен headless transport дозволяє передавати slash-команди як повідомлення.

- **Codex** — отримує eval prompt напряму; правила доставляються через `AGENTS.md`.
- **Claude Code** — отримує eval prompt напряму; стиль доставляється через output style або точний fallback system prompt.
- **Hermes Agent** — skill `absurd` preload-иться через `--skills absurd`; якщо prompt починається з `/absurd <mode>`, runtime harness замінює лише transport prefix на `Use the installed "absurd" skill in <mode> mode.` і залишає решту eval без змін.
- **OpenClaw** — skill встановлюється у shared skill root; `agent exec` не використовується для інтерактивних slash-команд, тому застосовується той самий transport adapter, що й для Hermes.

Це не нова творча підказка і не зміна expectation: adapter лише переводить інтерактивну slash-форму у headless skill-preload форму. У `summary.json` і для кожного case фіксується, чи prompt був адаптований.

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

`pending` означає: runtime ще не був реально запущений у цьому циклі перевірки або модельний виклик був заблокований відсутніми credentials.

## DoD для issue #4

- усі 24 комірки матриці мають фактичний `pass`/`fail`;
- усі `fail` або виправлені, або явно прийняті з обґрунтуванням;
- для Hermes Agent/OpenClaw зафіксовані runtime version і underlying provider/model;
- `normal` не залишає стилістичних артефактів;
- `dry`, `scene`, `chaos` відрізняються структурою, а не лише назвою;
- `npm test` і installer smoke залишаються зеленими.
