# АБСУРД

Окремий український абсурдистський сценічний стиль для AI-агентів.

> Конкретна сцена, серйозне правило, поступова ескалація — і фінал, який робить вигляд, що так і було задумано.

**Творчий пакунок · вигадані сцени · діалоги · гротеск · v0.1.0-beta.1**

## Що це

АБСУРД — самостійний творчий стиль для вигаданих діалогів, коротких п’єс, монологів, сценічних мініатюр і соціальної сатири.

Він використовує високорівневі риси абсурдистської драматургії:

- театральність і короткі сценічні ремарки;
- сухий контраст між офіційним, побутовим і філософським;
- чорний гумор і соціальну сатиру;
- серйозне ставлення персонажів до нелогічного правила;
- послідовну ескалацію: дивина → правило → наслідок → злам правила.

Це не копіювання текстів, персонажів, сюжетів або впізнаваної індивідуальної манери конкретного автора.

## Підтримувані agent runtimes

| Runtime | Інтеграція | Статус |
|---|---|---|
| Codex | `AGENTS.md` | підтримується |
| Claude Code | output style + skill + `/absurd` | підтримується |
| Hermes Agent | AgentSkills `SKILL.md` | підтримується |
| OpenClaw | shared AgentSkills `SKILL.md` | підтримується |

Runtime support означає, що пакунок має штатний спосіб встановлення та smoke-тест. Поведінкова сумісність перевіряється окремо через `evals/cross-model-matrix.json`; до `v0.1.0-beta.2` матриця має 6 eval × 4 runtime = 24 комірки.

## Режими

| Режим | Поведінка |
|---|---|
| `dry` | Сухий deadpan, короткі репліки, мінімум ремарок |
| `scene` | Повноцінна коротка сценка, типовий режим |
| `chaos` | Наростання гротеску з чітким фінальним поворотом |
| `normal` | Вимкнути стиль |

## Швидкий старт

Використовуй релізний тег або конкретний commit SHA. Гілка `main` придатна лише для тестування.

### Codex

~~~bash
export ABSURD_REF=v0.1.0-beta.1
curl -fsSL "https://raw.githubusercontent.com/tsutsman/absurd/${ABSURD_REF}/install-absurd-codex.sh" -o /tmp/absurd-install-codex.sh
ABSURD_REF="$ABSURD_REF" bash /tmp/absurd-install-codex.sh
rm -f /tmp/absurd-install-codex.sh
~~~

Видалення:

~~~bash
bash install-absurd-codex.sh --uninstall
~~~

### Claude Code

~~~bash
export ABSURD_REF=v0.1.0-beta.1
curl -fsSL "https://raw.githubusercontent.com/tsutsman/absurd/${ABSURD_REF}/install-absurd.sh" -o /tmp/absurd-install.sh
ABSURD_REF="$ABSURD_REF" bash /tmp/absurd-install.sh
rm -f /tmp/absurd-install.sh
~~~

Вибери output style АБСУРД або перезапусти Claude Code після інсталяції.

Видалення:

~~~bash
bash install-absurd.sh --uninstall
~~~

### Hermes Agent

~~~bash
export ABSURD_REF=v0.1.0-beta.1
curl -fsSL "https://raw.githubusercontent.com/tsutsman/absurd/${ABSURD_REF}/install-absurd-hermes.sh" -o /tmp/absurd-install-hermes.sh
ABSURD_REF="$ABSURD_REF" bash /tmp/absurd-install-hermes.sh
rm -f /tmp/absurd-install-hermes.sh
~~~

За замовчуванням skill встановлюється у `~/.hermes/skills/absurd/`. Інший каталог можна задати через `TARGET_HERMES_SKILLS_DIR`.

Видалення:

~~~bash
bash install-absurd-hermes.sh --uninstall
~~~

### OpenClaw

~~~bash
export ABSURD_REF=v0.1.0-beta.1
curl -fsSL "https://raw.githubusercontent.com/tsutsman/absurd/${ABSURD_REF}/install-absurd-openclaw.sh" -o /tmp/absurd-install-openclaw.sh
ABSURD_REF="$ABSURD_REF" bash /tmp/absurd-install-openclaw.sh
rm -f /tmp/absurd-install-openclaw.sh
~~~

За замовчуванням skill встановлюється у shared-каталог `~/.openclaw/skills/absurd/`. Якщо задано `OPENCLAW_STATE_DIR`, використовується `${OPENCLAW_STATE_DIR}/skills/absurd/`. Для окремого workspace можна задати `TARGET_OPENCLAW_SKILLS_DIR`.

Якщо репозиторій уже клоновано, доступний і native local install:

~~~bash
openclaw skills install ./skills/absurd --as absurd --global
~~~

Видалення інсталяції, створеної нашим standalone-інсталятором:

~~~bash
bash install-absurd-openclaw.sh --uninstall
~~~

Команда `openclaw skills install git:tsutsman/absurd@<ref>` для цього репозиторію не використовується: OpenClaw очікує `SKILL.md` у корені Git-джерела, а АБСУРД навмисно тримає єдине джерело правил у `skills/absurd/SKILL.md`.

Деталі інтеграцій: `docs/runtime-integrations.md`.

## Перемикання режиму

У середовищах, де доступна slash-команда АБСУРДУ:

~~~text
/absurd dry
/absurd scene
/absurd chaos
/absurd normal
~~~

Без аргументу типовим є режим `scene`. В AgentSkills-only середовищах режим можна вказувати прямо у запиті відповідно до контрактів `skills/absurd/SKILL.md`.

## Межі

- Лайка не є обов’язковою і не спрямовується на користувача чи реальну людину.
- Не приписуй вигадані репліки реальним людям.
- Не спрямовуй сатиру на постраждалих людей, захищені групи чи приватних осіб.
- Для безпеки, права, медицини, фінансів і незворотних дій використовуй буквальний тон.
- Не застосовуй стиль до офіційних документів, новин, комітів, PR, коду або технічних попереджень.
- Не замінюй реальні факти жартом у творчій сцені.

## Структура

~~~text
skills/absurd/SKILL.md          # Єдине джерело повних правил стилю
output-styles/absurd.md         # Output style для Claude Code
commands/absurd.md              # Команда /absurd для Claude Code
codex/AGENTS-absurd.md          # Секція для Codex AGENTS.md
evals/absurd.json               # Eval-перевірки
evals/cross-model-matrix.json   # 4-runtime release matrix
install-absurd.sh               # Інсталятор для Claude Code
install-absurd-codex.sh         # Інсталятор для Codex
install-absurd-hermes.sh        # Інсталятор для Hermes Agent
install-absurd-openclaw.sh      # Інсталятор для OpenClaw
docs/runtime-integrations.md    # Контракти runtime integrations
tests/                          # Smoke-перевірки
~~~

## Перевірка

~~~bash
npm test
bash -n install-absurd.sh install-absurd-codex.sh install-absurd-hermes.sh install-absurd-openclaw.sh tests/installer-smoke.sh
bash tests/installer-smoke.sh
npm run cross-model:status
~~~

Release gate:

~~~bash
npm run cross-model:gate
~~~

Gate проходить лише коли всі обов’язкові runtime-комірки мають фактичний `pass`.

## Пов’язані проєкти

- [ТРЯСЦЯ](https://github.com/tsutsman/tryascia) — окремий український інженерний стиль із лайкою.

## Ліцензія

MIT License.
