# Как перенести правки в свой GitHub

Изменения подготовлены в отдельной ветке `refactor/game-structure` от `main`, исходный коммит `3186059b6c07881b5bbe3b2f6017dd327aea5bcf`. На GitHub изменения автоматически не отправлялись. Git-bundle содержит ветку с историей правок, включая удаления и переименования.

## Рекомендуемый способ: импорт ветки из bundle

Положи файл `coin-raid-refactor.bundle` рядом с папкой своего клона `coin-raid`. В терминале открой сам репозиторий. Если рабочая папка содержит твои незакоммиченные изменения, сначала сохрани их в собственной ветке; команды ниже предполагают чистое рабочее дерево.

```bash
git status
git fetch origin
git fetch ../coin-raid-refactor.bundle refactor/game-structure
git switch -c refactor/game-structure FETCH_HEAD
```

`git fetch` из bundle импортирует подготовленный коммит. `git switch` создаёт локальную ветку с этим кодом. Если ветка с таким именем уже существует, используй свободное имя, например `refactor/game-structure-review`, в команде `git switch -c`.

Если после исходного коммита ты уже менял `main`, сначала включи новые изменения основной ветки:

```bash
git merge origin/main
```

При конфликтах не подменяй новую папку `src/game` целиком старой. Сопоставление прежних и новых файлов приведено ниже. Например, новый код попаданий следует сравнивать с `combat/CombatSystem.ts`, даже если раньше он находился в `GameScene.ts`. После разрешения конфликтов заверши слияние и повтори проверки.

```bash
npm ci
npm run verify
npx playwright install chromium
npm run test:browser
git diff --stat origin/main...HEAD
git status
```

Если ты разрешал конфликты или менял код после импорта, сначала выполни `npm run format` и `npm run docs:map`, затем повтори проверки. Добавь исправленные исходники, карту и обновлённые сборки в коммит. В уже подготовленной ветке эти файлы включены.

Отправь ветку и открой Pull Request в `main`:

```bash
git push -u origin HEAD
```

GitHub покажет ссылку для создания Pull Request. Готовое описание находится в [PULL_REQUEST.md](PULL_REQUEST.md). Проверь вкладку Files changed и результат Check game, затем выполни Merge pull request. Удалить временную ветку можно после успешного слияния. `main` до этого сохраняет прежнюю версию игры.

Если проверки после импорта ничего не изменили, дополнительный коммит не нужен. Сборка должна воспроизводиться из уже включённых исходников.

## Если нужен отдельный проект без импорта истории

Распакуй `coin-raid-structured.zip` в новую пустую папку. Для игры открой `PLAY.html`, для разработки выполни `npm ci` и `npm run dev`, для навигации открой `guide/index.html`.

Не распаковывай архив поверх старой папки `src/game`: обычное копирование не удаляет прежние модули. Для существующего Git-репозитория импорт bundle предпочтительнее, поскольку Git применяет предусмотренные удаления вместе с новыми файлами.

## Что удалено и что сохраняется

| Объект                                                         | Действие и причина                                                                 |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 96 файлов с окончанием `:Zone.Identifier`                      | Удалены из Git; содержали служебную метку Windows, не использовались игрой         |
| Старые плоские `src/game/*.ts`                                 | Перенесены в тематические папки; их прежние копии удалены, импорты обновлены       |
| `src/game/GameScene.ts`                                        | Сохранён как координатор сцены, большая часть методов вынесена в системы           |
| Старые файлы движка и CSS в `docs/assets/`                     | Заменены результатом свежей сборки; имена содержат хеш содержимого                 |
| `play/` и `PLAY.html`                                          | Пересобраны вместе; ресурсы и запускающий файл образуют один комплект              |
| `src/assets/`                                                  | Сохранены исходные изображения и музыка                                            |
| `ASSET_CREDITS.md`, `LICENSE`                                  | Сохранены авторство и лицензии                                                     |
| `docs/`                                                        | Сохранён для существующей схемы публикации GitHub Pages из папки `/docs`           |
| `node_modules/`, `dist/`, `.offline-build/`, результаты тестов | Не должны попадать в Git; воспроизводятся командами и исключены через `.gitignore` |

В `docs/` нельзя вручную править игровой JavaScript: следующая сборка заменит его. Изменяй TypeScript внутри `src/`, затем пересобирай. Не удаляй `docs/` из репозитория без перенастройки существующей публикации Pages.

## Куда перенесены прежние модули

| Было в `src/game/`   | Стало в `src/game/`                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `config.ts`          | `createGame.ts`                                                                                                         |
| `combat.ts`          | `combat/CombatRules.ts`; выполнение — `combat/CombatSystem.ts`, `player/PlayerController.ts`, `combat/CombatEffects.ts` |
| `boss.ts`            | `enemies/BossPatterns.ts`; выполнение — `enemies/BossSystem.ts`                                                         |
| `regions.ts`         | `world/WorldConfig.ts`                                                                                                  |
| `world.ts`           | `world/Navigation.ts`                                                                                                   |
| `events.ts`          | `world/WeatherSystem.ts`                                                                                                |
| `progression.ts`     | `progression/PlayerProgression.ts`                                                                                      |
| `skills.ts`          | `progression/Skills.ts`                                                                                                 |
| `achievements.ts`    | `progression/Achievements.ts`                                                                                           |
| `quests.ts`          | `quests/TrialsAndLoot.ts`; выполнение — `quests/QuestSystem.ts`                                                         |
| `journal.ts`         | `quests/Journal.ts`                                                                                                     |
| `story.ts`           | `story/StoryContent.ts`; выполнение — `story/StorySystem.ts`                                                            |
| `learning.ts`        | `story/TutorialContent.ts`; выполнение — `story/TutorialSystem.ts`                                                      |
| `residents.ts`       | `village/Residents.ts`                                                                                                  |
| `village.ts`         | `village/VillageLayout.ts`; выполнение — `village/VillageSystem.ts`                                                     |
| `save.ts`            | `persistence/SaveSchema.ts`; выполнение — `persistence/SaveSystem.ts`                                                   |
| `art.ts`             | `rendering/TextureFactory.ts`                                                                                           |
| `mood.ts`            | `rendering/Atmosphere.ts`                                                                                               |
| `weaponAnimation.ts` | `rendering/WeaponAnimation.ts`                                                                                          |
| `audio.ts`           | `audio/GameAudio.ts`                                                                                                    |
| `soundtrack.ts`      | `audio/Soundtrack.ts`                                                                                                   |

В GitHub некоторые переносы могут отображаться как удаление и создание: форматирование изменило почти каждую строку. Это способ показа diff. При проверке содержания полезно включить Hide whitespace; для вынесенных методов ориентируйся на [SOURCE_INDEX.md](SOURCE_INDEX.md) и карту проекта.
