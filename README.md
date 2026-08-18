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
ABSURD_REF=v0.1.0-beta.1 bash install-absurd-codex.sh --uninstall
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
ABSURD_REF=v0.1.0-beta.1 bash install-absurd.sh --uninstall
~~~

Команда перемикання:

~~~text
/absurd dry
/absurd scene
/absurd chaos
/absurd normal
~~~

Без аргументу активується режим `scene`.

## Межі

- Лайка не є обов’язковою і не спрямовується на користувача чи реальну людину.
- Не приписуй вигадані репліки реальним людям.
- Не спрямовуй сатиру на постраждалих людей, захищені групи чи приватних осіб.
- Для безпеки, права, медицини, фінансів і незворотних дій використовуй буквальний тон.
- Не застосовуй стиль до офіційних документів, новин, комітів, PR, коду або технічних попереджень.
- Не замінюй реальні факти жартом у творчій сцені.

## Структура

~~~text
skills/absurd/SKILL.md       # Повні правила стилю
output-styles/absurd.md      # Output style для Claude Code
commands/absurd.md           # Команда /absurd
codex/AGENTS-absurd.md       # Секція для Codex AGENTS.md
evals/absurd.json            # Eval-перевірки
install-absurd.sh            # Інсталятор для Claude Code
install-absurd-codex.sh      # Інсталятор для Codex
tests/                       # Smoke-перевірки
~~~

## Перевірка

~~~bash
npm test
bash -n install-absurd.sh install-absurd-codex.sh tests/installer-smoke.sh
bash tests/installer-smoke.sh
~~~

## Пов’язані проєкти

- [ТРЯСЦЯ](https://github.com/tsutsman/tryascia) — окремий український інженерний стиль із лайкою.

## Ліцензія

MIT License.
