# Индекс исходников RAID COIN

Индекс создан из текущего кода командой `npm run docs:map`. В браузерной [карте проекта](index.html) можно искать механику, выбирать файл и читать код с номерами строк.

База изменений: `3186059b6c07881b5bbe3b2f6017dd327aea5bcf`.

## Запуск и состояние

### [src/game/core/JourneyState.ts](../src/game/core/JourneyState.ts)

Профиль, прогресс областей, задания и время текущего путешествия.

Строк: 39.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `JourneyState` | [9](../src/game/core/JourneyState.ts#L9) | Объявление в этом модуле. |
| `progress` | [10](../src/game/core/JourneyState.ts#L10) | Прогресс по биомам: сила, время, босс, очищение, доход и однократная награда. |
| `quests` | [11](../src/game/core/JourneyState.ts#L11) | Три испытания для каждого биома. |
| `campVisits` | [12](../src/game/core/JourneyState.ts#L12) | Индексы посещённых деревень, доступных для быстрого перехода. |
| `deliveries` | [13](../src/game/core/JourneyState.ts#L13) | Состояния доставок: принято, передано и награда получена. |
| `lines` | [14](../src/game/core/JourneyState.ts#L14) | Состояния сюжетных поручений: принятие, предметы и награды. |
| `lessonIndex` | [15](../src/game/core/JourneyState.ts#L15) | Номер текущего практического урока, начиная с нуля. |
| `lessonProgress` | [16](../src/game/core/JourneyState.ts#L16) | Количество зачтённых действий текущего урока. |
| `tutorialFinished` | [17](../src/game/core/JourneyState.ts#L17) | Завершены ли практические уроки. |
| `wantsTraining` | [18](../src/game/core/JourneyState.ts#L18) | Выбрано ли обучение при начале новой игры. |
| `storyClosing` | [19](../src/game/core/JourneyState.ts#L19) | Показывается финальная история, а не вступление. |
| `storyIndex` | [20](../src/game/core/JourneyState.ts#L20) | Номер текущего сюжетного кадра. |
| `storyTime` | [21](../src/game/core/JourneyState.ts#L21) | Сколько секунд показывается текущий кадр. |
| `dirty` | [22](../src/game/core/JourneyState.ts#L22) | Есть изменения, о которых нужно предупредить перед выходом без ручного сохранения. |
| `combatMusicLeft` | [23](../src/game/core/JourneyState.ts#L23) | Оставшееся время режима боевой музыки после исчезновения близкой угрозы. |
| `waveClock` | [24](../src/game/core/JourneyState.ts#L24) | Время до следующей волны обычных противников. |
| `waveNumber` | [25](../src/game/core/JourneyState.ts#L25) | Номер волны для выбора состава врагов. |
| `pruneLeft` | [26](../src/game/core/JourneyState.ts#L26) | Таймер периодического удаления завершённых объектов врагов. |
| `profile` | [27](../src/game/core/JourneyState.ts#L27) | Покупки, кошелёк, улучшения, экипировка, навыки и достижения текущего путешествия. |
| `saved` | [28](../src/game/core/JourneyState.ts#L28) | Последнее прочитанное и проверенное ручное сохранение. |
| `storageAvailable` | [29](../src/game/core/JourneyState.ts#L29) | Разрешил ли браузер работу с localStorage. |
| `score` | [30](../src/game/core/JourneyState.ts#L30) | Набранные очки; отдельный показатель, не кошелёк. |
| `kills` | [31](../src/game/core/JourneyState.ts#L31) | Число побеждённых противников текущего путешествия. |
| `deaths` | [32](../src/game/core/JourneyState.ts#L32) | Число смертей героя в текущем путешествии. |
| `elapsed` | [33](../src/game/core/JourneyState.ts#L33) | Игровое время путешествия, секунды. |
| `nextId` | [34](../src/game/core/JourneyState.ts#L34) | Следующий уникальный ID противника. |
| `checkpoint` | [35](../src/game/core/JourneyState.ts#L35) | Координаты последнего контрольного костра. |
| `introLeft` | [36](../src/game/core/JourneyState.ts#L36) | Время до завершения сцены похищения оружия. |
| `introBroken` | [37](../src/game/core/JourneyState.ts#L37) | Оружие уже разрушено в текущей сцене призрака. |
| `introResume` | [38](../src/game/core/JourneyState.ts#L38) | Вариант вступительной сцены при переходе к следующему биому. |

### [src/game/createGame.ts](../src/game/createGame.ts)

Настраивает движок, масштабирование холста, частоту кадров и начальную сцену.

Строк: 21.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `createGame` | [4](../src/game/createGame.ts#L4) | Создаёт Phaser.Game с настройками проекта. |

### [src/game/GameScene.ts](../src/game/GameScene.ts)

Создаёт сцену Phaser, загружает атласы, связывает системы и вызывает их в игровом цикле.

Строк: 397.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `GameScene` | [64](../src/game/GameScene.ts#L64) | Объявление в этом модуле. |
| `hero` | [65](../src/game/GameScene.ts#L65) | Группа PlayerState: текущие ресурсы и боевые окна героя. |
| `worldState` | [66](../src/game/GameScene.ts#L66) | Группа WorldState: объекты, геометрия, область и погода. |
| `journey` | [67](../src/game/GameScene.ts#L67) | Группа JourneyState: профиль и прогресс путешествия. |
| `ui` | [68](../src/game/GameScene.ts#L68) | Группа InterfaceState: окна, режим, ввод и уведомления. |
| `visuals` | [69](../src/game/GameScene.ts#L69) | Группа RenderState: спрайты и визуальные эффекты. |
| `player` | [70](../src/game/GameScene.ts#L70) | Контроллер движения, здоровья и лечения героя. Спрайт расположен в visuals.player. |
| `combat` | [71](../src/game/GameScene.ts#L71) | Атаки героя, парирование, урон врагам и награды за победу. |
| `effects` | [72](../src/game/GameScene.ts#L72) | Снаряды, опасные зоны, боевые эффекты и сообщения над персонажами. |
| `enemies` | [73](../src/game/GameScene.ts#L73) | Создание противников, волны, поиск пути и обычные вражеские атаки. |
| `bosses` | [74](../src/game/GameScene.ts#L74) | Предупреждения появления и выполнение уникальных приёмов боссов. |
| `world` | [75](../src/game/GameScene.ts#L75) | Границы, переходы между областями, камера, контрольные точки и возрождение. |
| `scenery` | [76](../src/game/GameScene.ts#L76) | Создание декораций биомов и деревень с ленивой загрузкой. |
| `village` | [77](../src/game/GameScene.ts#L77) | Дома, собеседники, взаимодействия, доставки и быстрое путешествие. |
| `economy` | [78](../src/game/GameScene.ts#L78) | Сбор осколков, кошелёк, ассортимент, покупки и экипировка. |
| `quests` | [79](../src/game/GameScene.ts#L79) | Испытания, сундуки, сюжетные поручения, журнал и достижения. |
| `menu` | [80](../src/game/GameScene.ts#L80) | Меню, HUD, пауза, справка, начальный экран и подтверждение выхода. |
| `map` | [81](../src/game/GameScene.ts#L81) | Локальная карта, карта мира и выбор области. |
| `controls` | [82](../src/game/GameScene.ts#L82) | Привязка DOM-кнопок, клавиатуры и мыши, сброс ввода и полноэкранный режим. |
| `saves` | [83](../src/game/GameScene.ts#L83) | Ручная запись, загрузка и отображение состояния сохранения. |
| `story` | [84](../src/game/GameScene.ts#L84) | Новое путешествие, сюжетные сцены и похищение оружия. |
| `tutorial` | [85](../src/game/GameScene.ts#L85) | Вводные карточки, практические уроки и подсказки обучения. |
| `actors` | [86](../src/game/GameScene.ts#L86) | Позы, руки, оружие, враги, жители и отрисовка границ биома. |
| `weather` | [87](../src/game/GameScene.ts#L87) | Дождь, гроза, метеоры, ураган и замедление от поверхности. |
| `audio` | [88](../src/game/GameScene.ts#L88) | Управление звуковыми эффектами, музыкой и громкостью. |
| `preload` | [92](../src/game/GameScene.ts#L92) | Загрузка атласов и сообщения о ходе загрузки. |
| `create` | [113](../src/game/GameScene.ts#L113) | Создание объектов сцены, подключение управления и запуск путешествия. |
| `element` | [191](../src/game/GameScene.ts#L191) | Получение обязательного DOM-элемента по id с проверкой его наличия. |
| `seals` | [196](../src/game/GameScene.ts#L196) | Число уже побеждённых боссов. |
| `update` | [199](../src/game/GameScene.ts#L199) | Порядок обновления систем на каждом кадре; пауза останавливает игровые действия. |

### [src/main.ts](../src/main.ts)

Запускает игру по кнопке начального экрана и обрабатывает выход.

Строк: 20.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `started` | [9](../src/main.ts#L9) | Поле состояния или ссылка на систему. |
| `requestAnimationFrame` | [13](../src/main.ts#L13) | Объявление в этом модуле. |

## Герой

### [src/game/player/PlayerController.ts](../src/game/player/PlayerController.ts)

Движение, здоровье, лечение и уклонение героя.

Строк: 212.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `PlayerController` | [21](../src/game/player/PlayerController.ts#L21) | Объявление в этом модуле. |
| `updateAim` | [23](../src/game/player/PlayerController.ts#L23) | Направляет героя на мышь, когда атака и перекат не блокируют поворот. |
| `movePlayer` | [32](../src/game/player/PlayerController.ts#L32) | Нормализует WASD, применяет скорость, замедления и столкновения. |
| `dodge` | [97](../src/game/player/PlayerController.ts#L97) | Списывает выносливость и запускает перекат с окном защиты. |
| `heal` | [117](../src/game/player/PlayerController.ts#L117) | Восстанавливает HP флягой Q или зельем V; проверяет запас и перезарядку. |
| `damagePlayer` | [143](../src/game/player/PlayerController.ts#L143) | Проверяет защиту, направление парирования и броню; снимает HP и запускает смерть. |

### [src/game/player/PlayerState.ts](../src/game/player/PlayerState.ts)

Текущее состояние героя. Максимумы вычисляются в CombatRules.stats.

Строк: 45.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `PlayerState` | [4](../src/game/player/PlayerState.ts#L4) | Объявление в этом модуле. |
| `hp` | [6](../src/game/player/PlayerState.ts#L6) | Текущее здоровье. Для героя максимум задаёт CombatRules.stats().maxHP. |
| `stamina` | [7](../src/game/player/PlayerState.ts#L7) | Текущая выносливость; расходуется атаками, навыками и перекатом. |
| `flasks` | [8](../src/game/player/PlayerState.ts#L8) | Оставшиеся заряды лечебной фляги Q. |
| `armed` | [9](../src/game/player/PlayerState.ts#L9) | Может ли герой использовать духовное оружие в текущей области. |
| `ultimate` | [10](../src/game/player/PlayerState.ts#L10) | Накопленный заряд абсолютного умения, от 0 до 100. |
| `ultimateLeft` | [11](../src/game/player/PlayerState.ts#L11) | Оставшееся время выполняемого абсолютного умения, секунды. |
| `ultimatePulse` | [12](../src/game/player/PlayerState.ts#L12) | Сколько импульсов абсолютной атаки уже выполнено. |
| `ultimateAngle` | [13](../src/game/player/PlayerState.ts#L13) | Зафиксированное направление абсолютной атаки, радианы. |
| `guardLeft` | [16](../src/game/player/PlayerState.ts#L16) | Оставшееся окно парирования, секунды. |
| `heavyAttack` | [17](../src/game/player/PlayerState.ts#L17) | Признак тяжёлого ПКМ-приёма текущей атаки. |
| `counterTarget` | [18](../src/game/player/PlayerState.ts#L18) | ID врага для контрудара после точного парирования; -1 означает отсутствие цели. |
| `counterLeft` | [19](../src/game/player/PlayerState.ts#L19) | Оставшееся время, за которое можно выполнить контрудар. |
| `counterStrike` | [20](../src/game/player/PlayerState.ts#L20) | Текущий удар является контрударом. |
| `strikeTarget` | [21](../src/game/player/PlayerState.ts#L21) | ID цели, зафиксированной при начале контрудара. |
| `activeSkill` | [22](../src/game/player/PlayerState.ts#L22) | ID текущего активного приёма или null для обычной атаки. |
| `attackPulse` | [23](../src/game/player/PlayerState.ts#L23) | Индекс уже обработанного импульса многоударного навыка. |
| `skillCooldowns` | [24](../src/game/player/PlayerState.ts#L24) | Оставшиеся перезарядки изученных приёмов по их ID. |
| `shieldLeft` | [25](../src/game/player/PlayerState.ts#L25) | Время действия защитного эффекта навыка. |
| `face` | [26](../src/game/player/PlayerState.ts#L26) | Направление взгляда и прицеливания героя, радианы. |
| `velocity` | [27](../src/game/player/PlayerState.ts#L27) | Фактическая скорость героя после столкновений; используется для прогноза врагов. |
| `movement` | [28](../src/game/player/PlayerState.ts#L28) | Нормализованное последнее направление перемещения. |
| `attackTime` | [29](../src/game/player/PlayerState.ts#L29) | Время от начала удара; -1 означает отсутствие атаки. |
| `attackAngle` | [30](../src/game/player/PlayerState.ts#L30) | Зафиксированное направление текущего удара. |
| `attackFired` | [31](../src/game/player/PlayerState.ts#L31) | Для текущего удара уже создан снаряд или одноразовый эффект. |
| `attackHits` | [32](../src/game/player/PlayerState.ts#L32) | ID врагов, уже задетых текущим ударом; защищает от повторного урона. |
| `combo` | [33](../src/game/player/PlayerState.ts#L33) | Индекс удара в трёхчастном комбо: 0, 1 или 2. |
| `lastAttack` | [34](../src/game/player/PlayerState.ts#L34) | Время начала прошлого удара для продолжения комбо. |
| `dodgeLeft` | [35](../src/game/player/PlayerState.ts#L35) | Оставшееся время активного переката. |
| `dodgeWait` | [36](../src/game/player/PlayerState.ts#L36) | Время до возможности следующего переката. |
| `dodgeVector` | [37](../src/game/player/PlayerState.ts#L37) | Зафиксированное направление активного переката. |
| `hurtLeft` | [38](../src/game/player/PlayerState.ts#L38) | Оставшееся время защиты от повторного получения урона. |
| `hurtFlash` | [39](../src/game/player/PlayerState.ts#L39) | Время визуальной вспышки после получения урона. |
| `regenDelay` | [40](../src/game/player/PlayerState.ts#L40) | Задержка перед восстановлением выносливости. |
| `healWait` | [41](../src/game/player/PlayerState.ts#L41) | Оставшаяся перезарядка лечения. |
| `deathLeft` | [42](../src/game/player/PlayerState.ts#L42) | Время до окончания анимации смерти и возрождения. |
| `slowed` | [43](../src/game/player/PlayerState.ts#L43) | Время принудительного замедления героя. |
| `strideDistance` | [44](../src/game/player/PlayerState.ts#L44) | Пройденное расстояние для фазы беговой анимации. |

## Бой

### [src/game/combat/CombatEffects.ts](../src/game/combat/CombatEffects.ts)

Снаряды, опасные зоны, боевые эффекты и сообщения над персонажами.

Строк: 340.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `Projectile` | [11](../src/game/combat/CombatEffects.ts#L11) | Форма данных для проверки TypeScript. |
| `vx` | [12](../src/game/combat/CombatEffects.ts#L12) | Поле состояния или ссылка на систему. |
| `vy` | [13](../src/game/combat/CombatEffects.ts#L13) | Поле состояния или ссылка на систему. |
| `life` | [14](../src/game/combat/CombatEffects.ts#L14) | Поле состояния или ссылка на систему. |
| `damage` | [15](../src/game/combat/CombatEffects.ts#L15) | Поле состояния или ссылка на систему. |
| `region` | [16](../src/game/combat/CombatEffects.ts#L16) | Поле состояния или ссылка на систему. |
| `friendly` | [17](../src/game/combat/CombatEffects.ts#L17) | Поле состояния или ссылка на систему. |
| `color` | [18](../src/game/combat/CombatEffects.ts#L18) | Поле состояния или ссылка на систему. |
| `radius` | [19](../src/game/combat/CombatEffects.ts#L19) | Поле состояния или ссылка на систему. |
| `blast` | [20](../src/game/combat/CombatEffects.ts#L20) | Поле состояния или ссылка на систему. |
| `visual` | [21](../src/game/combat/CombatEffects.ts#L21) | Поле состояния или ссылка на систему. |
| `hits` | [22](../src/game/combat/CombatEffects.ts#L22) | Поле состояния или ссылка на систему. |
| `Hazard` | [24](../src/game/combat/CombatEffects.ts#L24) | Форма данных для проверки TypeScript. |
| `region` | [25](../src/game/combat/CombatEffects.ts#L25) | Поле состояния или ссылка на систему. |
| `radius` | [26](../src/game/combat/CombatEffects.ts#L26) | Поле состояния или ссылка на систему. |
| `warning` | [27](../src/game/combat/CombatEffects.ts#L27) | Поле состояния или ссылка на систему. |
| `left` | [28](../src/game/combat/CombatEffects.ts#L28) | Поле состояния или ссылка на систему. |
| `damage` | [29](../src/game/combat/CombatEffects.ts#L29) | Поле состояния или ссылка на систему. |
| `kind` | [30](../src/game/combat/CombatEffects.ts#L30) | Поле состояния или ссылка на систему. |
| `fired` | [31](../src/game/combat/CombatEffects.ts#L31) | Поле состояния или ссылка на систему. |
| `environment` | [32](../src/game/combat/CombatEffects.ts#L32) | Поле состояния или ссылка на систему. |
| `bossStrike` | [33](../src/game/combat/CombatEffects.ts#L33) | Поле состояния или ссылка на систему. |
| `ownerId` | [34](../src/game/combat/CombatEffects.ts#L34) | Поле состояния или ссылка на систему. |
| `CombatEffects` | [36](../src/game/combat/CombatEffects.ts#L36) | Объявление в этом модуле. |
| `particles` | [38](../src/game/combat/CombatEffects.ts#L38) | Создаёт ограниченное число частиц с удалением после анимации. |
| `popup` | [60](../src/game/combat/CombatEffects.ts#L60) | Показывает урон или награду над персонажем. |
| `enemyProjectile` | [80](../src/game/combat/CombatEffects.ts#L80) | Выбирает вид снаряда по врагу и типу атаки. |
| `drawCombatImage` | [96](../src/game/combat/CombatEffects.ts#L96) | Переиспользует спрайты боевых эффектов из пула. |
| `weatherHitEnemies` | [113](../src/game/combat/CombatEffects.ts#L113) | Наносит урон противникам от погодного события. |
| `shoot` | [127](../src/game/combat/CombatEffects.ts#L127) | Создаёт летящий снаряд с направлением и параметрами урона. |
| `updateProjectiles` | [155](../src/game/combat/CombatEffects.ts#L155) | Двигает снаряды, проверяет стены и попадания, удаляет завершённые. |
| `updateHazards` | [214](../src/game/combat/CombatEffects.ts#L214) | Отсчитывает предупреждения опасных зон и применяет урон по их геометрии. |
| `cone` | [294](../src/game/combat/CombatEffects.ts#L294) | Рисует сектор предупреждения атаки. |
| `addEffect` | [321](../src/game/combat/CombatEffects.ts#L321) | Добавляет короткую дугу, кольцо или след выпада. |

### [src/game/combat/CombatRules.ts](../src/game/combat/CombatRules.ts)

Формулы максимального HP, выносливости, урона и защиты; фазы атак, лечение и стоимость действий.

Строк: 243.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `DODGE_TIME` | [9](../src/game/combat/CombatRules.ts#L9) | Параметры, таблица данных или функция, объявленная константой. |
| `DODGE_COST` | [10](../src/game/combat/CombatRules.ts#L10) | Параметры, таблица данных или функция, объявленная константой. |
| `HURT_PROTECTION` | [11](../src/game/combat/CombatRules.ts#L11) | Параметры, таблица данных или функция, объявленная константой. |
| `FLASK_HEAL` | [12](../src/game/combat/CombatRules.ts#L12) | Параметры, таблица данных или функция, объявленная константой. |
| `POTION_HEAL` | [13](../src/game/combat/CombatRules.ts#L13) | Параметры, таблица данных или функция, объявленная константой. |
| `ULTIMATE_MAX` | [14](../src/game/combat/CombatRules.ts#L14) | Параметры, таблица данных или функция, объявленная константой. |
| `PLAYER_DAMAGE_SCALE` | [16](../src/game/combat/CombatRules.ts#L16) | Параметры, таблица данных или функция, объявленная константой. |
| `stats` | [17](../src/game/combat/CombatRules.ts#L17) | Вычисляет максимум ресурсов, скорость, урон, броню, защиту от магии и восстановление. |
| `slashConnects` | [36](../src/game/combat/CombatRules.ts#L36) | Проверяет расстояние и угол попадания сектором. |
| `attackSpec` | [50](../src/game/combat/CombatRules.ts#L50) | Параметры обычной атаки, комбо и тяжёлого ПКМ-приёма. |
| `skillAttack` | [108](../src/game/combat/CombatRules.ts#L108) | Параметры активных атак навыков. |
| `PLAYER_RADIUS` | [239](../src/game/combat/CombatRules.ts#L239) | Параметры, таблица данных или функция, объявленная константой. |
| `STAMINA_DELAY` | [240](../src/game/combat/CombatRules.ts#L240) | Параметры, таблица данных или функция, объявленная константой. |
| `PARRY_DURATION` | [241](../src/game/combat/CombatRules.ts#L241) | Параметры, таблица данных или функция, объявленная константой. |
| `PERFECT_PARRY` | [242](../src/game/combat/CombatRules.ts#L242) | Параметры, таблица данных или функция, объявленная константой. |
| `COUNTER_WINDOW` | [243](../src/game/combat/CombatRules.ts#L243) | Параметры, таблица данных или функция, объявленная константой. |

### [src/game/combat/CombatSystem.ts](../src/game/combat/CombatSystem.ts)

Атаки героя, парирование, урон врагам и награды за победу.

Строк: 578.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `CombatSystem` | [20](../src/game/combat/CombatSystem.ts#L20) | Объявление в этом модуле. |
| `currentAttackSpec` | [22](../src/game/combat/CombatSystem.ts#L22) | Выбирает параметры обычного удара, контрудара или активного навыка. |
| `attack` | [50](../src/game/combat/CombatSystem.ts#L50) | Начинает обычный удар или контрудар; выбирает комбо и списывает выносливость. |
| `parry` | [120](../src/game/combat/CombatSystem.ts#L120) | Открывает короткое окно парирования. |
| `useSkill` | [139](../src/game/combat/CombatSystem.ts#L139) | Проверяет навык, клавишу, ресурс и перезарядку; начинает приём. |
| `resolveAttack` | [179](../src/game/combat/CombatSystem.ts#L179) | В активной фазе проверяет цели и препятствия; исключает повторное попадание одним ударом. |
| `hitEnemy` | [357](../src/game/combat/CombatSystem.ts#L357) | Применяет вражеский щит, снимает HP, даёт отбрасывание и вызывает смерть врага. |
| `killEnemy` | [408](../src/game/combat/CombatSystem.ts#L408) | Отмечает смерть один раз, выдаёт награду и обрабатывает разрыв печати босса. |
| `useUltimate` | [476](../src/game/combat/CombatSystem.ts#L476) | Расходует полную шкалу абсолютного умения. |
| `updateUltimate` | [512](../src/game/combat/CombatSystem.ts#L512) | Выполняет импульсы абсолютной атаки во времени. |
| `secondaryAttack` | [547](../src/game/combat/CombatSystem.ts#L547) | Выбирает ПКМ-приём текущего типа оружия. |

## Враги и боссы

### [src/game/enemies/BossPatterns.ts](../src/game/enemies/BossPatterns.ts)

24 уникальных приёма восьми боссов и единая геометрия предупреждения и попадания.

Строк: 362.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `BOSS_MOVES` | [4](../src/game/enemies/BossPatterns.ts#L4) | Параметры, таблица данных или функция, объявленная константой. |
| `BossAttack` | [14](../src/game/enemies/BossPatterns.ts#L14) | Форма данных для проверки TypeScript. |
| `BOSS_NAMES` | [15](../src/game/enemies/BossPatterns.ts#L15) | Параметры, таблица данных или функция, объявленная константой. |
| `isBossAttack` | [42](../src/game/enemies/BossPatterns.ts#L42) | Параметры, таблица данных или функция, объявленная константой. |
| `BossStrike` | [43](../src/game/enemies/BossPatterns.ts#L43) | Форма данных для проверки TypeScript. |
| `shape` | [44](../src/game/enemies/BossPatterns.ts#L44) | Поле состояния или ссылка на систему. |
| `radius` | [45](../src/game/enemies/BossPatterns.ts#L45) | Поле состояния или ссылка на систему. |
| `inner` | [46](../src/game/enemies/BossPatterns.ts#L46) | Поле состояния или ссылка на систему. |
| `angle` | [47](../src/game/enemies/BossPatterns.ts#L47) | Поле состояния или ссылка на систему. |
| `length` | [48](../src/game/enemies/BossPatterns.ts#L48) | Поле состояния или ссылка на систему. |
| `width` | [49](../src/game/enemies/BossPatterns.ts#L49) | Поле состояния или ссылка на систему. |
| `delay` | [50](../src/game/enemies/BossPatterns.ts#L50) | Поле состояния или ссылка на систему. |
| `visual` | [51](../src/game/enemies/BossPatterns.ts#L51) | Поле состояния или ссылка на систему. |
| `physical` | [52](../src/game/enemies/BossPatterns.ts#L52) | Поле состояния или ссылка на систему. |
| `scale` | [53](../src/game/enemies/BossPatterns.ts#L53) | Поле состояния или ссылка на систему. |
| `bossPattern` | [57](../src/game/enemies/BossPatterns.ts#L57) | План отдельных опасных зон выбранного приёма босса. |
| `rage` | [61](../src/game/enemies/BossPatterns.ts#L61) | Поле состояния или ссылка на систему. |
| `bossStrikeHits` | [346](../src/game/enemies/BossPatterns.ts#L346) | Проверка попадания линией, кольцом или круговой меткой. |

### [src/game/enemies/BossSystem.ts](../src/game/enemies/BossSystem.ts)

Предупреждения появления и выполнение уникальных приёмов боссов.

Строк: 172.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `BossSystem` | [8](../src/game/enemies/BossSystem.ts#L8) | Объявление в этом модуле. |
| `resetBossCountdown` | [10](../src/game/enemies/BossSystem.ts#L10) | Скрывает цифры обратного отсчёта. |
| `updateBossCountdown` | [16](../src/game/enemies/BossSystem.ts#L16) | Показывает последние десять секунд до появления босса. |
| `startBossAttack` | [48](../src/game/enemies/BossSystem.ts#L48) | Фиксирует цель и план уникального приёма босса. |
| `executeBossAttack` | [61](../src/game/enemies/BossSystem.ts#L61) | Создаёт опасные зоны по зафиксированному плану. |
| `drawBossStrike` | [86](../src/game/enemies/BossSystem.ts#L86) | Рисует ту же геометрию, которая используется для попадания. |

### [src/game/enemies/EnemyConfig.ts](../src/game/enemies/EnemyConfig.ts)

Базовое HP обычных врагов, рост характеристик по биомам, награда, скорость и лимит волн.

Строк: 78.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `PATH_INTERVAL` | [4](../src/game/enemies/EnemyConfig.ts#L4) | Параметры, таблица данных или функция, объявленная константой. |
| `MAX_MINIONS` | [5](../src/game/enemies/EnemyConfig.ts#L5) | Параметры, таблица данных или функция, объявленная константой. |
| `WAVE_FIRST` | [6](../src/game/enemies/EnemyConfig.ts#L6) | Параметры, таблица данных или функция, объявленная константой. |
| `WAVE_SIZE` | [7](../src/game/enemies/EnemyConfig.ts#L7) | Параметры, таблица данных или функция, объявленная константой. |
| `BOSS_REWARD` | [8](../src/game/enemies/EnemyConfig.ts#L8) | Параметры, таблица данных или функция, объявленная константой. |
| `THIRD_BIOME_DAMAGE` | [9](../src/game/enemies/EnemyConfig.ts#L9) | Параметры, таблица данных или функция, объявленная константой. |
| `THIRD_BIOME_WINDUP` | [10](../src/game/enemies/EnemyConfig.ts#L10) | Параметры, таблица данных или функция, объявленная константой. |
| `ENEMY_BASE_HP` | [12](../src/game/enemies/EnemyConfig.ts#L12) | Параметры, таблица данных или функция, объявленная константой. |
| `enemyStats` | [27](../src/game/enemies/EnemyConfig.ts#L27) | Численные HP, урон, награда, скорость, размер и радиус врага. |

### [src/game/enemies/EnemySystem.ts](../src/game/enemies/EnemySystem.ts)

Создание противников, волны, поиск пути и обычные вражеские атаки.

Строк: 670.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `EnemySystem` | [24](../src/game/enemies/EnemySystem.ts#L24) | Объявление в этом модуле. |
| `predict` | [26](../src/game/enemies/EnemySystem.ts#L26) | Предсказывает положение героя с учётом его скорости. |
| `walkEnemy` | [39](../src/game/enemies/EnemySystem.ts#L39) | Ведёт врага по прямой или маршруту A* и обходит препятствия. |
| `spawnEnemy` | [76](../src/game/enemies/EnemySystem.ts#L76) | Создаёт спрайт и состояние врага по параметрам EnemyConfig. |
| `updateWaves` | [134](../src/game/enemies/EnemySystem.ts#L134) | Удаляет завершённые спрайты и создаёт новые волны в пределах лимита. |
| `spawnBoss` | [181](../src/game/enemies/EnemySystem.ts#L181) | Отмечает появление босса в прогрессе, создаёт его и включает бой. |
| `startEnemyAttack` | [201](../src/game/enemies/EnemySystem.ts#L201) | Выбирает обычный вражеский приём и начинает замах. |
| `updateEnemies` | [261](../src/game/enemies/EnemySystem.ts#L261) | Обновляет состояние врагов: преследование, замах, рывок, восстановление, эффекты и вторую фазу. |
| `recoverEnemy` | [422](../src/game/enemies/EnemySystem.ts#L422) | Переводит врага в восстановление после атаки. |
| `executeEnemyAttack` | [426](../src/game/enemies/EnemySystem.ts#L426) | Исполняет обычный приём: удар, выстрел, призыв, телепортацию и другие действия. |
| `summonMinions` | [622](../src/game/enemies/EnemySystem.ts#L622) | Создаёт помощников врага с учётом ограничения числа существ. |
| `enemyBounds` | [659](../src/game/enemies/EnemySystem.ts#L659) | Выбирает границы учебного двора или биома врага. |

### [src/game/enemies/EnemyTypes.ts](../src/game/enemies/EnemyTypes.ts)

Тип живого врага: HP, режим поведения, путь, текущая атака, эффекты и спрайты.

Строк: 40.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `EnemyMode` | [6](../src/game/enemies/EnemyTypes.ts#L6) | Форма данных для проверки TypeScript. |
| `Enemy` | [7](../src/game/enemies/EnemyTypes.ts#L7) | Форма данных для проверки TypeScript. |
| `id` | [8](../src/game/enemies/EnemyTypes.ts#L8) | Уникальный ID противника для попаданий, контрударов и владельцев зон. |
| `region` | [9](../src/game/enemies/EnemyTypes.ts#L9) | Индекс биома, которому принадлежит объект. |
| `kind` | [10](../src/game/enemies/EnemyTypes.ts#L10) | Тип противника; boss обрабатывается отдельными приёмами. |
| `variant` | [11](../src/game/enemies/EnemyTypes.ts#L11) | Номер варианта для начального ритма и очереди приёмов. |
| `sprite` | [12](../src/game/enemies/EnemyTypes.ts#L12) | Спрайт объекта Phaser. |
| `shadow` | [13](../src/game/enemies/EnemyTypes.ts#L13) | Тень противника. |
| `hp` | [14](../src/game/enemies/EnemyTypes.ts#L14) | Текущее здоровье. Для героя максимум задаёт CombatRules.stats().maxHP. |
| `maxHP` | [15](../src/game/enemies/EnemyTypes.ts#L15) | Максимальное здоровье противника; вычисляется при создании. |
| `radius` | [16](../src/game/enemies/EnemyTypes.ts#L16) | Радиус столкновения и проверки попаданий. |
| `damage` | [17](../src/game/enemies/EnemyTypes.ts#L17) | Базовый урон противника до защиты героя. |
| `reward` | [18](../src/game/enemies/EnemyTypes.ts#L18) | Количество осколков за победу над противником. |
| `speed` | [19](../src/game/enemies/EnemyTypes.ts#L19) | Базовая скорость движения противника. |
| `mode` | [20](../src/game/enemies/EnemyTypes.ts#L20) | Режим поведения: chase, windup, charge или recover. |
| `clock` | [21](../src/game/enemies/EnemyTypes.ts#L21) | Таймер текущего режима поведения. |
| `nextPath` | [22](../src/game/enemies/EnemyTypes.ts#L22) | Время до следующего пересчёта пути A*. |
| `path` | [23](../src/game/enemies/EnemyTypes.ts#L23) | Точки текущего маршрута врага. |
| `aim` | [24](../src/game/enemies/EnemyTypes.ts#L24) | Направление движения или атаки врага. |
| `target` | [25](../src/game/enemies/EnemyTypes.ts#L25) | Зафиксированная точка цели текущего приёма. |
| `hasHit` | [26](../src/game/enemies/EnemyTypes.ts#L26) | Враг уже нанёс контактный урон текущим приёмом. |
| `stun` | [27](../src/game/enemies/EnemyTypes.ts#L27) | Оставшееся время оглушения. |
| `flash` | [28](../src/game/enemies/EnemyTypes.ts#L28) | Оставшееся время вспышки после получения урона. |
| `phase2` | [29](../src/game/enemies/EnemyTypes.ts#L29) | Босс перешёл во вторую фазу при половине HP. |
| `dead` | [30](../src/game/enemies/EnemyTypes.ts#L30) | Противник уже побеждён; блокирует повторную награду. |
| `move` | [31](../src/game/enemies/EnemyTypes.ts#L31) | Выбранный приём противника. |
| `moveIndex` | [32](../src/game/enemies/EnemyTypes.ts#L32) | Очередной индекс выбора вражеского приёма. |
| `training` | [33](../src/game/enemies/EnemyTypes.ts#L33) | Учебный противник с особыми условиями урона и наград. |
| `chain` | [34](../src/game/enemies/EnemyTypes.ts#L34) | Счётчик продолжения серии вражеских атак. |
| `bleed` | [35](../src/game/enemies/EnemyTypes.ts#L35) | Оставшееся время кровотечения. |
| `bleedTick` | [36](../src/game/enemies/EnemyTypes.ts#L36) | Время до следующего периодического урона кровотечения. |
| `recoil` | [37](../src/game/enemies/EnemyTypes.ts#L37) | Время анимации отдачи после приёма. |
| `voiceLeft` | [38](../src/game/enemies/EnemyTypes.ts#L38) | Время визуальной позы крика или заклинания. |
| `bossPlan` | [39](../src/game/enemies/EnemyTypes.ts#L39) | Зафиксированные линии, кольца и метки текущей атаки босса. |

## Мир и погода

### [src/game/world/Navigation.ts](../src/game/world/Navigation.ts)

Геометрия, столкновения кругов, видимость между точками и A* на сетке.

Строк: 325.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `Point` | [1](../src/game/world/Navigation.ts#L1) | Форма данных для проверки TypeScript. |
| `Terrain` | [2](../src/game/world/Navigation.ts#L2) | Форма данных для проверки TypeScript. |
| `kind` | [3](../src/game/world/Navigation.ts#L3) | Поле состояния или ссылка на систему. |
| `radius` | [4](../src/game/world/Navigation.ts#L4) | Поле состояния или ссылка на систему. |
| `Bounds` | [6](../src/game/world/Navigation.ts#L6) | Форма данных для проверки TypeScript. |
| `width` | [7](../src/game/world/Navigation.ts#L7) | Поле состояния или ссылка на систему. |
| `height` | [8](../src/game/world/Navigation.ts#L8) | Поле состояния или ссылка на систему. |
| `margin` | [9](../src/game/world/Navigation.ts#L9) | Поле состояния или ссылка на систему. |
| `top` | [10](../src/game/world/Navigation.ts#L10) | Поле состояния или ссылка на систему. |
| `left` | [11](../src/game/world/Navigation.ts#L11) | Поле состояния или ссылка на систему. |
| `NavGrid` | [13](../src/game/world/Navigation.ts#L13) | Форма данных для проверки TypeScript. |
| `cell` | [14](../src/game/world/Navigation.ts#L14) | Поле состояния или ссылка на систему. |
| `cols` | [15](../src/game/world/Navigation.ts#L15) | Поле состояния или ссылка на систему. |
| `rows` | [16](../src/game/world/Navigation.ts#L16) | Поле состояния или ссылка на систему. |
| `free` | [17](../src/game/world/Navigation.ts#L17) | Поле состояния или ссылка на систему. |
| `bounds` | [18](../src/game/world/Navigation.ts#L18) | Поле состояния или ссылка на систему. |
| `originX` | [19](../src/game/world/Navigation.ts#L19) | Поле состояния или ссылка на систему. |
| `makeTerrain` | [65](../src/game/world/Navigation.ts#L65) | Объявление в этом модуле. |
| `clampPoint` | [74](../src/game/world/Navigation.ts#L74) | Ограничивает координаты допустимыми границами. |
| `freePoint` | [81](../src/game/world/Navigation.ts#L81) | Проверяет границы и свободное место вокруг точки. |
| `moveCircle` | [95](../src/game/world/Navigation.ts#L95) | Двигает круг подшагами и выталкивает его из препятствий. |
| `makeGrid` | [124](../src/game/world/Navigation.ts#L124) | Строит сетку проходимости и оставляет крупнейшую связанную область. |
| `findPath` | [194](../src/game/world/Navigation.ts#L194) | Строит путь A* без срезания углов. |
| `clearLine` | [253](../src/game/world/Navigation.ts#L253) | Проверяет свободный от препятствий отрезок. |
| `regionTerrain` | [281](../src/game/world/Navigation.ts#L281) | Создаёт препятствия выбранного биома. |
| `add` | [314](../src/game/world/Navigation.ts#L314) | Объявление в этом модуле. |

### [src/game/world/WeatherSystem.ts](../src/game/world/WeatherSystem.ts)

Дождь, гроза, метеоры, ураган и замедление от поверхности.

Строк: 311.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `LIGHTNING_WARNING` | [6](../src/game/world/WeatherSystem.ts#L6) | Параметры, таблица данных или функция, объявленная константой. |
| `LIGHTNING_RADIUS` | [7](../src/game/world/WeatherSystem.ts#L7) | Параметры, таблица данных или функция, объявленная константой. |
| `Strike` | [8](../src/game/world/WeatherSystem.ts#L8) | Форма данных для проверки TypeScript. |
| `left` | [9](../src/game/world/WeatherSystem.ts#L9) | Поле состояния или ссылка на систему. |
| `phase` | [10](../src/game/world/WeatherSystem.ts#L10) | Поле состояния или ссылка на систему. |
| `WeatherSystem` | [12](../src/game/world/WeatherSystem.ts#L12) | Объявление в этом модуле. |
| `drawWeather` | [14](../src/game/world/WeatherSystem.ts#L14) | Рисует дождь, мокрые зоны, предупреждение молнии и ураган. |
| `groundSpeed` | [86](../src/game/world/WeatherSystem.ts#L86) | Возвращает множитель скорости от воды, проклятия и замедления. |
| `resetWeather` | [103](../src/game/world/WeatherSystem.ts#L103) | Убирает погодные зоны и сбрасывает таймеры. |
| `updateWeather` | [116](../src/game/world/WeatherSystem.ts#L116) | Выбирает событие, двигает ураган и применяет удары молний и метеоров. |
| `WeatherKind` | [279](../src/game/world/WeatherSystem.ts#L279) | Форма данных для проверки TypeScript. |
| `WEATHER_DURATION` | [280](../src/game/world/WeatherSystem.ts#L280) | Параметры, таблица данных или функция, объявленная константой. |
| `METEOR_WARNING` | [281](../src/game/world/WeatherSystem.ts#L281) | Параметры, таблица данных или функция, объявленная константой. |
| `METEOR_RADIUS` | [282](../src/game/world/WeatherSystem.ts#L282) | Поле состояния или ссылка на систему. |
| `HURRICANE_RADIUS` | [283](../src/game/world/WeatherSystem.ts#L283) | Параметры, таблица данных или функция, объявленная константой. |
| `HURRICANE_PULL` | [284](../src/game/world/WeatherSystem.ts#L284) | Поле состояния или ссылка на систему. |
| `WEATHER_NAMES` | [285](../src/game/world/WeatherSystem.ts#L285) | Параметры, таблица данных или функция, объявленная константой. |
| `WEATHER_HINTS` | [292](../src/game/world/WeatherSystem.ts#L292) | Параметры, таблица данных или функция, объявленная константой. |
| `randomWeather` | [300](../src/game/world/WeatherSystem.ts#L300) | Выбирает одно из четырёх погодных событий. |
| `value` | [302](../src/game/world/WeatherSystem.ts#L302) | Поле состояния или ссылка на систему. |

### [src/game/world/WorldConfig.ts](../src/game/world/WorldConfig.ts)

Восемь биомов: цели, таймеры, HP боссов, состав врагов, размеры и положение деревень.

Строк: 315.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `REGION_WIDTH` | [3](../src/game/world/WorldConfig.ts#L3) | Параметры, таблица данных или функция, объявленная константой. |
| `ROAD_WIDTH` | [4](../src/game/world/WorldConfig.ts#L4) | Параметры, таблица данных или функция, объявленная константой. |
| `PROLOGUE_WIDTH` | [5](../src/game/world/WorldConfig.ts#L5) | Параметры, таблица данных или функция, объявленная константой. |
| `REGION_STEP` | [6](../src/game/world/WorldConfig.ts#L6) | Параметры, таблица данных или функция, объявленная константой. |
| `WORLD_HEIGHT` | [7](../src/game/world/WorldConfig.ts#L7) | Параметры, таблица данных или функция, объявленная константой. |
| `ENEMY_KINDS` | [8](../src/game/world/WorldConfig.ts#L8) | Параметры, таблица данных или функция, объявленная константой. |
| `EnemyKind` | [22](../src/game/world/WorldConfig.ts#L22) | Форма данных для проверки TypeScript. |
| `EnemyAttack` | [23](../src/game/world/WorldConfig.ts#L23) | Форма данных для проверки TypeScript. |
| `Region` | [39](../src/game/world/WorldConfig.ts#L39) | Форма данных для проверки TypeScript. |
| `name` | [40](../src/game/world/WorldConfig.ts#L40) | Поле состояния или ссылка на систему. |
| `coins` | [41](../src/game/world/WorldConfig.ts#L41) | Осколки в мире. Кошелёк находится в journey.profile.coins. |
| `awaken` | [42](../src/game/world/WorldConfig.ts#L42) | Поле состояния или ссылка на систему. |
| `bossTime` | [43](../src/game/world/WorldConfig.ts#L43) | Поле состояния или ссылка на систему. |
| `roster` | [44](../src/game/world/WorldConfig.ts#L44) | Поле состояния или ссылка на систему. |
| `speed` | [45](../src/game/world/WorldConfig.ts#L45) | Поле состояния или ссылка на систему. |
| `bossName` | [46](../src/game/world/WorldConfig.ts#L46) | Поле состояния или ссылка на систему. |
| `bossTexture` | [47](../src/game/world/WorldConfig.ts#L47) | Поле состояния или ссылка на систему. |
| `bossHP` | [48](../src/game/world/WorldConfig.ts#L48) | Поле состояния или ссылка на систему. |
| `bossMoves` | [49](../src/game/world/WorldConfig.ts#L49) | Поле состояния или ссылка на систему. |
| `fog` | [50](../src/game/world/WorldConfig.ts#L50) | Поле состояния или ссылка на систему. |
| `lore` | [51](../src/game/world/WorldConfig.ts#L51) | Поле состояния или ссылка на систему. |
| `ground` | [52](../src/game/world/WorldConfig.ts#L52) | Поле состояния или ссылка на систему. |
| `palette` | [53](../src/game/world/WorldConfig.ts#L53) | Поле состояния или ссылка на систему. |
| `REGIONS` | [55](../src/game/world/WorldConfig.ts#L55) | Параметры, таблица данных или функция, объявленная константой. |
| `WORLD_WIDTH` | [277](../src/game/world/WorldConfig.ts#L277) | Параметры, таблица данных или функция, объявленная константой. |
| `regionStart` | [278](../src/game/world/WorldConfig.ts#L278) | Параметры, таблица данных или функция, объявленная константой. |
| `regionEnd` | [279](../src/game/world/WorldConfig.ts#L279) | Параметры, таблица данных или функция, объявленная константой. |
| `merchantPosition` | [280](../src/game/world/WorldConfig.ts#L280) | Параметры, таблица данных или функция, объявленная константой. |
| `checkpointPosition` | [284](../src/game/world/WorldConfig.ts#L284) | Параметры, таблица данных или функция, объявленная константой. |
| `villagePosition` | [289](../src/game/world/WorldConfig.ts#L289) | Параметры, таблица данных или функция, объявленная константой. |
| `VILLAGE_NAMES` | [291](../src/game/world/WorldConfig.ts#L291) | Параметры, таблица данных или функция, объявленная константой. |
| `REGION_INCOME` | [302](../src/game/world/WorldConfig.ts#L302) | Параметры, таблица данных или функция, объявленная константой. |
| `REGION_THEMES` | [303](../src/game/world/WorldConfig.ts#L303) | Параметры, таблица данных или функция, объявленная константой. |
| `PICKUP_RADIUS` | [314](../src/game/world/WorldConfig.ts#L314) | Параметры, таблица данных или функция, объявленная константой. |
| `INTERACT_DISTANCE` | [315](../src/game/world/WorldConfig.ts#L315) | Параметры, таблица данных или функция, объявленная константой. |

### [src/game/world/WorldRenderer.ts](../src/game/world/WorldRenderer.ts)

Создание декораций биомов и деревень с ленивой загрузкой.

Строк: 250.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `WorldRenderer` | [22](../src/game/world/WorldRenderer.ts#L22) | Объявление в этом модуле. |
| `drawWorld` | [24](../src/game/world/WorldRenderer.ts#L24) | Готовит геометрию всех биомов и начальные декорации. |
| `rememberScenery` | [48](../src/game/world/WorldRenderer.ts#L48) | Запоминает созданные наружные объекты для скрытия в интерьере. |
| `ensureRegionArt` | [54](../src/game/world/WorldRenderer.ts#L54) | Однократно создаёт графику посещённого биома. |
| `ensureVillageArt` | [113](../src/game/world/WorldRenderer.ts#L113) | Однократно создаёт деревню, дома и жителей. |

### [src/game/world/WorldState.ts](../src/game/world/WorldState.ts)

Объекты мира, геометрия, текущая область и состояние погоды.

Строк: 77.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `Coin` | [11](../src/game/world/WorldState.ts#L11) | Форма данных для проверки TypeScript. |
| `region` | [12](../src/game/world/WorldState.ts#L12) | Поле состояния или ссылка на систему. |
| `sprite` | [13](../src/game/world/WorldState.ts#L13) | Поле состояния или ссылка на систему. |
| `value` | [14](../src/game/world/WorldState.ts#L14) | Поле состояния или ссылка на систему. |
| `phase` | [15](../src/game/world/WorldState.ts#L15) | Поле состояния или ссылка на систему. |
| `Chest` | [17](../src/game/world/WorldState.ts#L17) | Форма данных для проверки TypeScript. |
| `sprite` | [18](../src/game/world/WorldState.ts#L18) | Поле состояния или ссылка на систему. |
| `WorldState` | [20](../src/game/world/WorldState.ts#L20) | Объявление в этом модуле. |
| `terrain` | [21](../src/game/world/WorldState.ts#L21) | Общий список препятствий наружного мира. |
| `terrainByRegion` | [22](../src/game/world/WorldState.ts#L22) | Препятствия, сгруппированные по биомам. |
| `nav` | [23](../src/game/world/WorldState.ts#L23) | Сетки навигации обычных противников по биомам. |
| `bossNav` | [24](../src/game/world/WorldState.ts#L24) | Сетки навигации под увеличенный радиус босса. |
| `enemies` | [25](../src/game/world/WorldState.ts#L25) | Живые и завершающие анимацию смерти противники. |
| `coins` | [26](../src/game/world/WorldState.ts#L26) | Осколки в мире. Кошелёк находится в journey.profile.coins. |
| `projectiles` | [27](../src/game/world/WorldState.ts#L27) | Активные летящие снаряды героя и врагов. |
| `hazards` | [28](../src/game/world/WorldState.ts#L28) | Опасные зоны: предупреждения, время действия, урон и владелец. |
| `chests` | [29](../src/game/world/WorldState.ts#L29) | Сундуки испытаний и их открытость. |
| `merchants` | [30](../src/game/world/WorldState.ts#L30) | Ссылки на спрайты кузнецов деревень. |
| `fires` | [31](../src/game/world/WorldState.ts#L31) | Спрайты костров. |
| `regionIndex` | [32](../src/game/world/WorldState.ts#L32) | Индекс текущего биома; в деревне связан со следующим биомом. |
| `area` | [33](../src/game/world/WorldState.ts#L33) | Тип области: village, biome, tutorial или interior. |
| `villageIndex` | [34](../src/game/world/WorldState.ts#L34) | Индекс текущей деревни; начальная деревня имеет индекс -1. |
| `lastVillage` | [35](../src/game/world/WorldState.ts#L35) | Индекс последнего посещённого костра для возвращения после смерти. |
| `houses` | [44](../src/game/world/WorldState.ts#L44) | Дома с ролью владельца, дверью, крышей и подписью. |
| `interiorRole` | [45](../src/game/world/WorldState.ts#L45) | Роль владельца открытого дома или null. |
| `interiorReturn` | [46](../src/game/world/WorldState.ts#L46) | После выхода из интерьера вернуться в деревню или учебный двор. |
| `interiorLayer` | [47](../src/game/world/WorldState.ts#L47) | Контейнер внутреннего оформления дома. |
| `interiorShade` | [48](../src/game/world/WorldState.ts#L48) | Затемнение наружного мира при входе в дом. |
| `outdoorArt` | [49](../src/game/world/WorldState.ts#L49) | Наружные объекты, которые скрываются на время интерьера. |
| `wisp` | [56](../src/game/world/WorldState.ts#L56) | Спрайт сопровождаемого огонька или null. |
| `wispFear` | [57](../src/game/world/WorldState.ts#L57) | Время, в течение которого огонёк боится и отступает. |
| `wispPath` | [58](../src/game/world/WorldState.ts#L58) | Текущий путь огонька по свободным клеткам. |
| `wispPathLeft` | [59](../src/game/world/WorldState.ts#L59) | Таймер до пересчёта пути огонька. |
| `weather` | [60](../src/game/world/WorldState.ts#L60) | Текущее погодное событие или clear. |
| `weatherLeft` | [61](../src/game/world/WorldState.ts#L61) | Оставшаяся длительность погодного события. |
| `weatherNext` | [62](../src/game/world/WorldState.ts#L62) | Время до выбора следующей погоды. |
| `strike` | [66](../src/game/world/WorldState.ts#L66) | Активное предупреждение или удар молнии. |
| `strikeNext` | [67](../src/game/world/WorldState.ts#L67) | Время до следующего удара погодного события. |
| `biomeMoods` | [68](../src/game/world/WorldState.ts#L68) | Графические слои затемнения, могил и цветов по биомам. |
| `windSoundLeft` | [74](../src/game/world/WorldState.ts#L74) | Таймер звука урагана. |
| `drawnRegions` | [75](../src/game/world/WorldState.ts#L75) | Биомы, для которых уже созданы декорации. |
| `drawnVillages` | [76](../src/game/world/WorldState.ts#L76) | Деревни, для которых уже созданы дома и жители. |

### [src/game/world/WorldSystem.ts](../src/game/world/WorldSystem.ts)

Границы, переходы между областями, камера, контрольные точки и возрождение.

Строк: 385.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `WorldSystem` | [21](../src/game/world/WorldSystem.ts#L21) | Объявление в этом модуле. |
| `regionBounds` | [23](../src/game/world/WorldSystem.ts#L23) | Границы указанного биома. |
| `playerBounds` | [32](../src/game/world/WorldSystem.ts#L32) | Допустимые границы героя с учётом печати, деревни и интерьера. |
| `activeTerrain` | [69](../src/game/world/WorldSystem.ts#L69) | Выбирает препятствия улицы или комнаты. |
| `configureCamera` | [75](../src/game/world/WorldSystem.ts#L75) | Масштабирует камеру, ведёт героя или центрирует комнату. |
| `freePosition` | [94](../src/game/world/WorldSystem.ts#L94) | Находит свободную точку появления; при неудаче использует сетку навигации. |
| `clearActors` | [116](../src/game/world/WorldSystem.ts#L116) | Удаляет динамические объекты и сбрасывает временные боевые состояния. |
| `startRegion` | [148](../src/game/world/WorldSystem.ts#L148) | Подготавливает биом, врагов и силу, сбрасывает бой и при необходимости запускает сцену похищения. |
| `reachCheckpoint` | [233](../src/game/world/WorldSystem.ts#L233) | Показывает имя достигнутого костра. |
| `respawn` | [240](../src/game/world/WorldSystem.ts#L240) | Возвращает героя после смерти и обновляет испытания непройденного биома. |
| `checkProgress` | [264](../src/game/world/WorldSystem.ts#L264) | Проверяет квоту силы и смерть босса, открывает путь и запускает переходы. |
| `startVillage` | [308](../src/game/world/WorldSystem.ts#L308) | Активирует деревню, костёр, камеру и восстановление при возвращении. |
| `freeNear` | [363](../src/game/world/WorldSystem.ts#L363) | Подбирает ближайшую свободную точку для сюжетного объекта. |

## Деревни

### [src/game/village/Residents.ts](../src/game/village/Residents.ts)

Имена и виды жителей, их реплики, названия домов и ассортимент оружия по деревням.

Строк: 62.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `SPECIES` | [4](../src/game/village/Residents.ts#L4) | Параметры, таблица данных или функция, объявленная константой. |
| `villageStock` | [44](../src/game/village/Residents.ts#L44) | Параметры, таблица данных или функция, объявленная константой. |
| `resident` | [46](../src/game/village/Residents.ts#L46) | Собирает имя, облик, профессию и реплику жителя. |
| `houseName` | [59](../src/game/village/Residents.ts#L59) | Название дома с именем владельца. |
| `villageTradition` | [61](../src/game/village/Residents.ts#L61) | Параметры, таблица данных или функция, объявленная константой. |

### [src/game/village/VillageLayout.ts](../src/game/village/VillageLayout.ts)

Координаты домов, двери, границы интерьеров, препятствия и оформление помещений.

Строк: 67.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `House` | [6](../src/game/village/VillageLayout.ts#L6) | Форма данных для проверки TypeScript. |
| `village` | [7](../src/game/village/VillageLayout.ts#L7) | Поле состояния или ссылка на систему. |
| `role` | [8](../src/game/village/VillageLayout.ts#L8) | Поле состояния или ссылка на систему. |
| `x` | [9](../src/game/village/VillageLayout.ts#L9) | Поле состояния или ссылка на систему. |
| `y` | [10](../src/game/village/VillageLayout.ts#L10) | Поле состояния или ссылка на систему. |
| `door` | [11](../src/game/village/VillageLayout.ts#L11) | Поле состояния или ссылка на систему. |
| `roof` | [12](../src/game/village/VillageLayout.ts#L12) | Поле состояния или ссылка на систему. |
| `label` | [13](../src/game/village/VillageLayout.ts#L13) | Поле состояния или ссылка на систему. |
| `HOUSE_NAMES` | [15](../src/game/village/VillageLayout.ts#L15) | Параметры, таблица данных или функция, объявленная константой. |
| `housePoint` | [21](../src/game/village/VillageLayout.ts#L21) | Координаты дома по деревне и роли жителя. |
| `interiorBounds` | [26](../src/game/village/VillageLayout.ts#L26) | Границы перемещения в комнате. |
| `interiorObstacles` | [35](../src/game/village/VillageLayout.ts#L35) | Непроходимые предметы комнаты. |
| `interiorArt` | [41](../src/game/village/VillageLayout.ts#L41) | Рисует интерьер и его название. |

### [src/game/village/VillageSystem.ts](../src/game/village/VillageSystem.ts)

Дома, собеседники, взаимодействия, доставки и быстрое путешествие.

Строк: 315.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `VillageSystem` | [9](../src/game/village/VillageSystem.ts#L9) | Объявление в этом модуле. |
| `updateCamp` | [11](../src/game/village/VillageSystem.ts#L11) | Выбирает ближайшую дверь, жителя, сундук или предмет для E. |
| `enterHouse` | [73](../src/game/village/VillageSystem.ts#L73) | Скрывает улицу и помещает героя в интерьер дома. |
| `clearInterior` | [103](../src/game/village/VillageSystem.ts#L103) | Удаляет интерьер и возвращает видимость наружных объектов. |
| `exitHouse` | [121](../src/game/village/VillageSystem.ts#L121) | Возвращает героя к двери на улице. |
| `interact` | [137](../src/game/village/VillageSystem.ts#L137) | Исполняет доступное действие E по ближайшей цели. |
| `say` | [188](../src/game/village/VillageSystem.ts#L188) | Начинает постепенный вывод реплики. |
| `leaveDialog` | [194](../src/game/village/VillageSystem.ts#L194) | Закрывает разговор и возвращает управление. |
| `openTravel` | [201](../src/game/village/VillageSystem.ts#L201) | Строит список посещённых деревень для перехода. |
| `closeTravel` | [219](../src/game/village/VillageSystem.ts#L219) | Возвращает из списка путешествий в меню. |
| `travelTo` | [226](../src/game/village/VillageSystem.ts#L226) | Перемещает к доступному посещённому костру. |
| `renderDeliveryTalk` | [248](../src/game/village/VillageSystem.ts#L248) | Обновляет кнопку доставки для текущего жителя. |
| `talkDelivery` | [275](../src/game/village/VillageSystem.ts#L275) | Принимает, передаёт или завершает доставку и выдаёт награду. |

## Торговля и осколки

### [src/game/economy/EconomySystem.ts](../src/game/economy/EconomySystem.ts)

Сбор осколков, кошелёк, ассортимент, покупки и экипировка.

Строк: 319.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `EconomySystem` | [29](../src/game/economy/EconomySystem.ts#L29) | Объявление в этом модуле. |
| `spawnCoin` | [31](../src/game/economy/EconomySystem.ts#L31) | Создаёт осколок в мире. |
| `grantCoins` | [48](../src/game/economy/EconomySystem.ts#L48) | Раздельно меняет кошелёк и силу биома; учитывает лимит наземного дохода. |
| `collectCoins` | [92](../src/game/economy/EconomySystem.ts#L92) | Собирает осколки в радиусе героя и сообщает об этом заданиям. |
| `openShop` | [119](../src/game/economy/EconomySystem.ts#L119) | Открывает магазин и выбирает доступные разделы по роли жителя. |
| `renderShop` | [161](../src/game/economy/EconomySystem.ts#L161) | Обновляет кошелёк, вкладки, страницы и карточки магазина. |
| `itemCards` | [190](../src/game/economy/EconomySystem.ts#L190) | Строит карточки цен, условий открытия и покупки. |
| `applyEquipment` | [251](../src/game/economy/EconomySystem.ts#L251) | Пересчитывает доступные ресурсы и внешний вид после смены вещей. |
| `equip` | [265](../src/game/economy/EconomySystem.ts#L265) | Надевает уже полученную вещь. |
| `buyItem` | [280](../src/game/economy/EconomySystem.ts#L280) | Покупает расходник или вызывает общие правила покупки снаряжения. |

### [src/game/economy/ShopCatalog.ts](../src/game/economy/ShopCatalog.ts)

Зелье, перевязка, заряд фляги и полное лечение: идентификаторы, цены и подписи.

Строк: 31.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `POTION_PRICE` | [1](../src/game/economy/ShopCatalog.ts#L1) | Параметры, таблица данных или функция, объявленная константой. |
| `SUPPLIES` | [2](../src/game/economy/ShopCatalog.ts#L2) | Параметры, таблица данных или функция, объявленная константой. |

## Развитие

### [src/game/progression/Achievements.ts](../src/game/progression/Achievements.ts)

15 достижений и условия их получения по фактам текущего путешествия.

Строк: 140.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `ACHIEVEMENTS` | [2](../src/game/progression/Achievements.ts#L2) | Параметры, таблица данных или функция, объявленная константой. |
| `AchievementId` | [111](../src/game/progression/Achievements.ts#L111) | Форма данных для проверки TypeScript. |
| `AchievementFacts` | [112](../src/game/progression/Achievements.ts#L112) | Форма данных для проверки TypeScript. |
| `bosses` | [113](../src/game/progression/Achievements.ts#L113) | Поле состояния или ссылка на систему. |
| `counters` | [114](../src/game/progression/Achievements.ts#L114) | Поле состояния или ссылка на систему. |
| `skills` | [115](../src/game/progression/Achievements.ts#L115) | Поле состояния или ссылка на систему. |
| `deliveries` | [116](../src/game/progression/Achievements.ts#L116) | Состояния доставок: принято, передано и награда получена. |
| `promise` | [117](../src/game/progression/Achievements.ts#L117) | Поле состояния или ссылка на систему. |
| `kills` | [118](../src/game/progression/Achievements.ts#L118) | Число побеждённых противников текущего путешествия. |
| `returned` | [119](../src/game/progression/Achievements.ts#L119) | Поле состояния или ссылка на систему. |
| `trained` | [120](../src/game/progression/Achievements.ts#L120) | Поле состояния или ссылка на систему. |
| `earnedAchievements` | [122](../src/game/progression/Achievements.ts#L122) | Выбирает достижения по переданным фактам. |

### [src/game/progression/PlayerProgression.ts](../src/game/progression/PlayerProgression.ts)

Каталоги оружия, брони, обликов и улучшений; профиль, цены, покупки и проверка полей профиля.

Строк: 545.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `PROFILE_KEY` | [3](../src/game/progression/PlayerProgression.ts#L3) | Параметры, таблица данных или функция, объявленная константой. |
| `LEGACY_KEYS` | [4](../src/game/progression/PlayerProgression.ts#L4) | Параметры, таблица данных или функция, объявленная константой. |
| `SKINS` | [13](../src/game/progression/PlayerProgression.ts#L13) | Параметры, таблица данных или функция, объявленная константой. |
| `WEAPONS` | [58](../src/game/progression/PlayerProgression.ts#L58) | Параметры, таблица данных или функция, объявленная константой. |
| `WeaponId` | [180](../src/game/progression/PlayerProgression.ts#L180) | Форма данных для проверки TypeScript. |
| `ARMORS` | [181](../src/game/progression/PlayerProgression.ts#L181) | Параметры, таблица данных или функция, объявленная константой. |
| `ArmorId` | [235](../src/game/progression/PlayerProgression.ts#L235) | Форма данных для проверки TypeScript. |
| `ATTRIBUTE_GAIN` | [236](../src/game/progression/PlayerProgression.ts#L236) | Параметры, таблица данных или функция, объявленная константой. |
| `ATTRIBUTE_FIRST_PRICE` | [237](../src/game/progression/PlayerProgression.ts#L237) | Поле состояния или ссылка на систему. |
| `ATTRIBUTE_PRICE_STEP` | [238](../src/game/progression/PlayerProgression.ts#L238) | Поле состояния или ссылка на систему. |
| `AttributeId` | [239](../src/game/progression/PlayerProgression.ts#L239) | Форма данных для проверки TypeScript. |
| `UPGRADES` | [240](../src/game/progression/PlayerProgression.ts#L240) | Параметры, таблица данных или функция, объявленная константой. |
| `UpgradeId` | [326](../src/game/progression/PlayerProgression.ts#L326) | Форма данных для проверки TypeScript. |
| `Profile` | [327](../src/game/progression/PlayerProgression.ts#L327) | Форма данных для проверки TypeScript. |
| `healthLevel` | [328](../src/game/progression/PlayerProgression.ts#L328) | Поле состояния или ссылка на систему. |
| `enduranceLevel` | [329](../src/game/progression/PlayerProgression.ts#L329) | Поле состояния или ссылка на систему. |
| `potions` | [330](../src/game/progression/PlayerProgression.ts#L330) | Поле состояния или ссылка на систему. |
| `trackedQuest` | [331](../src/game/progression/PlayerProgression.ts#L331) | Поле состояния или ссылка на систему. |
| `skills` | [332](../src/game/progression/PlayerProgression.ts#L332) | Поле состояния или ссылка на систему. |
| `unlockedSkills` | [333](../src/game/progression/PlayerProgression.ts#L333) | Поле состояния или ссылка на систему. |
| `disabledSkills` | [334](../src/game/progression/PlayerProgression.ts#L334) | Поле состояния или ссылка на систему. |
| `skillPoints` | [335](../src/game/progression/PlayerProgression.ts#L335) | Поле состояния или ссылка на систему. |
| `achievements` | [336](../src/game/progression/PlayerProgression.ts#L336) | Поле состояния или ссылка на систему. |
| `counterWins` | [337](../src/game/progression/PlayerProgression.ts#L337) | Поле состояния или ссылка на систему. |
| `coins` | [338](../src/game/progression/PlayerProgression.ts#L338) | Осколки в мире. Кошелёк находится в journey.profile.coins. |
| `owned` | [339](../src/game/progression/PlayerProgression.ts#L339) | Поле состояния или ссылка на систему. |
| `skin` | [340](../src/game/progression/PlayerProgression.ts#L340) | Поле состояния или ссылка на систему. |
| `blade` | [341](../src/game/progression/PlayerProgression.ts#L341) | Поле состояния или ссылка на систему. |
| `upgrades` | [342](../src/game/progression/PlayerProgression.ts#L342) | Поле состояния или ссылка на систему. |
| `weapons` | [343](../src/game/progression/PlayerProgression.ts#L343) | Поле состояния или ссылка на систему. |
| `weapon` | [344](../src/game/progression/PlayerProgression.ts#L344) | Поле состояния или ссылка на систему. |
| `relics` | [345](../src/game/progression/PlayerProgression.ts#L345) | Поле состояния или ссылка на систему. |
| `armors` | [346](../src/game/progression/PlayerProgression.ts#L346) | Поле состояния или ссылка на систему. |
| `armor` | [347](../src/game/progression/PlayerProgression.ts#L347) | Поле состояния или ссылка на систему. |
| `newProfile` | [349](../src/game/progression/PlayerProgression.ts#L349) | Начальные покупки, ресурсы развития и снаряжение. |
| `weaponFor` | [384](../src/game/progression/PlayerProgression.ts#L384) | Параметры выбранного оружия; при неизвестном id возвращает меч. |
| `armorFor` | [385](../src/game/progression/PlayerProgression.ts#L385) | Параметры надетой брони. |
| `isAttribute` | [386](../src/game/progression/PlayerProgression.ts#L386) | Проверка повторного улучшения vitality или focus. |
| `attributeLevel` | [387](../src/game/progression/PlayerProgression.ts#L387) | Текущий уровень повторного усиления. |
| `id` | [388](../src/game/progression/PlayerProgression.ts#L388) | Поле состояния или ссылка на систему. |
| `attributePrice` | [389](../src/game/progression/PlayerProgression.ts#L389) | Цена следующего усиления HP или выносливости. |
| `parseProfile` | [391](../src/game/progression/PlayerProgression.ts#L391) | Проверяет профиль и отбрасывает неизвестные предметы и навыки. |
| `itemUnlock` | [467](../src/game/progression/PlayerProgression.ts#L467) | Количество печатей для открытия предмета или ступени улучшения. |
| `isAttribute` | [468](../src/game/progression/PlayerProgression.ts#L468) | Проверка повторного улучшения vitality или focus. |
| `purchase` | [491](../src/game/progression/PlayerProgression.ts#L491) | Проверяет цену, печати и владение; списывает валюту и меняет профиль. |

### [src/game/progression/Skills.ts](../src/game/progression/Skills.ts)

12 оружейных навыков: цена, требуемые печати, изучение, отключение и возврат искр.

Строк: 183.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `WeaponStyle` | [2](../src/game/progression/Skills.ts#L2) | Форма данных для проверки TypeScript. |
| `SKILL_TREE` | [3](../src/game/progression/Skills.ts#L3) | Параметры, таблица данных или функция, объявленная константой. |
| `SkillId` | [150](../src/game/progression/Skills.ts#L150) | Форма данных для проверки TypeScript. |
| `learnSkill` | [151](../src/game/progression/Skills.ts#L151) | Проверяет ветку, печати, искры и оплату навыка. |
| `refundBranch` | [168](../src/game/progression/Skills.ts#L168) | Возвращает искры ветки, сохраняя оплаченное открытие. |
| `toggleSkill` | [177](../src/game/progression/Skills.ts#L177) | Убирает изученный навык с панели или возвращает его. |

## Задания и награды

### [src/game/quests/Journal.ts](../src/game/quests/Journal.ts)

Описания испытаний и сборка записей о сюжетных поручениях и доставках.

Строк: 143.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `JournalEntry` | [13](../src/game/quests/Journal.ts#L13) | Форма данных для проверки TypeScript. |
| `id` | [14](../src/game/quests/Journal.ts#L14) | Поле состояния или ссылка на систему. |
| `title` | [15](../src/game/quests/Journal.ts#L15) | Поле состояния или ссылка на систему. |
| `why` | [16](../src/game/quests/Journal.ts#L16) | Поле состояния или ссылка на систему. |
| `status` | [17](../src/game/quests/Journal.ts#L17) | Поле состояния или ссылка на систему. |
| `next` | [18](../src/game/quests/Journal.ts#L18) | Поле состояния или ссылка на систему. |
| `steps` | [19](../src/game/quests/Journal.ts#L19) | Поле состояния или ссылка на систему. |
| `reward` | [20](../src/game/quests/Journal.ts#L20) | Поле состояния или ссылка на систему. |
| `done` | [21](../src/game/quests/Journal.ts#L21) | Поле состояния или ссылка на систему. |
| `available` | [22](../src/game/quests/Journal.ts#L22) | Поле состояния или ссылка на систему. |
| `point` | [23](../src/game/quests/Journal.ts#L23) | Поле состояния или ссылка на систему. |
| `region` | [24](../src/game/quests/Journal.ts#L24) | Поле состояния или ссылка на систему. |
| `village` | [25](../src/game/quests/Journal.ts#L25) | Поле состояния или ссылка на систему. |
| `QUEST_NOTES` | [27](../src/game/quests/Journal.ts#L27) | Параметры, таблица данных или функция, объявленная константой. |
| `lineJournal` | [50](../src/game/quests/Journal.ts#L50) | Запись и цель сюжетного поручения. |
| `deliveryJournal` | [108](../src/game/quests/Journal.ts#L108) | Запись и цель доставки. |

### [src/game/quests/QuestSystem.ts](../src/game/quests/QuestSystem.ts)

Испытания, сундуки, сюжетные поручения, журнал и достижения.

Строк: 533.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `QuestSystem` | [16](../src/game/quests/QuestSystem.ts#L16) | Объявление в этом модуле. |
| `resetAttemptRewards` | [18](../src/game/quests/QuestSystem.ts#L18) | Удаляет сундуки непройденного биома и сбрасывает его испытания после смерти. |
| `onQuestEvent` | [25](../src/game/quests/QuestSystem.ts#L25) | Передаёт событие испытаниям и создаёт сундук за новый успех. |
| `spawnChest` | [40](../src/game/quests/QuestSystem.ts#L40) | Создаёт один сундук для пары биом–испытание. |
| `openChest` | [50](../src/game/quests/QuestSystem.ts#L50) | Проверяет расстояние и открытость, выбирает награду и запускает рулетку. |
| `applyLoot` | [87](../src/game/quests/QuestSystem.ts#L87) | Выдаёт выбранную награду один раз и обновляет интерфейс. |
| `syncAchievements` | [127](../src/game/quests/QuestSystem.ts#L127) | Вычисляет новые достижения и ставит их в очередь уведомлений. |
| `updateAchievementNotice` | [148](../src/game/quests/QuestSystem.ts#L148) | Показывает очередное достижение ограниченное время. |
| `renderAchievements` | [172](../src/game/quests/QuestSystem.ts#L172) | Строит страницу открытых и закрытых достижений. |
| `journalEntries` | [193](../src/game/quests/QuestSystem.ts#L193) | Собирает записи испытаний, сюжетных поручений и доставок. |
| `trackQuest` | [300](../src/game/quests/QuestSystem.ts#L300) | Выбирает отслеживаемое задание и соответствующую отметку на карте. |
| `renderQuests` | [312](../src/game/quests/QuestSystem.ts#L312) | Рисует выбранный раздел и страницу журнала. |
| `renderQuestTalk` | [332](../src/game/quests/QuestSystem.ts#L332) | Обновляет доступность сюжетного поручения у жителя. |
| `talkQuest` | [353](../src/game/quests/QuestSystem.ts#L353) | Принимает поручение или выдаёт награду за завершение. |
| `makeQuestProps` | [392](../src/game/quests/QuestSystem.ts#L392) | Создаёт предметы поручений и сопровождаемого огонька. |
| `touchQuestProp` | [447](../src/game/quests/QuestSystem.ts#L447) | Обрабатывает чтение или подбор сюжетного предмета. |
| `updateWisp` | [482](../src/game/quests/QuestSystem.ts#L482) | Ведёт сопровождаемого огонька, учитывает страх и возвращение к цели. |

### [src/game/quests/TrialsAndLoot.ts](../src/game/quests/TrialsAndLoot.ts)

Три повторяемых испытания, события их прогресса и случайные награды сундуков.

Строк: 168.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `Quest` | [10](../src/game/quests/TrialsAndLoot.ts#L10) | Форма данных для проверки TypeScript. |
| `id` | [11](../src/game/quests/TrialsAndLoot.ts#L11) | Поле состояния или ссылка на систему. |
| `name` | [12](../src/game/quests/TrialsAndLoot.ts#L12) | Поле состояния или ссылка на систему. |
| `description` | [13](../src/game/quests/TrialsAndLoot.ts#L13) | Поле состояния или ссылка на систему. |
| `progress` | [14](../src/game/quests/TrialsAndLoot.ts#L14) | Прогресс по биомам: сила, время, босс, очищение, доход и однократная награда. |
| `target` | [15](../src/game/quests/TrialsAndLoot.ts#L15) | Поле состояния или ссылка на систему. |
| `elapsed` | [16](../src/game/quests/TrialsAndLoot.ts#L16) | Игровое время путешествия, секунды. |
| `limit` | [17](../src/game/quests/TrialsAndLoot.ts#L17) | Поле состояния или ссылка на систему. |
| `complete` | [18](../src/game/quests/TrialsAndLoot.ts#L18) | Поле состояния или ссылка на систему. |
| `failed` | [19](../src/game/quests/TrialsAndLoot.ts#L19) | Поле состояния или ссылка на систему. |
| `kills` | [20](../src/game/quests/TrialsAndLoot.ts#L20) | Число побеждённых противников текущего путешествия. |
| `newQuests` | [22](../src/game/quests/TrialsAndLoot.ts#L22) | Создаёт три испытания нового биома. |
| `advanceQuests` | [62](../src/game/quests/TrialsAndLoot.ts#L62) | Ведёт таймер и окно серии убийств. |
| `questEvent` | [73](../src/game/quests/TrialsAndLoot.ts#L73) | Засчитывает действия, сбрасывает серию от урона и возвращает новые успехи. |
| `Loot` | [92](../src/game/quests/TrialsAndLoot.ts#L92) | Форма данных для проверки TypeScript. |
| `kind` | [93](../src/game/quests/TrialsAndLoot.ts#L93) | Поле состояния или ссылка на систему. |
| `name` | [94](../src/game/quests/TrialsAndLoot.ts#L94) | Поле состояния или ссылка на систему. |
| `icon` | [95](../src/game/quests/TrialsAndLoot.ts#L95) | Поле состояния или ссылка на систему. |
| `value` | [96](../src/game/quests/TrialsAndLoot.ts#L96) | Поле состояния или ссылка на систему. |
| `item` | [97](../src/game/quests/TrialsAndLoot.ts#L97) | Поле состояния или ссылка на систему. |
| `color` | [98](../src/game/quests/TrialsAndLoot.ts#L98) | Поле состояния или ссылка на систему. |
| `LOOT_ODDS` | [100](../src/game/quests/TrialsAndLoot.ts#L100) | Параметры, таблица данных или функция, объявленная константой. |
| `rollLoot` | [102](../src/game/quests/TrialsAndLoot.ts#L102) | Выбирает награду по вероятностям и доступным предметам. |

## История и обучение

### [src/game/story/StoryContent.ts](../src/game/story/StoryContent.ts)

Вступление, финал, практические уроки, роли жителей, сюжетные поручения и доставки.

Строк: 247.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `Area` | [1](../src/game/story/StoryContent.ts#L1) | Форма данных для проверки TypeScript. |
| `Role` | [2](../src/game/story/StoryContent.ts#L2) | Форма данных для проверки TypeScript. |
| `PEOPLE` | [3](../src/game/story/StoryContent.ts#L3) | Параметры, таблица данных или функция, объявленная константой. |
| `OPENING` | [37](../src/game/story/StoryContent.ts#L37) | Параметры, таблица данных или функция, объявленная константой. |
| `ENDING` | [59](../src/game/story/StoryContent.ts#L59) | Параметры, таблица данных или функция, объявленная константой. |
| `LESSONS` | [71](../src/game/story/StoryContent.ts#L71) | Параметры, таблица данных или функция, объявленная константой. |
| `LineId` | [139](../src/game/story/StoryContent.ts#L139) | Форма данных для проверки TypeScript. |
| `QuestLine` | [140](../src/game/story/StoryContent.ts#L140) | Форма данных для проверки TypeScript. |
| `id` | [141](../src/game/story/StoryContent.ts#L141) | Поле состояния или ссылка на систему. |
| `accepted` | [142](../src/game/story/StoryContent.ts#L142) | Поле состояния или ссылка на систему. |
| `kills` | [143](../src/game/story/StoryContent.ts#L143) | Число побеждённых противников текущего путешествия. |
| `artifact` | [144](../src/game/story/StoryContent.ts#L144) | Поле состояния или ссылка на систему. |
| `runes` | [145](../src/game/story/StoryContent.ts#L145) | Поле состояния или ссылка на систему. |
| `escorted` | [146](../src/game/story/StoryContent.ts#L146) | Поле состояния или ссылка на систему. |
| `claimed` | [147](../src/game/story/StoryContent.ts#L147) | Поле состояния или ссылка на систему. |
| `newLines` | [149](../src/game/story/StoryContent.ts#L149) | Параметры, таблица данных или функция, объявленная константой. |
| `LINES` | [159](../src/game/story/StoryContent.ts#L159) | Параметры, таблица данных или функция, объявленная константой. |
| `lineReady` | [194](../src/game/story/StoryContent.ts#L194) | Проверяет выполнение сюжетного поручения. |
| `DeliveryId` | [203](../src/game/story/StoryContent.ts#L203) | Форма данных для проверки TypeScript. |
| `Delivery` | [204](../src/game/story/StoryContent.ts#L204) | Форма данных для проверки TypeScript. |
| `id` | [205](../src/game/story/StoryContent.ts#L205) | Поле состояния или ссылка на систему. |
| `accepted` | [206](../src/game/story/StoryContent.ts#L206) | Поле состояния или ссылка на систему. |
| `delivered` | [207](../src/game/story/StoryContent.ts#L207) | Поле состояния или ссылка на систему. |
| `claimed` | [208](../src/game/story/StoryContent.ts#L208) | Поле состояния или ссылка на систему. |
| `newDeliveries` | [210](../src/game/story/StoryContent.ts#L210) | Параметры, таблица данных или функция, объявленная константой. |
| `DELIVERIES` | [214](../src/game/story/StoryContent.ts#L214) | Параметры, таблица данных или функция, объявленная константой. |
| `INTRO_DURATION` | [245](../src/game/story/StoryContent.ts#L245) | Параметры, таблица данных или функция, объявленная константой. |
| `WEAPON_STEAL_AT` | [246](../src/game/story/StoryContent.ts#L246) | Параметры, таблица данных или функция, объявленная константой. |
| `WEAPON_BREAK_AT` | [247](../src/game/story/StoryContent.ts#L247) | Параметры, таблица данных или функция, объявленная константой. |

### [src/game/story/StorySystem.ts](../src/game/story/StorySystem.ts)

Новое путешествие, сюжетные сцены и похищение оружия.

Строк: 367.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `StorySystem` | [18](../src/game/story/StorySystem.ts#L18) | Объявление в этом модуле. |
| `newJourney` | [20](../src/game/story/StorySystem.ts#L20) | Начинает чистое путешествие с выбранным обучением. |
| `beginIntro` | [30](../src/game/story/StorySystem.ts#L30) | Запускает появление призрака и похищение оружия в биоме. |
| `clearReaper` | [64](../src/game/story/StorySystem.ts#L64) | Скрывает призрака, оружие и его графические эффекты. |
| `updateIntro` | [70](../src/game/story/StorySystem.ts#L70) | Двигает призрака, отрывает и ломает оружие по времени сцены. |
| `finishIntro` | [150](../src/game/story/StorySystem.ts#L150) | Закрывает сцену, оставляет героя без оружия до сбора силы. |
| `resetJourney` | [165](../src/game/story/StorySystem.ts#L165) | Сбрасывает профиль, прогресс, задания, статистику и мир текущей игры. |
| `beginStory` | [227](../src/game/story/StorySystem.ts#L227) | Запускает вступление или финальные кадры. |
| `renderStoryText` | [241](../src/game/story/StorySystem.ts#L241) | Обновляет текст и номер сюжетного кадра. |
| `advanceStory` | [251](../src/game/story/StorySystem.ts#L251) | Переходит к следующему кадру или завершает историю. |
| `updateStory` | [262](../src/game/story/StorySystem.ts#L262) | Анимирует кадр и отсчитывает время до следующего. |
| `finishStory` | [268](../src/game/story/StorySystem.ts#L268) | После вступления запускает обучение или первый биом, после финала открывает свободное исследование. |
| `drawStory` | [292](../src/game/story/StorySystem.ts#L292) | Рисует кадр на сюжетном canvas. |

### [src/game/story/TutorialContent.ts](../src/game/story/TutorialContent.ts)

Шесть вводных карточек, клавиши-подсказки и выбор цели для учебной стрелки.

Строк: 119.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `BRIEFING_CARDS` | [3](../src/game/story/TutorialContent.ts#L3) | Параметры, таблица данных или функция, объявленная константой. |
| `LESSON_CUES` | [36](../src/game/story/TutorialContent.ts#L36) | Параметры, таблица данных или функция, объявленная константой. |
| `lessonPoint` | [94](../src/game/story/TutorialContent.ts#L94) | Выбирает ближайшую цель текущего урока. |

### [src/game/story/TutorialSystem.ts](../src/game/story/TutorialSystem.ts)

Вводные карточки, практические уроки и подсказки обучения.

Строк: 273.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `TutorialSystem` | [10](../src/game/story/TutorialSystem.ts#L10) | Объявление в этом модуле. |
| `trainingArea` | [12](../src/game/story/TutorialSystem.ts#L12) | Проверяет учебный двор и его интерьер. |
| `renderBriefing` | [19](../src/game/story/TutorialSystem.ts#L19) | Показывает выбранную вводную карточку. |
| `startLessons` | [30](../src/game/story/TutorialSystem.ts#L30) | Закрывает карточки и начинает практический урок. |
| `teachingPoint` | [41](../src/game/story/TutorialSystem.ts#L41) | Выбирает цель подсказки: осколок, врага, дверь или жителя. |
| `drawTeachingCue` | [57](../src/game/story/TutorialSystem.ts#L57) | Рисует учебный круг и стрелку. |
| `updateTeachingUI` | [92](../src/game/story/TutorialSystem.ts#L92) | Подсвечивает нужные клавиши и элементы интерфейса. |
| `beginTutorial` | [136](../src/game/story/TutorialSystem.ts#L136) | Подготавливает учебный двор, героя и вводные карточки. |
| `lessonEvent` | [155](../src/game/story/TutorialSystem.ts#L155) | Засчитывает нужное действие и переключает урок после достижения цели. |
| `prepareLesson` | [175](../src/game/story/TutorialSystem.ts#L175) | Создаёт или настраивает объекты текущего урока. |
| `renderLesson` | [233](../src/game/story/TutorialSystem.ts#L233) | Показывает задание, клавиши и прогресс. |
| `finishTutorial` | [249](../src/game/story/TutorialSystem.ts#L249) | Завершает обучение и возвращает к начальной деревне. |

## Графика и анимация

### [src/game/rendering/ActorRenderer.ts](../src/game/rendering/ActorRenderer.ts)

Позы, руки, оружие, враги, жители и отрисовка границ биома.

Строк: 785.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `ActorRenderer` | [14](../src/game/rendering/ActorRenderer.ts#L14) | Объявление в этом модуле. |
| `animateResidents` | [16](../src/game/rendering/ActorRenderer.ts#L16) | Обновляет видимость, позы и жесты жителей. |
| `hideArms` | [67](../src/game/rendering/ActorRenderer.ts#L67) | Скрывает части рук героя. |
| `bodyPoint` | [72](../src/game/rendering/ActorRenderer.ts#L72) | Переводит локальную точку тела в мировые координаты. |
| `reachableGrip` | [80](../src/game/rendering/ActorRenderer.ts#L80) | Ограничивает хват длиной руки. |
| `drawArm` | [90](../src/game/rendering/ActorRenderer.ts#L90) | Ставит плечо, предплечье и кисть между телом и хватом. |
| `drawActors` | [132](../src/game/rendering/ActorRenderer.ts#L132) | Рисует героя, броню, оружие, врагов, монеты, зоны атак и эффекты. |
| `drawGates` | [743](../src/game/rendering/ActorRenderer.ts#L743) | Рисует закрытые печати и обновляет вид очищенных биомов. |

### [src/game/rendering/Atmosphere.ts](../src/game/rendering/Atmosphere.ts)

Слои тумана, могил и цветов; смена облика очищенного биома.

Строк: 75.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `BiomeMood` | [3](../src/game/rendering/Atmosphere.ts#L3) | Форма данных для проверки TypeScript. |
| `floor` | [4](../src/game/rendering/Atmosphere.ts#L4) | Поле состояния или ссылка на систему. |
| `terrain` | [5](../src/game/rendering/Atmosphere.ts#L5) | Общий список препятствий наружного мира. |
| `shade` | [6](../src/game/rendering/Atmosphere.ts#L6) | Поле состояния или ссылка на систему. |
| `graves` | [7](../src/game/rendering/Atmosphere.ts#L7) | Поле состояния или ссылка на систему. |
| `flowers` | [8](../src/game/rendering/Atmosphere.ts#L8) | Поле состояния или ссылка на систему. |
| `cleared` | [9](../src/game/rendering/Atmosphere.ts#L9) | Поле состояния или ссылка на систему. |
| `inside` | [10](../src/game/rendering/Atmosphere.ts#L10) | Поле состояния или ссылка на систему. |
| `createBiomeMood` | [12](../src/game/rendering/Atmosphere.ts#L12) | Создаёт слои тумана, могил и цветов. |
| `setBiomeMood` | [66](../src/game/rendering/Atmosphere.ts#L66) | Переключает внешний вид очищенного биома. |

### [src/game/rendering/RenderState.ts](../src/game/rendering/RenderState.ts)

Ссылки на объекты Phaser, анимации и пулы графических эффектов.

Строк: 37.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `RenderState` | [4](../src/game/rendering/RenderState.ts#L4) | Объявление в этом модуле. |
| `player` | [5](../src/game/rendering/RenderState.ts#L5) | Спрайт героя в мире. Логика героя находится в PlayerController, ресурсы — в PlayerState. |
| `playerShadow` | [6](../src/game/rendering/RenderState.ts#L6) | Тень спрайта героя. |
| `sword` | [7](../src/game/rendering/RenderState.ts#L7) | Спрайт удерживаемого оружия любого типа. |
| `armorSprite` | [8](../src/game/rendering/RenderState.ts#L8) | Отдельный слой изображения надетой брони. |
| `combatInk` | [9](../src/game/rendering/RenderState.ts#L9) | Графика зон атак, прицелов и боевых эффектов. |
| `weatherInk` | [10](../src/game/rendering/RenderState.ts#L10) | Графика погодных зон и осадков. |
| `gateInk` | [11](../src/game/rendering/RenderState.ts#L11) | Графика закрытых границ и печатей. |
| `reaper` | [12](../src/game/rendering/RenderState.ts#L12) | Спрайт призрака, похищающего оружие. |
| `stolenWeapon` | [13](../src/game/rendering/RenderState.ts#L13) | Спрайт оружия в сцене похищения. |
| `reaperInk` | [14](../src/game/rendering/RenderState.ts#L14) | Графические эффекты сцены призрака. |
| `animationTime` | [25](../src/game/rendering/RenderState.ts#L25) | Общее время визуальных анимаций. |
| `weaponTrail` | [31](../src/game/rendering/RenderState.ts#L31) | Точки следа кончика оружия. |
| `trailWeapon` | [32](../src/game/rendering/RenderState.ts#L32) | ID оружия, для которого был создан текущий след. |
| `trailAttack` | [33](../src/game/rendering/RenderState.ts#L33) | Время атаки, связанной с текущим следом. |
| `attackImages` | [34](../src/game/rendering/RenderState.ts#L34) | Пул переиспользуемых спрайтов эффектов атак. |
| `attackImageCursor` | [35](../src/game/rendering/RenderState.ts#L35) | Следующий элемент пула эффектов для текущего кадра. |
| `liveParticles` | [36](../src/game/rendering/RenderState.ts#L36) | Число живых частиц для ограничения их количества. |

### [src/game/rendering/TextureFactory.ts](../src/game/rendering/TextureFactory.ts)

Генерирует процедурные текстуры и нарезает рисованные атласы героя, оружия, врагов и окружения.

Строк: 2065.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `mergeScenery` | [13](../src/game/rendering/TextureFactory.ts#L13) | Запекает неподвижный декор в существующий слой. |
| `localScenery` | [20](../src/game/rendering/TextureFactory.ts#L20) | Объявление в этом модуле. |
| `bakeScenery` | [24](../src/game/rendering/TextureFactory.ts#L24) | Создаёт отдельный запечённый растровый слой. |
| `localScenery` | [33](../src/game/rendering/TextureFactory.ts#L33) | Объявление в этом модуле. |
| `createArmArtwork` | [40](../src/game/rendering/TextureFactory.ts#L40) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `Palette` | [81](../src/game/rendering/TextureFactory.ts#L81) | Форма данных для проверки TypeScript. |
| `ground` | [82](../src/game/rendering/TextureFactory.ts#L82) | Поле состояния или ссылка на систему. |
| `light` | [83](../src/game/rendering/TextureFactory.ts#L83) | Поле состояния или ссылка на систему. |
| `grass` | [84](../src/game/rendering/TextureFactory.ts#L84) | Поле состояния или ссылка на систему. |
| `tree` | [85](../src/game/rendering/TextureFactory.ts#L85) | Поле состояния или ссылка на систему. |
| `accent` | [86](../src/game/rendering/TextureFactory.ts#L86) | Поле состояния или ссылка на систему. |
| `draw` | [93](../src/game/rendering/TextureFactory.ts#L93) | Поле состояния или ссылка на систему. |
| `draw` | [100](../src/game/rendering/TextureFactory.ts#L100) | Объявление в этом модуле. |
| `createArtwork` | [118](../src/game/rendering/TextureFactory.ts#L118) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `texture` | [205](../src/game/rendering/TextureFactory.ts#L205) | Объявление в этом модуле. |
| `texture` | [231](../src/game/rendering/TextureFactory.ts#L231) | Объявление в этом модуле. |
| `texture` | [258](../src/game/rendering/TextureFactory.ts#L258) | Объявление в этом модуле. |
| `texture` | [274](../src/game/rendering/TextureFactory.ts#L274) | Объявление в этом модуле. |
| `texture` | [314](../src/game/rendering/TextureFactory.ts#L314) | Объявление в этом модуле. |
| `texture` | [339](../src/game/rendering/TextureFactory.ts#L339) | Объявление в этом модуле. |
| `texture` | [376](../src/game/rendering/TextureFactory.ts#L376) | Объявление в этом модуле. |
| `texture` | [413](../src/game/rendering/TextureFactory.ts#L413) | Объявление в этом модуле. |
| `texture` | [442](../src/game/rendering/TextureFactory.ts#L442) | Объявление в этом модуле. |
| `texture` | [469](../src/game/rendering/TextureFactory.ts#L469) | Объявление в этом модуле. |
| `texture` | [490](../src/game/rendering/TextureFactory.ts#L490) | Объявление в этом модуле. |
| `texture` | [516](../src/game/rendering/TextureFactory.ts#L516) | Объявление в этом модуле. |
| `texture` | [539](../src/game/rendering/TextureFactory.ts#L539) | Объявление в этом модуле. |
| `texture` | [568](../src/game/rendering/TextureFactory.ts#L568) | Объявление в этом модуле. |
| `background` | [584](../src/game/rendering/TextureFactory.ts#L584) | Объявление в этом модуле. |
| `createMysticArtwork` | [820](../src/game/rendering/TextureFactory.ts#L820) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `texture` | [821](../src/game/rendering/TextureFactory.ts#L821) | Объявление в этом модуле. |
| `texture` | [859](../src/game/rendering/TextureFactory.ts#L859) | Объявление в этом модуле. |
| `texture` | [935](../src/game/rendering/TextureFactory.ts#L935) | Объявление в этом модуле. |
| `texture` | [993](../src/game/rendering/TextureFactory.ts#L993) | Объявление в этом модуле. |
| `texture` | [1052](../src/game/rendering/TextureFactory.ts#L1052) | Объявление в этом модуле. |
| `texture` | [1114](../src/game/rendering/TextureFactory.ts#L1114) | Объявление в этом модуле. |
| `texture` | [1188](../src/game/rendering/TextureFactory.ts#L1188) | Объявление в этом модуле. |
| `texture` | [1221](../src/game/rendering/TextureFactory.ts#L1221) | Объявление в этом модуле. |
| `texture` | [1250](../src/game/rendering/TextureFactory.ts#L1250) | Объявление в этом модуле. |
| `createVillageArtwork` | [1346](../src/game/rendering/TextureFactory.ts#L1346) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `texture` | [1378](../src/game/rendering/TextureFactory.ts#L1378) | Объявление в этом модуле. |
| `texture` | [1399](../src/game/rendering/TextureFactory.ts#L1399) | Объявление в этом модуле. |
| `texture` | [1417](../src/game/rendering/TextureFactory.ts#L1417) | Объявление в этом модуле. |
| `texture` | [1466](../src/game/rendering/TextureFactory.ts#L1466) | Объявление в этом модуле. |
| `createAtlasArtwork` | [1479](../src/game/rendering/TextureFactory.ts#L1479) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `texture` | [1510](../src/game/rendering/TextureFactory.ts#L1510) | Объявление в этом модуле. |
| `texture` | [1539](../src/game/rendering/TextureFactory.ts#L1539) | Объявление в этом модуле. |
| `createCreepyArtwork` | [1585](../src/game/rendering/TextureFactory.ts#L1585) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `biomeGround` | [1609](../src/game/rendering/TextureFactory.ts#L1609) | Объявление в этом модуле. |
| `mergeScenery` | [1694](../src/game/rendering/TextureFactory.ts#L1694) | Запекает неподвижный декор в существующий слой. |
| `createHeroArtwork` | [1723](../src/game/rendering/TextureFactory.ts#L1723) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `createDetailArtwork` | [1752](../src/game/rendering/TextureFactory.ts#L1752) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `createCombatArtwork` | [1800](../src/game/rendering/TextureFactory.ts#L1800) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `createEquipmentArtwork` | [1843](../src/game/rendering/TextureFactory.ts#L1843) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `createArmedMotionArtwork` | [1875](../src/game/rendering/TextureFactory.ts#L1875) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `createStrideArtwork` | [1956](../src/game/rendering/TextureFactory.ts#L1956) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `createMotionArtwork` | [1957](../src/game/rendering/TextureFactory.ts#L1957) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `createRollArtwork` | [1959](../src/game/rendering/TextureFactory.ts#L1959) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `createMotionArtwork` | [1960](../src/game/rendering/TextureFactory.ts#L1960) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |
| `createResidentArtwork` | [2000](../src/game/rendering/TextureFactory.ts#L2000) | Создаёт соответствующие текстуры персонажей, предметов или окружения. |

### [src/game/rendering/WeaponAnimation.ts](../src/game/rendering/WeaponAnimation.ts)

Точки хвата оружия, замах, активная фаза, возврат, перекат и положение локтя.

Строк: 216.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `WEAPON_ART` | [11](../src/game/rendering/WeaponAnimation.ts#L11) | Параметры, таблица данных или функция, объявленная константой. |
| `WEAPON_SIZE` | [22](../src/game/rendering/WeaponAnimation.ts#L22) | Параметры, таблица данных или функция, объявленная константой. |
| `weaponTexture` | [25](../src/game/rendering/WeaponAnimation.ts#L25) | Параметры, таблица данных или функция, объявленная константой. |
| `WeaponMotion` | [26](../src/game/rendering/WeaponAnimation.ts#L26) | Форма данных для проверки TypeScript. |
| `combo` | [27](../src/game/rendering/WeaponAnimation.ts#L27) | Индекс удара в трёхчастном комбо: 0, 1 или 2. |
| `skill` | [28](../src/game/rendering/WeaponAnimation.ts#L28) | Поле состояния или ссылка на систему. |
| `guard` | [29](../src/game/rendering/WeaponAnimation.ts#L29) | Поле состояния или ссылка на систему. |
| `runPhase` | [30](../src/game/rendering/WeaponAnimation.ts#L30) | Поле состояния или ссылка на систему. |
| `roll` | [31](../src/game/rendering/WeaponAnimation.ts#L31) | Поле состояния или ссылка на систему. |
| `chain` | [32](../src/game/rendering/WeaponAnimation.ts#L32) | Поле состояния или ссылка на систему. |
| `ROLL_GRIPS` | [35](../src/game/rendering/WeaponAnimation.ts#L35) | Параметры, таблица данных или функция, объявленная константой. |
| `weaponPose` | [62](../src/game/rendering/WeaponAnimation.ts#L62) | Вычисляет позу оружия и рук для текущей фазы действия. |
| `heavy` | [70](../src/game/rendering/WeaponAnimation.ts#L70) | Поле состояния или ссылка на систему. |
| `motion` | [71](../src/game/rendering/WeaponAnimation.ts#L71) | Поле состояния или ссылка на систему. |
| `UPPER_ARM_LENGTH` | [197](../src/game/rendering/WeaponAnimation.ts#L197) | Параметры, таблица данных или функция, объявленная константой. |
| `FOREARM_LENGTH` | [198](../src/game/rendering/WeaponAnimation.ts#L198) | Поле состояния или ссылка на систему. |
| `armElbow` | [199](../src/game/rendering/WeaponAnimation.ts#L199) | Вычисляет локоть по плечу, кисти и длинам сегментов руки. |
| `shoulder` | [200](../src/game/rendering/WeaponAnimation.ts#L200) | Поле состояния или ссылка на систему. |
| `hand` | [201](../src/game/rendering/WeaponAnimation.ts#L201) | Поле состояния или ссылка на систему. |

## Музыка и звук

### [src/game/audio/GameAudio.ts](../src/game/audio/GameAudio.ts)

Звуковые эффекты Web Audio, громкость, шаги, погода и резервная синтезированная музыка.

Строк: 467.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `Sound` | [4](../src/game/audio/GameAudio.ts#L4) | Форма данных для проверки TypeScript. |
| `AudioSettings` | [30](../src/game/audio/GameAudio.ts#L30) | Форма данных для проверки TypeScript. |
| `master` | [31](../src/game/audio/GameAudio.ts#L31) | Поле состояния или ссылка на систему. |
| `music` | [32](../src/game/audio/GameAudio.ts#L32) | Поле состояния или ссылка на систему. |
| `effects` | [33](../src/game/audio/GameAudio.ts#L33) | Короткоживущие дуги, кольца и следы выпадов. |
| `muted` | [34](../src/game/audio/GameAudio.ts#L34) | Поле состояния или ссылка на систему. |
| `DEFAULT_AUDIO` | [36](../src/game/audio/GameAudio.ts#L36) | Параметры, таблица данных или функция, объявленная константой. |
| `ForestAudio` | [51](../src/game/audio/GameAudio.ts#L51) | Объявление в этом модуле. |
| `settings` | [52](../src/game/audio/GameAudio.ts#L52) | Поле состояния или ссылка на систему. |
| `available` | [53](../src/game/audio/GameAudio.ts#L53) | Поле состояния или ссылка на систему. |
| `context` | [54](../src/game/audio/GameAudio.ts#L54) | Поле состояния или ссылка на систему. |
| `master` | [55](../src/game/audio/GameAudio.ts#L55) | Поле состояния или ссылка на систему. |
| `music` | [56](../src/game/audio/GameAudio.ts#L56) | Поле состояния или ссылка на систему. |
| `guitar` | [57](../src/game/audio/GameAudio.ts#L57) | Поле состояния или ссылка на систему. |
| `recorded` | [58](../src/game/audio/GameAudio.ts#L58) | Поле состояния или ссылка на систему. |
| `mode` | [59](../src/game/audio/GameAudio.ts#L59) | Поле состояния или ссылка на систему. |
| `ambientLeft` | [60](../src/game/audio/GameAudio.ts#L60) | Поле состояния или ссылка на систему. |
| `effects` | [61](../src/game/audio/GameAudio.ts#L61) | Короткоживущие дуги, кольца и следы выпадов. |
| `rain` | [62](../src/game/audio/GameAudio.ts#L62) | Поле состояния или ссылка на систему. |
| `rainSource` | [63](../src/game/audio/GameAudio.ts#L63) | Поле состояния или ссылка на систему. |
| `noise` | [64](../src/game/audio/GameAudio.ts#L64) | Поле состояния или ссылка на систему. |
| `region` | [65](../src/game/audio/GameAudio.ts#L65) | Поле состояния или ссылка на систему. |
| `note` | [66](../src/game/audio/GameAudio.ts#L66) | Поле состояния или ссылка на систему. |
| `nextNote` | [67](../src/game/audio/GameAudio.ts#L67) | Поле состояния или ссылка на систему. |
| `paused` | [68](../src/game/audio/GameAudio.ts#L68) | Поле состояния или ссылка на систему. |
| `weather` | [69](../src/game/audio/GameAudio.ts#L69) | Текущее погодное событие или clear. |
| `stepLeft` | [70](../src/game/audio/GameAudio.ts#L70) | Поле состояния или ссылка на систему. |
| `unlock` | [71](../src/game/audio/GameAudio.ts#L71) | Объявление в этом модуле. |
| `setSettings` | [124](../src/game/audio/GameAudio.ts#L124) | Объявление в этом модуле. |
| `applySettings` | [130](../src/game/audio/GameAudio.ts#L130) | Объявление в этом модуле. |
| `setRegion` | [137](../src/game/audio/GameAudio.ts#L137) | Объявление в этом модуле. |
| `update` | [144](../src/game/audio/GameAudio.ts#L144) | Порядок обновления систем на каждом кадре; пауза останавливает игровые действия. |
| `tone` | [242](../src/game/audio/GameAudio.ts#L242) | Объявление в этом модуле. |
| `noiseBurst` | [270](../src/game/audio/GameAudio.ts#L270) | Объявление в этом модуле. |
| `play` | [301](../src/game/audio/GameAudio.ts#L301) | Объявление в этом модуле. |
| `weaponSound` | [411](../src/game/audio/GameAudio.ts#L411) | Объявление в этом модуле. |
| `footstep` | [445](../src/game/audio/GameAudio.ts#L445) | Объявление в этом модуле. |
| `destroy` | [461](../src/game/audio/GameAudio.ts#L461) | Объявление в этом модуле. |

### [src/game/audio/Soundtrack.ts](../src/game/audio/Soundtrack.ts)

Десять музыкальных записей, выбор темы по биому и режиму, загрузка и воспроизведение.

Строк: 240.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `TRACKS` | [11](../src/game/audio/Soundtrack.ts#L11) | Параметры, таблица данных или функция, объявленная константой. |
| `TrackId` | [73](../src/game/audio/Soundtrack.ts#L73) | Форма данных для проверки TypeScript. |
| `MusicMode` | [74](../src/game/audio/Soundtrack.ts#L74) | Форма данных для проверки TypeScript. |
| `THEMES` | [75](../src/game/audio/Soundtrack.ts#L75) | Параметры, таблица данных или функция, объявленная константой. |
| `soundtrack` | [125](../src/game/audio/Soundtrack.ts#L125) | Выбирает запись по биому и ситуации. |
| `mode` | [126](../src/game/audio/Soundtrack.ts#L126) | Поле состояния или ссылка на систему. |
| `RecordedMusic` | [132](../src/game/audio/Soundtrack.ts#L132) | Объявление в этом модуле. |
| `failed` | [133](../src/game/audio/Soundtrack.ts#L133) | Поле состояния или ссылка на систему. |
| `current` | [134](../src/game/audio/Soundtrack.ts#L134) | Поле состояния или ссылка на систему. |
| `active` | [142](../src/game/audio/Soundtrack.ts#L142) | Поле состояния или ссылка на систему. |
| `playing` | [143](../src/game/audio/Soundtrack.ts#L143) | Поле состояния или ссылка на систему. |
| `positions` | [144](../src/game/audio/Soundtrack.ts#L144) | Поле состояния или ссылка на систему. |
| `update` | [149](../src/game/audio/Soundtrack.ts#L149) | Порядок обновления систем на каждом кадре; пауза останавливает игровые действия. |
| `destroy` | [230](../src/game/audio/Soundtrack.ts#L230) | Объявление в этом модуле. |

## Сохранения

### [src/game/persistence/SaveSchema.ts](../src/game/persistence/SaveSchema.ts)

Схема ручного сохранения v7, проверка данных и перенос старых форматов v5/v6.

Строк: 336.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `RegionProgress` | [26](../src/game/persistence/SaveSchema.ts#L26) | Форма данных для проверки TypeScript. |
| `coins` | [27](../src/game/persistence/SaveSchema.ts#L27) | Осколки в мире. Кошелёк находится в journey.profile.coins. |
| `elapsed` | [28](../src/game/persistence/SaveSchema.ts#L28) | Игровое время путешествия, секунды. |
| `spawned` | [29](../src/game/persistence/SaveSchema.ts#L29) | Поле состояния или ссылка на систему. |
| `bossDead` | [30](../src/game/persistence/SaveSchema.ts#L30) | Поле состояния или ссылка на систему. |
| `cleared` | [31](../src/game/persistence/SaveSchema.ts#L31) | Поле состояния или ссылка на систему. |
| `income` | [32](../src/game/persistence/SaveSchema.ts#L32) | Поле состояния или ссылка на систему. |
| `rewarded` | [33](../src/game/persistence/SaveSchema.ts#L33) | Поле состояния или ссылка на систему. |
| `SavedEnemy` | [35](../src/game/persistence/SaveSchema.ts#L35) | Форма данных для проверки TypeScript. |
| `kind` | [36](../src/game/persistence/SaveSchema.ts#L36) | Поле состояния или ссылка на систему. |
| `region` | [37](../src/game/persistence/SaveSchema.ts#L37) | Поле состояния или ссылка на систему. |
| `hp` | [38](../src/game/persistence/SaveSchema.ts#L38) | Текущее здоровье. Для героя максимум задаёт CombatRules.stats().maxHP. |
| `phase2` | [39](../src/game/persistence/SaveSchema.ts#L39) | Поле состояния или ссылка на систему. |
| `variant` | [40](../src/game/persistence/SaveSchema.ts#L40) | Поле состояния или ссылка на систему. |
| `training` | [41](../src/game/persistence/SaveSchema.ts#L41) | Поле состояния или ссылка на систему. |
| `SavedChest` | [43](../src/game/persistence/SaveSchema.ts#L43) | Форма данных для проверки TypeScript. |
| `region` | [44](../src/game/persistence/SaveSchema.ts#L44) | Поле состояния или ссылка на систему. |
| `quest` | [45](../src/game/persistence/SaveSchema.ts#L45) | Поле состояния или ссылка на систему. |
| `opened` | [46](../src/game/persistence/SaveSchema.ts#L46) | Поле состояния или ссылка на систему. |
| `Snapshot` | [48](../src/game/persistence/SaveSchema.ts#L48) | Форма данных для проверки TypeScript. |
| `version` | [49](../src/game/persistence/SaveSchema.ts#L49) | Поле состояния или ссылка на систему. |
| `manual` | [50](../src/game/persistence/SaveSchema.ts#L50) | Поле состояния или ссылка на систему. |
| `savedAt` | [51](../src/game/persistence/SaveSchema.ts#L51) | Поле состояния или ссылка на систему. |
| `profile` | [52](../src/game/persistence/SaveSchema.ts#L52) | Покупки, кошелёк, улучшения, экипировка, навыки и достижения текущего путешествия. |
| `region` | [53](../src/game/persistence/SaveSchema.ts#L53) | Поле состояния или ссылка на систему. |
| `progress` | [54](../src/game/persistence/SaveSchema.ts#L54) | Прогресс по биомам: сила, время, босс, очищение, доход и однократная награда. |
| `player` | [55](../src/game/persistence/SaveSchema.ts#L55) | Поле состояния или ссылка на систему. |
| `checkpoint` | [56](../src/game/persistence/SaveSchema.ts#L56) | Координаты последнего контрольного костра. |
| `hp` | [57](../src/game/persistence/SaveSchema.ts#L57) | Текущее здоровье. Для героя максимум задаёт CombatRules.stats().maxHP. |
| `stamina` | [58](../src/game/persistence/SaveSchema.ts#L58) | Текущая выносливость; расходуется атаками, навыками и перекатом. |
| `flasks` | [59](../src/game/persistence/SaveSchema.ts#L59) | Оставшиеся заряды лечебной фляги Q. |
| `armed` | [60](../src/game/persistence/SaveSchema.ts#L60) | Может ли герой использовать духовное оружие в текущей области. |
| `ultimate` | [61](../src/game/persistence/SaveSchema.ts#L61) | Накопленный заряд абсолютного умения, от 0 до 100. |
| `elapsed` | [62](../src/game/persistence/SaveSchema.ts#L62) | Игровое время путешествия, секунды. |
| `score` | [63](../src/game/persistence/SaveSchema.ts#L63) | Набранные очки; отдельный показатель, не кошелёк. |
| `kills` | [64](../src/game/persistence/SaveSchema.ts#L64) | Число побеждённых противников текущего путешествия. |
| `deaths` | [65](../src/game/persistence/SaveSchema.ts#L65) | Число смертей героя в текущем путешествии. |
| `enemies` | [66](../src/game/persistence/SaveSchema.ts#L66) | Живые и завершающие анимацию смерти противники. |
| `coins` | [67](../src/game/persistence/SaveSchema.ts#L67) | Осколки в мире. Кошелёк находится в journey.profile.coins. |
| `quests` | [68](../src/game/persistence/SaveSchema.ts#L68) | Три испытания для каждого биома. |
| `chests` | [69](../src/game/persistence/SaveSchema.ts#L69) | Сундуки испытаний и их открытость. |
| `audio` | [70](../src/game/persistence/SaveSchema.ts#L70) | Поле состояния или ссылка на систему. |
| `area` | [71](../src/game/persistence/SaveSchema.ts#L71) | Тип области: village, biome, tutorial или interior. |
| `villageIndex` | [72](../src/game/persistence/SaveSchema.ts#L72) | Индекс текущей деревни; начальная деревня имеет индекс -1. |
| `lastVillage` | [73](../src/game/persistence/SaveSchema.ts#L73) | Индекс последнего посещённого костра для возвращения после смерти. |
| `lesson` | [74](../src/game/persistence/SaveSchema.ts#L74) | Поле состояния или ссылка на систему. |
| `lessonProgress` | [75](../src/game/persistence/SaveSchema.ts#L75) | Количество зачтённых действий текущего урока. |
| `lines` | [76](../src/game/persistence/SaveSchema.ts#L76) | Состояния сюжетных поручений: принятие, предметы и награды. |
| `wisp` | [77](../src/game/persistence/SaveSchema.ts#L77) | Спрайт сопровождаемого огонька или null. |
| `villages` | [78](../src/game/persistence/SaveSchema.ts#L78) | Поле состояния или ссылка на систему. |
| `deliveries` | [79](../src/game/persistence/SaveSchema.ts#L79) | Состояния доставок: принято, передано и награда получена. |
| `interiorRole` | [80](../src/game/persistence/SaveSchema.ts#L80) | Роль владельца открытого дома или null. |
| `interiorReturn` | [81](../src/game/persistence/SaveSchema.ts#L81) | После выхода из интерьера вернуться в деревню или учебный двор. |
| `migrated` | [82](../src/game/persistence/SaveSchema.ts#L82) | Поле состояния или ссылка на систему. |
| `parseSave` | [98](../src/game/persistence/SaveSchema.ts#L98) | Проверяет JSON, ограничивает значения и переносит сохранения v5/v6 в v7. |

### [src/game/persistence/SaveSystem.ts](../src/game/persistence/SaveSystem.ts)

Ручная запись, загрузка и отображение состояния сохранения.

Строк: 270.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `SaveSystem` | [11](../src/game/persistence/SaveSystem.ts#L11) | Объявление в этом модуле. |
| `refreshSaveUI` | [13](../src/game/persistence/SaveSystem.ts#L13) | Обновляет доступность загрузки и текст о ручном сохранении. |
| `snapshot` | [23](../src/game/persistence/SaveSystem.ts#L23) | Создаёт объект сохранения из текущего состояния систем. |
| `saveProgress` | [91](../src/game/persistence/SaveSystem.ts#L91) | Пишет JSON в localStorage из меню, паузы или финала. |
| `loadProgress` | [108](../src/game/persistence/SaveSystem.ts#L108) | Проверяет запись, восстанавливает профиль, объекты и окна, сбрасывает временные эффекты. |

## Интерфейс и ввод

### [index.html](../index.html)

DOM-разметка игровых окон и идентификаторы, к которым обращаются контроллеры.

Строк: 457.

### [src/game/ui/InputController.ts](../src/game/ui/InputController.ts)

Привязка DOM-кнопок, клавиатуры и мыши, сброс ввода и полноэкранный режим.

Строк: 394.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `InputController` | [12](../src/game/ui/InputController.ts#L12) | Объявление в этом модуле. |
| `bindControls` | [14](../src/game/ui/InputController.ts#L14) | Подключает DOM-кнопки, события мыши, клавиатуры, скрытия вкладки и предупреждение о выходе. |
| `fullscreen` | [378](../src/game/ui/InputController.ts#L378) | Переключает полноэкранный режим браузера. |
| `resetInput` | [388](../src/game/ui/InputController.ts#L388) | Сбрасывает движение, удержание мыши и клавиши. |

### [src/game/ui/InterfaceState.ts](../src/game/ui/InterfaceState.ts)

Режим игры, выбор окон, ввод, диалоги и уведомления.

Строк: 66.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `GameState` | [7](../src/game/ui/InterfaceState.ts#L7) | Форма данных для проверки TypeScript. |
| `ShopTab` | [25](../src/game/ui/InterfaceState.ts#L25) | Форма данных для проверки TypeScript. |
| `MenuTab` | [26](../src/game/ui/InterfaceState.ts#L26) | Форма данных для проверки TypeScript. |
| `InterfaceState` | [27](../src/game/ui/InterfaceState.ts#L27) | Объявление в этом модуле. |
| `keys` | [28](../src/game/ui/InterfaceState.ts#L28) | Клавиши Phaser, подключённые при создании сцены. |
| `listeners` | [29](../src/game/ui/InterfaceState.ts#L29) | AbortController для отключения DOM-обработчиков при остановке сцены. |
| `state` | [30](../src/game/ui/InterfaceState.ts#L30) | Режим игры: playing, menu, paused, dialog, shop, map и другие состояния. |
| `nearestNPC` | [31](../src/game/ui/InterfaceState.ts#L31) | Индекс ближайшего доступного собеседника; -1 — отсутствует. |
| `dialogRole` | [32](../src/game/ui/InterfaceState.ts#L32) | Роль текущего собеседника; влияет на реплики и магазин. |
| `nearestHouse` | [33](../src/game/ui/InterfaceState.ts#L33) | Индекс ближайшей доступной двери. |
| `nearestProp` | [34](../src/game/ui/InterfaceState.ts#L34) | Индекс ближайшего сюжетного предмета. |
| `questView` | [35](../src/game/ui/InterfaceState.ts#L35) | Выбранный раздел журнала: испытания, история или доставки. |
| `questPage` | [36](../src/game/ui/InterfaceState.ts#L36) | Номер страницы текущего раздела журнала. |
| `mapMode` | [37](../src/game/ui/InterfaceState.ts#L37) | Локальная карта или карта мира. |
| `mapFocusRegion` | [38](../src/game/ui/InterfaceState.ts#L38) | Биом, выбранный для просмотра на карте. |
| `mapFocusVillage` | [39](../src/game/ui/InterfaceState.ts#L39) | Деревня, выбранная для просмотра на карте. |
| `confirmReturn` | [40](../src/game/ui/InterfaceState.ts#L40) | Режим, к которому вернуться при отмене выхода. |
| `confirmTarget` | [41](../src/game/ui/InterfaceState.ts#L41) | Цель подтверждённого выхода: титульный экран или новая игра. |
| `achievementQueue` | [42](../src/game/ui/InterfaceState.ts#L42) | Очередь новых достижений для коротких уведомлений. |
| `achievementLeft` | [43](../src/game/ui/InterfaceState.ts#L43) | Оставшееся время текущего уведомления достижения. |
| `achievementPage` | [44](../src/game/ui/InterfaceState.ts#L44) | Страница списка достижений. |
| `mouse` | [45](../src/game/ui/InterfaceState.ts#L45) | Последняя экранная точка мыши для прицеливания. |
| `mouseHeld` | [46](../src/game/ui/InterfaceState.ts#L46) | Удерживается ли ЛКМ для повторения атак. |
| `hudLeft` | [47](../src/game/ui/InterfaceState.ts#L47) | Таймер до очередного обновления DOM-индикаторов. |
| `toastTimeout` | [48](../src/game/ui/InterfaceState.ts#L48) | Идентификатор таймера скрытия короткого сообщения. |
| `checkpointBannerLeft` | [49](../src/game/ui/InterfaceState.ts#L49) | Оставшееся время сообщения о костре. |
| `nearestChest` | [50](../src/game/ui/InterfaceState.ts#L50) | Индекс ближайшего доступного сундука. |
| `dialogTarget` | [51](../src/game/ui/InterfaceState.ts#L51) | Полный текст постепенно показываемой реплики. |
| `dialogTime` | [52](../src/game/ui/InterfaceState.ts#L52) | Время показа реплики для эффекта печати. |
| `shopTab` | [53](../src/game/ui/InterfaceState.ts#L53) | Выбранная вкладка магазина. |
| `shopPage` | [54](../src/game/ui/InterfaceState.ts#L54) | Страница товаров текущей вкладки магазина. |
| `menuTab` | [55](../src/game/ui/InterfaceState.ts#L55) | Выбранный раздел меню путешествия. |
| `menuReturn` | [56](../src/game/ui/InterfaceState.ts#L56) | Режим, который восстановится после закрытия меню. |
| `mapReturn` | [57](../src/game/ui/InterfaceState.ts#L57) | Режим, который восстановится после закрытия карты. |
| `equipmentTab` | [58](../src/game/ui/InterfaceState.ts#L58) | Выбранный тип вещей: оружие, броня или облики. |
| `equipmentPage` | [59](../src/game/ui/InterfaceState.ts#L59) | Страница списка принадлежащих герою вещей. |
| `guideWanted` | [60](../src/game/ui/InterfaceState.ts#L60) | Пользователь хочет видеть краткую справку. |
| `briefingPage` | [61](../src/game/ui/InterfaceState.ts#L61) | Номер вводной карточки обучения. |
| `loot` | [62](../src/game/ui/InterfaceState.ts#L62) | Выбранная, но ещё не выданная награда сундука. |
| `lootLeft` | [63](../src/game/ui/InterfaceState.ts#L63) | Время до завершения анимации рулетки. |
| `bossDigit` | [64](../src/game/ui/InterfaceState.ts#L64) | Последняя показанная цифра перед появлением босса. |
| `bossDigitLeft` | [65](../src/game/ui/InterfaceState.ts#L65) | Оставшееся время видимости цифры босса. |

### [src/game/ui/MapController.ts](../src/game/ui/MapController.ts)

Локальная карта, карта мира и выбор области.

Строк: 487.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `MapController` | [18](../src/game/ui/MapController.ts#L18) | Объявление в этом модуле. |
| `toggleMap` | [20](../src/game/ui/MapController.ts#L20) | Открывает или закрывает карту. |
| `drawMaps` | [39](../src/game/ui/MapController.ts#L39) | Рисует карту мира и список областей. |
| `drawLocalMap` | [202](../src/game/ui/MapController.ts#L202) | Рисует локальную карту с героем, врагами, сундуками и заданиями. |

### [src/game/ui/MenuController.ts](../src/game/ui/MenuController.ts)

Меню, HUD, пауза, справка, начальный экран и подтверждение выхода.

Строк: 518.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `MenuController` | [19](../src/game/ui/MenuController.ts#L19) | Объявление в этом модуле. |
| `toast` | [22](../src/game/ui/MenuController.ts#L22) | Показывает короткое исчезающее сообщение. |
| `toggleMenu` | [31](../src/game/ui/MenuController.ts#L31) | Открывает или закрывает меню, сохраняя прежний режим. |
| `renderMenu` | [52](../src/game/ui/MenuController.ts#L52) | Выбирает вкладку, обновляет кошелёк и вызывает её отрисовку. |
| `renderSkills` | [78](../src/game/ui/MenuController.ts#L78) | Выводит навыки текущего оружия и условия изучения. |
| `renderEquipment` | [103](../src/game/ui/MenuController.ts#L103) | Выводит страницы принадлежащих герою вещей. |
| `renderAudio` | [127](../src/game/ui/MenuController.ts#L127) | Показывает текущие громкости и выключение звука. |
| `setGuideText` | [138](../src/game/ui/MenuController.ts#L138) | Обновляет краткую справку управления. |
| `syncGuide` | [149](../src/game/ui/MenuController.ts#L149) | Согласует видимость справки с режимом игры. |
| `toggleGuide` | [156](../src/game/ui/MenuController.ts#L156) | Включает или убирает справку. |
| `togglePause` | [162](../src/game/ui/MenuController.ts#L162) | Ставит мир на паузу и продолжает его. |
| `showPauseModal` | [177](../src/game/ui/MenuController.ts#L177) | Показывает окно привала. |
| `primaryAction` | [189](../src/game/ui/MenuController.ts#L189) | Обрабатывает главную кнопку: старт, продолжение или исследование после финала. |
| `showModal` | [206](../src/game/ui/MenuController.ts#L206) | Заполняет общий экран сообщения. |
| `hideModal` | [223](../src/game/ui/MenuController.ts#L223) | Скрывает общий экран и показывает сцену. |
| `showStats` | [229](../src/game/ui/MenuController.ts#L229) | Выводит очки, убийства, смерти, время и кошелёк. |
| `updateHUD` | [236](../src/game/ui/MenuController.ts#L236) | Обновляет HP, выносливость, силу, таймеры, босса и стрелку направления. |
| `showTitle` | [436](../src/game/ui/MenuController.ts#L436) | Возвращает к начальному экрану и скрывает игровые окна. |
| `askTraining` | [475](../src/game/ui/MenuController.ts#L475) | Показывает старт с выбором обучения. |
| `requestNew` | [479](../src/game/ui/MenuController.ts#L479) | Запрашивает новую игру с учётом несохранённых изменений. |
| `confirmExit` | [485](../src/game/ui/MenuController.ts#L485) | Открывает выбор сохранения перед выходом или новой игрой. |
| `cancelExit` | [496](../src/game/ui/MenuController.ts#L496) | Возвращает к состоянию до подтверждения. |
| `commitExit` | [502](../src/game/ui/MenuController.ts#L502) | Исполняет выбранный выход после сохранения или отказа от него. |

### [src/style.css](../src/style.css)

Внешний вид HUD, окон, карты, магазина, истории и адаптация к размеру экрана.

Строк: 3162.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `color` | [9](../src/style.css#L9) | Поле состояния или ссылка на систему. |
| `background` | [10](../src/style.css#L10) | Поле состояния или ссылка на систему. |
| `margin` | [19](../src/style.css#L19) | Поле состояния или ссылка на систему. |
| `width` | [20](../src/style.css#L20) | Поле состояния или ссылка на систему. |
| `height` | [21](../src/style.css#L21) | Поле состояния или ссылка на систему. |
| `overflow` | [22](../src/style.css#L22) | Поле состояния или ссылка на систему. |
| `font` | [26](../src/style.css#L26) | Поле состояния или ссылка на систему. |
| `cursor` | [29](../src/style.css#L29) | Поле состояния или ссылка на систему. |
| `border` | [30](../src/style.css#L30) | Поле состояния или ссылка на систему. |
| `outline` | [34](../src/style.css#L34) | Поле состояния или ссылка на систему. |
| `opacity` | [38](../src/style.css#L38) | Поле состояния или ссылка на систему. |
| `cursor` | [39](../src/style.css#L39) | Поле состояния или ссылка на систему. |
| `display` | [42](../src/style.css#L42) | Поле состояния или ссылка на систему. |
| `position` | [45](../src/style.css#L45) | Поле состояния или ссылка на систему. |
| `inset` | [46](../src/style.css#L46) | Поле состояния или ссылка на систему. |
| `display` | [49](../src/style.css#L49) | Поле состояния или ссылка на систему. |
| `cursor` | [50](../src/style.css#L50) | Поле состояния или ссылка на систему. |
| `background` | [53](../src/style.css#L53) | Поле состояния или ссылка на систему. |
| `border` | [54](../src/style.css#L54) | Поле состояния или ссылка на систему. |
| `position` | [59](../src/style.css#L59) | Поле состояния или ссылка на систему. |
| `left` | [60](../src/style.css#L60) | Поле состояния или ссылка на систему. |
| `right` | [61](../src/style.css#L61) | Поле состояния или ссылка на систему. |
| `top` | [62](../src/style.css#L62) | Поле состояния или ссылка на систему. |
| `height` | [63](../src/style.css#L63) | Поле состояния или ссылка на систему. |
| `display` | [65](../src/style.css#L65) | Поле состояния или ссылка на систему. |
| `gap` | [68](../src/style.css#L68) | Поле состояния или ссылка на систему. |
| `width` | [72](../src/style.css#L72) | Поле состояния или ссылка на систему. |
| `padding` | [73](../src/style.css#L73) | Поле состояния или ссылка на систему. |
| `filter` | [74](../src/style.css#L74) | Поле состояния или ссылка на систему. |
| `display` | [77](../src/style.css#L77) | Поле состояния или ссылка на систему. |
| `gap` | [79](../src/style.css#L79) | Поле состояния или ссылка на систему. |
| `width` | [84](../src/style.css#L84) | Поле состояния или ссылка на систему. |
| `color` | [85](../src/style.css#L85) | Поле состояния или ссылка на систему. |
| `width` | [88](../src/style.css#L88) | Поле состояния или ссылка на систему. |
| `overflow` | [94](../src/style.css#L94) | Поле состояния или ссылка на систему. |
| `background` | [95](../src/style.css#L95) | Поле состояния или ссылка на систему. |
| `height` | [97](../src/style.css#L97) | Поле состояния или ссылка на систему. |
| `flex` | [98](../src/style.css#L98) | Поле состояния или ссылка на систему. |
| `width` | [101](../src/style.css#L101) | Поле состояния или ссылка на систему. |
| `height` | [102](../src/style.css#L102) | Поле состояния или ссылка на систему. |
| `transition` | [103](../src/style.css#L103) | Поле состояния или ссылка на систему. |
| `background` | [106](../src/style.css#L106) | Поле состояния или ссылка на систему. |
| `height` | [109](../src/style.css#L109) | Поле состояния или ссылка на систему. |
| `background` | [112](../src/style.css#L112) | Поле состояния или ссылка на систему. |
| `position` | [115](../src/style.css#L115) | Поле состояния или ссылка на систему. |
| `left` | [116](../src/style.css#L116) | Поле состояния или ссылка на систему. |
| `transform` | [117](../src/style.css#L117) | Поле состояния или ссылка на систему. |
| `display` | [118](../src/style.css#L118) | Поле состояния или ссылка на систему. |
| `gap` | [119](../src/style.css#L119) | Поле состояния или ссылка на систему. |
| `color` | [124](../src/style.css#L124) | Поле состояния или ссылка на систему. |
| `color` | [127](../src/style.css#L127) | Поле состояния или ссылка на систему. |
| `width` | [130](../src/style.css#L130) | Поле состояния или ссылка на систему. |
| `height` | [131](../src/style.css#L131) | Поле состояния или ссылка на систему. |
| `background` | [133](../src/style.css#L133) | Поле состояния или ссылка на систему. |
| `color` | [134](../src/style.css#L134) | Поле состояния или ссылка на систему. |
| `border` | [135](../src/style.css#L135) | Поле состояния или ссылка на систему. |
| `position` | [141](../src/style.css#L141) | Поле состояния или ссылка на систему. |
| `left` | [142](../src/style.css#L142) | Поле состояния или ссылка на систему. |
| `bottom` | [143](../src/style.css#L143) | Поле состояния или ссылка на систему. |
| `transform` | [144](../src/style.css#L144) | Поле состояния или ссылка на систему. |
| `width` | [145](../src/style.css#L145) | Поле состояния или ссылка на систему. |
| `display` | [150](../src/style.css#L150) | Поле состояния или ссылка на систему. |
| `color` | [153](../src/style.css#L153) | Поле состояния или ссылка на систему. |
| `height` | [160](../src/style.css#L160) | Поле состояния или ссылка на систему. |
| `background` | [163](../src/style.css#L163) | Поле состояния или ссылка на систему. |
| `position` | [166](../src/style.css#L166) | Поле состояния или ссылка на систему. |
| `left` | [167](../src/style.css#L167) | Поле состояния или ссылка на систему. |
| `bottom` | [168](../src/style.css#L168) | Поле состояния или ссылка на систему. |
| `width` | [169](../src/style.css#L169) | Поле состояния или ссылка на систему. |
| `padding` | [170](../src/style.css#L170) | Поле состояния или ссылка на систему. |
| `background` | [172](../src/style.css#L172) | Поле состояния или ссылка на систему. |
| `display` | [175](../src/style.css#L175) | Поле состояния или ссылка на систему. |
| `color` | [182](../src/style.css#L182) | Поле состояния или ссылка на систему. |
| `background` | [185](../src/style.css#L185) | Поле состояния или ссылка на систему. |
| `color` | [186](../src/style.css#L186) | Поле состояния или ссылка на систему. |
| `padding` | [188](../src/style.css#L188) | Поле состояния или ссылка на систему. |
| `color` | [194](../src/style.css#L194) | Поле состояния или ссылка на систему. |
| `margin` | [195](../src/style.css#L195) | Поле состояния или ссылка на систему. |
| `display` | [198](../src/style.css#L198) | Поле состояния или ссылка на систему. |
| `gap` | [200](../src/style.css#L200) | Поле состояния или ссылка на систему. |
| `color` | [204](../src/style.css#L204) | Поле состояния или ссылка на систему. |
| `display` | [207](../src/style.css#L207) | Поле состояния или ссылка на систему. |
| `color` | [208](../src/style.css#L208) | Поле состояния или ссылка на систему. |
| `color` | [214](../src/style.css#L214) | Поле состояния или ссылка на систему. |
| `position` | [218](../src/style.css#L218) | Поле состояния или ссылка на систему. |
| `left` | [219](../src/style.css#L219) | Поле состояния или ссылка на систему. |
| `bottom` | [220](../src/style.css#L220) | Поле состояния или ссылка на систему. |
| `transform` | [221](../src/style.css#L221) | Поле состояния или ссылка на систему. |
| `background` | [225](../src/style.css#L225) | Поле состояния или ссылка на систему. |
| `border` | [226](../src/style.css#L226) | Поле состояния или ссылка на систему. |
| `padding` | [227](../src/style.css#L227) | Поле состояния или ссылка на систему. |
| `color` | [229](../src/style.css#L229) | Поле состояния или ссылка на систему. |
| `opacity` | [231](../src/style.css#L231) | Поле состояния или ссылка на систему. |
| `transition` | [232](../src/style.css#L232) | Поле состояния или ссылка на систему. |
| `opacity` | [236](../src/style.css#L236) | Поле состояния или ссылка на систему. |
| `position` | [239](../src/style.css#L239) | Поле состояния или ссылка на систему. |
| `left` | [240](../src/style.css#L240) | Поле состояния или ссылка на систему. |
| `top` | [241](../src/style.css#L241) | Поле состояния или ссылка на систему. |
| `transform` | [242](../src/style.css#L242) | Поле состояния или ссылка на систему. |
| `width` | [246](../src/style.css#L246) | Поле состояния или ссылка на систему. |
| `padding` | [247](../src/style.css#L247) | Поле состояния или ссылка на систему. |
| `background` | [248](../src/style.css#L248) | Поле состояния или ссылка на систему. |
| `display` | [252](../src/style.css#L252) | Поле состояния или ссылка на систему. |
| `color` | [254](../src/style.css#L254) | Поле состояния или ссылка на систему. |
| `display` | [258](../src/style.css#L258) | Поле состояния или ссылка на систему. |
| `margin` | [261](../src/style.css#L261) | Поле состояния или ссылка на систему. |
| `color` | [264](../src/style.css#L264) | Поле состояния или ссылка на систему. |
| `position` | [268](../src/style.css#L268) | Поле состояния или ссылка на систему. |
| `left` | [269](../src/style.css#L269) | Поле состояния или ссылка на систему. |
| `bottom` | [270](../src/style.css#L270) | Поле состояния или ссылка на систему. |
| `transform` | [271](../src/style.css#L271) | Поле состояния или ссылка на систему. |
| `padding` | [276](../src/style.css#L276) | Поле состояния или ссылка на систему. |
| `color` | [278](../src/style.css#L278) | Поле состояния или ссылка на систему. |
| `background` | [279](../src/style.css#L279) | Поле состояния или ссылка на систему. |
| `position` | [285](../src/style.css#L285) | Поле состояния или ссылка на систему. |
| `inset` | [286](../src/style.css#L286) | Поле состояния или ссылка на систему. |
| `background` | [288](../src/style.css#L288) | Поле состояния или ссылка на систему. |
| `display` | [290](../src/style.css#L290) | Поле состояния или ссылка на систему. |
| `padding` | [292](../src/style.css#L292) | Поле состояния или ссылка на систему. |
| `width` | [295](../src/style.css#L295) | Поле состояния или ссылка на систему. |
| `padding` | [296](../src/style.css#L296) | Поле состояния или ссылка на систему. |
| `border` | [297](../src/style.css#L297) | Поле состояния или ссылка на систему. |
| `background` | [299](../src/style.css#L299) | Поле состояния или ссылка на систему. |
| `display` | [304](../src/style.css#L304) | Поле состояния или ссылка на систему. |
| `color` | [308](../src/style.css#L308) | Поле состояния или ссылка на систему. |
| `margin` | [315](../src/style.css#L315) | Поле состояния или ссылка на систему. |
| `color` | [320](../src/style.css#L320) | Поле состояния или ссылка на систему. |
| `margin` | [321](../src/style.css#L321) | Поле состояния или ссылка на систему. |
| `width` | [324](../src/style.css#L324) | Поле состояния или ссылка на систему. |
| `padding` | [325](../src/style.css#L325) | Поле состояния или ссылка на систему. |
| `background` | [327](../src/style.css#L327) | Поле состояния или ссылка на систему. |
| `color` | [328](../src/style.css#L328) | Поле состояния или ссылка на систему. |
| `padding` | [333](../src/style.css#L333) | Поле состояния или ссылка на систему. |
| `background` | [334](../src/style.css#L334) | Поле состояния или ссылка на систему. |
| `border` | [335](../src/style.css#L335) | Поле состояния или ссылка на систему. |
| `color` | [336](../src/style.css#L336) | Поле состояния или ссылка на систему. |
| `width` | [341](../src/style.css#L341) | Поле состояния или ссылка на систему. |
| `color` | [348](../src/style.css#L348) | Поле состояния или ссылка на систему. |
| `margin` | [349](../src/style.css#L349) | Поле состояния или ссылка на систему. |
| `display` | [352](../src/style.css#L352) | Поле состояния или ссылка на систему. |
| `gap` | [354](../src/style.css#L354) | Поле состояния или ссылка на систему. |
| `margin` | [355](../src/style.css#L355) | Поле состояния или ссылка на систему. |
| `padding` | [358](../src/style.css#L358) | Поле состояния или ссылка на систему. |
| `border` | [359](../src/style.css#L359) | Поле состояния или ссылка на систему. |
| `background` | [361](../src/style.css#L361) | Поле состояния или ссылка на систему. |
| `color` | [365](../src/style.css#L365) | Поле состояния или ссылка на систему. |
| `display` | [366](../src/style.css#L366) | Поле состояния или ссылка на систему. |
| `display` | [371](../src/style.css#L371) | Поле состояния или ссылка на систему. |
| `margin` | [377](../src/style.css#L377) | Поле состояния или ссылка на систему. |
| `color` | [378](../src/style.css#L378) | Поле состояния или ссылка на систему. |
| `display` | [381](../src/style.css#L381) | Поле состояния или ссылка на систему. |
| `gap` | [384](../src/style.css#L384) | Поле состояния или ссылка на систему. |
| `margin` | [386](../src/style.css#L386) | Поле состояния или ссылка на систему. |
| `display` | [389](../src/style.css#L389) | Поле состояния или ссылка на систему. |
| `color` | [391](../src/style.css#L391) | Поле состояния или ссылка на систему. |
| `display` | [394](../src/style.css#L394) | Поле состояния или ссылка на систему. |
| `gap` | [397](../src/style.css#L397) | Поле состояния или ссылка на систему. |
| `margin` | [402](../src/style.css#L402) | Поле состояния или ссылка на систему. |
| `color` | [406](../src/style.css#L406) | Поле состояния или ссылка на систему. |
| `display` | [412](../src/style.css#L412) | Поле состояния или ссылка на систему. |
| `gap` | [413](../src/style.css#L413) | Поле состояния или ссылка на систему. |
| `padding` | [414](../src/style.css#L414) | Поле состояния или ссылка на систему. |
| `background` | [415](../src/style.css#L415) | Поле состояния или ссылка на систему. |
| `margin` | [417](../src/style.css#L417) | Поле состояния или ссылка на систему. |
| `flex` | [422](../src/style.css#L422) | Поле состояния или ссылка на систему. |
| `background` | [423](../src/style.css#L423) | Поле состояния или ссылка на систему. |
| `padding` | [424](../src/style.css#L424) | Поле состояния или ссылка на систему. |
| `color` | [425](../src/style.css#L425) | Поле состояния или ссылка на систему. |
| `background` | [432](../src/style.css#L432) | Поле состояния или ссылка на систему. |
| `color` | [433](../src/style.css#L433) | Поле состояния или ссылка на систему. |
| `display` | [440](../src/style.css#L440) | Поле состояния или ссылка на систему. |
| `gap` | [443](../src/style.css#L443) | Поле состояния или ссылка на систему. |
| `color` | [450](../src/style.css#L450) | Поле состояния или ссылка на систему. |
| `margin` | [452](../src/style.css#L452) | Поле состояния или ссылка на систему. |
| `display` | [455](../src/style.css#L455) | Поле состояния или ссылка на систему. |
| `gap` | [457](../src/style.css#L457) | Поле состояния или ссылка на систему. |
| `padding` | [458](../src/style.css#L458) | Поле состояния или ссылка на систему. |
| `background` | [459](../src/style.css#L459) | Поле состояния или ссылка на систему. |
| `border` | [460](../src/style.css#L460) | Поле состояния или ссылка на систему. |
| `color` | [463](../src/style.css#L463) | Поле состояния или ссылка на систему. |
| `color` | [468](../src/style.css#L468) | Поле состояния или ссылка на систему. |
| `margin` | [469](../src/style.css#L469) | Поле состояния или ссылка на систему. |
| `display` | [472](../src/style.css#L472) | Поле состояния или ссылка на систему. |
| `gap` | [474](../src/style.css#L474) | Поле состояния или ссылка на систему. |
| `color` | [476](../src/style.css#L476) | Поле состояния или ссылка на систему. |
| `margin` | [477](../src/style.css#L477) | Поле состояния или ссылка на систему. |
| `display` | [480](../src/style.css#L480) | Поле состояния или ссылка на систему. |
| `display` | [483](../src/style.css#L483) | Поле состояния или ссылка на систему. |
| `width` | [484](../src/style.css#L484) | Поле состояния или ссылка на систему. |
| `height` | [485](../src/style.css#L485) | Поле состояния или ссылка на систему. |
| `background` | [487](../src/style.css#L487) | Поле состояния или ссылка на систему. |
| `width` | [490](../src/style.css#L490) | Поле состояния или ссылка на систему. |
| `display` | [494](../src/style.css#L494) | Поле состояния или ссылка на систему. |
| `gap` | [495](../src/style.css#L495) | Поле состояния или ссылка на систему. |
| `flex` | [499](../src/style.css#L499) | Поле состояния или ссылка на систему. |
| `padding` | [500](../src/style.css#L500) | Поле состояния или ссылка на систему. |
| `background` | [502](../src/style.css#L502) | Поле состояния или ссылка на систему. |
| `border` | [503](../src/style.css#L503) | Поле состояния или ссылка на систему. |
| `color` | [504](../src/style.css#L504) | Поле состояния или ссылка на систему. |
| `display` | [515](../src/style.css#L515) | Поле состояния или ссылка на систему. |
| `gap` | [517](../src/style.css#L517) | Поле состояния или ссылка на систему. |
| `display` | [520](../src/style.css#L520) | Поле состояния или ссылка на систему. |
| `gap` | [524](../src/style.css#L524) | Поле состояния или ссылка на систему. |
| `border` | [525](../src/style.css#L525) | Поле состояния или ссылка на систему. |
| `background` | [526](../src/style.css#L526) | Поле состояния или ссылка на систему. |
| `padding` | [527](../src/style.css#L527) | Поле состояния или ссылка на систему. |
| `width` | [533](../src/style.css#L533) | Поле состояния или ссылка на систему. |
| `height` | [534](../src/style.css#L534) | Поле состояния или ссылка на систему. |
| `display` | [538](../src/style.css#L538) | Поле состояния или ссылка на систему. |
| `color` | [541](../src/style.css#L541) | Поле состояния или ссылка на систему. |
| `margin` | [545](../src/style.css#L545) | Поле состояния или ссылка на систему. |
| `color` | [552](../src/style.css#L552) | Поле состояния или ссылка на систему. |
| `margin` | [553](../src/style.css#L553) | Поле состояния или ссылка на систему. |
| `width` | [557](../src/style.css#L557) | Поле состояния или ссылка на систему. |
| `padding` | [558](../src/style.css#L558) | Поле состояния или ссылка на систему. |
| `background` | [559](../src/style.css#L559) | Поле состояния или ссылка на систему. |
| `color` | [561](../src/style.css#L561) | Поле состояния или ссылка на систему. |
| `background` | [567](../src/style.css#L567) | Поле состояния или ссылка на систему. |
| `color` | [568](../src/style.css#L568) | Поле состояния или ссылка на систему. |
| `opacity` | [569](../src/style.css#L569) | Поле состояния или ссылка на систему. |
| `display` | [573](../src/style.css#L573) | Поле состояния или ссылка на систему. |
| `gap` | [576](../src/style.css#L576) | Поле состояния или ссылка на систему. |
| `color` | [578](../src/style.css#L578) | Поле состояния или ссылка на систему. |
| `margin` | [579](../src/style.css#L579) | Поле состояния или ссылка на систему. |
| `width` | [583](../src/style.css#L583) | Поле состояния или ссылка на систему. |
| `height` | [584](../src/style.css#L584) | Поле состояния или ссылка на систему. |
| `background` | [586](../src/style.css#L586) | Поле состояния или ссылка на систему. |
| `color` | [587](../src/style.css#L587) | Поле состояния или ссылка на систему. |
| `color` | [591](../src/style.css#L591) | Поле состояния или ссылка на систему. |
| `margin` | [593](../src/style.css#L593) | Поле состояния или ссылка на систему. |
| `color` | [598](../src/style.css#L598) | Поле состояния или ссылка на систему. |
| `margin` | [599](../src/style.css#L599) | Поле состояния или ссылка на систему. |
| `display` | [602](../src/style.css#L602) | Поле состояния или ссылка на систему. |
| `gap` | [604](../src/style.css#L604) | Поле состояния или ссылка на систему. |
| `padding` | [607](../src/style.css#L607) | Поле состояния или ссылка на систему. |
| `border` | [608](../src/style.css#L608) | Поле состояния или ссылка на систему. |
| `background` | [610](../src/style.css#L610) | Поле состояния или ссылка на систему. |
| `display` | [613](../src/style.css#L613) | Поле состояния или ссылка на систему. |
| `gap` | [615](../src/style.css#L615) | Поле состояния или ссылка на систему. |
| `margin` | [622](../src/style.css#L622) | Поле состояния или ссылка на систему. |
| `color` | [624](../src/style.css#L624) | Поле состояния или ссылка на систему. |
| `color` | [629](../src/style.css#L629) | Поле состояния или ссылка на систему. |
| `opacity` | [632](../src/style.css#L632) | Поле состояния или ссылка на систему. |
| `display` | [635](../src/style.css#L635) | Поле состояния или ссылка на систему. |
| `gap` | [636](../src/style.css#L636) | Поле состояния или ссылка на систему. |
| `display` | [639](../src/style.css#L639) | Поле состояния или ссылка на систему. |
| `gap` | [642](../src/style.css#L642) | Поле состояния или ссылка на систему. |
| `color` | [644](../src/style.css#L644) | Поле состояния или ссылка на систему. |
| `width` | [647](../src/style.css#L647) | Поле состояния или ссылка на систему. |
| `display` | [651](../src/style.css#L651) | Поле состояния или ссылка на систему. |
| `gap` | [653](../src/style.css#L653) | Поле состояния или ссылка на систему. |
| `background` | [657](../src/style.css#L657) | Поле состояния или ссылка на систему. |
| `color` | [658](../src/style.css#L658) | Поле состояния или ссылка на систему. |
| `border` | [660](../src/style.css#L660) | Поле состояния или ссылка на систему. |
| `padding` | [662](../src/style.css#L662) | Поле состояния или ссылка на систему. |
| `width` | [663](../src/style.css#L663) | Поле состояния или ссылка на систему. |
| `position` | [667](../src/style.css#L667) | Поле состояния или ссылка на систему. |
| `inset` | [668](../src/style.css#L668) | Поле состояния или ссылка на систему. |
| `display` | [670](../src/style.css#L670) | Поле состояния или ссылка на систему. |
| `background` | [673](../src/style.css#L673) | Поле состояния или ссылка на систему. |
| `padding` | [674](../src/style.css#L674) | Поле состояния или ссылка на систему. |
| `width` | [677](../src/style.css#L677) | Поле состояния или ссылка на систему. |
| `padding` | [678](../src/style.css#L678) | Поле состояния или ссылка на систему. |
| `display` | [679](../src/style.css#L679) | Поле состояния или ссылка на систему. |
| `gap` | [680](../src/style.css#L680) | Поле состояния или ссылка на систему. |
| `background` | [681](../src/style.css#L681) | Поле состояния или ссылка на систему. |
| `width` | [684](../src/style.css#L684) | Поле состояния или ссылка на систему. |
| `height` | [685](../src/style.css#L685) | Поле состояния или ссылка на систему. |
| `flex` | [690](../src/style.css#L690) | Поле состояния или ссылка на систему. |
| `margin` | [694](../src/style.css#L694) | Поле состояния или ссылка на систему. |
| `color` | [701](../src/style.css#L701) | Поле состояния или ссылка на систему. |
| `margin` | [703](../src/style.css#L703) | Поле состояния или ссылка на систему. |
| `display` | [706](../src/style.css#L706) | Поле состояния или ссылка на систему. |
| `gap` | [708](../src/style.css#L708) | Поле состояния или ссылка на систему. |
| `padding` | [711](../src/style.css#L711) | Поле состояния или ссылка на систему. |
| `background` | [713](../src/style.css#L713) | Поле состояния или ссылка на систему. |
| `border` | [714](../src/style.css#L714) | Поле состояния или ссылка на систему. |
| `color` | [715](../src/style.css#L715) | Поле состояния или ссылка на систему. |
| `width` | [719](../src/style.css#L719) | Поле состояния или ссылка на систему. |
| `display` | [722](../src/style.css#L722) | Поле состояния или ссылка на систему. |
| `width` | [723](../src/style.css#L723) | Поле состояния или ссылка на систему. |
| `background` | [725](../src/style.css#L725) | Поле состояния или ссылка на систему. |
| `margin` | [726](../src/style.css#L726) | Поле состояния или ссылка на систему. |
| `display` | [729](../src/style.css#L729) | Поле состояния или ссылка на систему. |
| `gap` | [731](../src/style.css#L731) | Поле состояния или ссылка на систему. |
| `color` | [734](../src/style.css#L734) | Поле состояния или ссылка на систему. |
| `margin` | [735](../src/style.css#L735) | Поле состояния или ссылка на систему. |
| `display` | [738](../src/style.css#L738) | Поле состояния или ссылка на систему. |
| `gap` | [741](../src/style.css#L741) | Поле состояния или ссылка на систему. |
| `color` | [743](../src/style.css#L743) | Поле состояния или ссылка на систему. |
| `margin` | [744](../src/style.css#L744) | Поле состояния или ссылка на систему. |
| `color` | [747](../src/style.css#L747) | Поле состояния или ссылка на систему. |
| `position` | [750](../src/style.css#L750) | Поле состояния или ссылка на систему. |
| `inset` | [751](../src/style.css#L751) | Поле состояния или ссылка на систему. |
| `background` | [753](../src/style.css#L753) | Поле состояния или ссылка на систему. |
| `position` | [757](../src/style.css#L757) | Поле состояния или ссылка на систему. |
| `bottom` | [758](../src/style.css#L758) | Поле состояния или ссылка на систему. |
| `left` | [759](../src/style.css#L759) | Поле состояния или ссылка на систему. |
| `margin` | [766](../src/style.css#L766) | Поле состояния или ссылка на систему. |
| `color` | [767](../src/style.css#L767) | Поле состояния или ссылка на систему. |
| `color` | [772](../src/style.css#L772) | Поле состояния или ссылка на систему. |
| `position` | [776](../src/style.css#L776) | Поле состояния или ссылка на систему. |
| `right` | [777](../src/style.css#L777) | Поле состояния или ссылка на систему. |
| `bottom` | [778](../src/style.css#L778) | Поле состояния или ссылка на систему. |
| `background` | [780](../src/style.css#L780) | Поле состояния или ссылка на систему. |
| `color` | [781](../src/style.css#L781) | Поле состояния или ссылка на систему. |
| `padding` | [782](../src/style.css#L782) | Поле состояния или ссылка на систему. |
| `overflow` | [787](../src/style.css#L787) | Поле состояния или ссылка на систему. |
| `position` | [788](../src/style.css#L788) | Поле состояния или ссылка на систему. |
| `width` | [789](../src/style.css#L789) | Поле состояния или ссылка на систему. |
| `height` | [790](../src/style.css#L790) | Поле состояния или ссылка на систему. |
| `border` | [791](../src/style.css#L791) | Поле состояния или ссылка на систему. |
| `background` | [793](../src/style.css#L793) | Поле состояния или ссылка на систему. |
| `margin` | [794](../src/style.css#L794) | Поле состояния или ссылка на систему. |
| `position` | [797](../src/style.css#L797) | Поле состояния или ссылка на систему. |
| `top` | [798](../src/style.css#L798) | Поле состояния или ссылка на систему. |
| `left` | [799](../src/style.css#L799) | Поле состояния или ссылка на систему. |
| `transform` | [800](../src/style.css#L800) | Поле состояния или ссылка на систему. |
| `color` | [802](../src/style.css#L802) | Поле состояния или ссылка на систему. |
| `display` | [806](../src/style.css#L806) | Поле состояния или ссылка на систему. |
| `gap` | [807](../src/style.css#L807) | Поле состояния или ссылка на систему. |
| `position` | [808](../src/style.css#L808) | Поле состояния или ссылка на систему. |
| `top` | [809](../src/style.css#L809) | Поле состояния или ссылка на систему. |
| `left` | [810](../src/style.css#L810) | Поле состояния или ссылка на систему. |
| `flex` | [814](../src/style.css#L814) | Поле состояния или ссылка на систему. |
| `width` | [815](../src/style.css#L815) | Поле состояния или ссылка на систему. |
| `height` | [816](../src/style.css#L816) | Поле состояния или ссылка на систему. |
| `display` | [817](../src/style.css#L817) | Поле состояния или ссылка на систему. |
| `border` | [820](../src/style.css#L820) | Поле состояния или ссылка на систему. |
| `background` | [822](../src/style.css#L822) | Поле состояния или ссылка на систему. |
| `gap` | [824](../src/style.css#L824) | Поле состояния или ссылка на систему. |
| `padding` | [826](../src/style.css#L826) | Поле состояния или ссылка на систему. |
| `color` | [833](../src/style.css#L833) | Поле состояния или ссылка на систему. |
| `display` | [1612](../src/style.css#L1612) | Поле состояния или ссылка на систему. |
| `display` | [1664](../src/style.css#L1664) | Поле состояния или ссылка на систему. |
| `color` | [1665](../src/style.css#L1665) | Поле состояния или ссылка на систему. |
| `width` | [1790](../src/style.css#L1790) | Поле состояния или ссылка на систему. |
| `display` | [1793](../src/style.css#L1793) | Поле состояния или ссылка на систему. |
| `gap` | [1794](../src/style.css#L1794) | Поле состояния или ссылка на систему. |
| `flex` | [1799](../src/style.css#L1799) | Поле состояния или ссылка на систему. |
| `background` | [1803](../src/style.css#L1803) | Поле состояния или ссылка на систему. |
| `width` | [1806](../src/style.css#L1806) | Поле состояния или ссылка на систему. |
| `padding` | [1807](../src/style.css#L1807) | Поле состояния или ссылка на систему. |
| `background` | [1808](../src/style.css#L1808) | Поле состояния или ссылка на систему. |
| `border` | [1809](../src/style.css#L1809) | Поле состояния или ссылка на систему. |
| `display` | [1814](../src/style.css#L1814) | Поле состояния или ссылка на систему. |
| `color` | [1818](../src/style.css#L1818) | Поле состояния или ссылка на систему. |
| `display` | [1822](../src/style.css#L1822) | Поле состояния или ссылка на систему. |
| `width` | [1823](../src/style.css#L1823) | Поле состояния или ссылка на систему. |
| `background` | [1827](../src/style.css#L1827) | Поле состояния или ссылка на систему. |
| `color` | [1832](../src/style.css#L1832) | Поле состояния или ссылка на систему. |
| `margin` | [1833](../src/style.css#L1833) | Поле состояния или ссылка на систему. |
| `color` | [1838](../src/style.css#L1838) | Поле состояния или ссылка на систему. |
| `margin` | [1840](../src/style.css#L1840) | Поле состояния или ссылка на систему. |
| `display` | [1843](../src/style.css#L1843) | Поле состояния или ссылка на систему. |
| `gap` | [1845](../src/style.css#L1845) | Поле состояния или ссылка на систему. |
| `margin` | [1848](../src/style.css#L1848) | Поле состояния или ссылка на систему. |
| `position` | [1851](../src/style.css#L1851) | Поле состояния или ссылка на систему. |
| `left` | [1852](../src/style.css#L1852) | Поле состояния или ссылка на систему. |
| `bottom` | [1853](../src/style.css#L1853) | Поле состояния или ссылка на систему. |
| `width` | [1854](../src/style.css#L1854) | Поле состояния или ссылка на систему. |
| `padding` | [1856](../src/style.css#L1856) | Поле состояния или ссылка на систему. |
| `background` | [1857](../src/style.css#L1857) | Поле состояния или ссылка на систему. |
| `color` | [1861](../src/style.css#L1861) | Поле состояния или ссылка на систему. |
| `color` | [1866](../src/style.css#L1866) | Поле состояния или ссылка на систему. |
| `margin` | [1867](../src/style.css#L1867) | Поле состояния или ссылка на систему. |
| `display` | [1876](../src/style.css#L1876) | Поле состояния или ссылка на систему. |
| `gap` | [1878](../src/style.css#L1878) | Поле состояния или ссылка на систему. |
| `margin` | [1881](../src/style.css#L1881) | Поле состояния или ссылка на систему. |
| `width` | [1884](../src/style.css#L1884) | Поле состояния или ссылка на систему. |
| `bottom` | [1940](../src/style.css#L1940) | Поле состояния или ссылка на систему. |
| `left` | [1944](../src/style.css#L1944) | Поле состояния или ссылка на систему. |
| `right` | [1945](../src/style.css#L1945) | Поле состояния или ссылка на систему. |
| `bottom` | [1946](../src/style.css#L1946) | Поле состояния или ссылка на систему. |
| `width` | [1947](../src/style.css#L1947) | Поле состояния или ссылка на систему. |
| `padding` | [1948](../src/style.css#L1948) | Поле состояния или ссылка на систему. |
| `background` | [1949](../src/style.css#L1949) | Поле состояния или ссылка на систему. |
| `border` | [1950](../src/style.css#L1950) | Поле состояния или ссылка на систему. |
| `margin` | [1959](../src/style.css#L1959) | Поле состояния или ссылка на систему. |
| `gap` | [1963](../src/style.css#L1963) | Поле состояния или ссылка на систему. |
| `display` | [1975](../src/style.css#L1975) | Поле состояния или ссылка на систему. |
| `color` | [1979](../src/style.css#L1979) | Поле состояния или ссылка на систему. |
| `position` | [1982](../src/style.css#L1982) | Поле состояния или ссылка на систему. |
| `left` | [1983](../src/style.css#L1983) | Поле состояния или ссылка на систему. |
| `top` | [1984](../src/style.css#L1984) | Поле состояния или ссылка на систему. |
| `transform` | [1985](../src/style.css#L1985) | Поле состояния или ссылка на систему. |
| `padding` | [1987](../src/style.css#L1987) | Поле состояния или ссылка на систему. |
| `border` | [1989](../src/style.css#L1989) | Поле состояния или ссылка на систему. |
| `background` | [1990](../src/style.css#L1990) | Поле состояния или ссылка на систему. |
| `color` | [1991](../src/style.css#L1991) | Поле состояния или ссылка на систему. |
| `left` | [1997](../src/style.css#L1997) | Поле состояния или ссылка на систему. |
| `right` | [1998](../src/style.css#L1998) | Поле состояния или ссылка на систему. |
| `bottom` | [1999](../src/style.css#L1999) | Поле состояния или ссылка на систему. |
| `width` | [2000](../src/style.css#L2000) | Поле состояния или ссылка на систему. |
| `display` | [2003](../src/style.css#L2003) | Поле состояния или ссылка на систему. |
| `gap` | [2004](../src/style.css#L2004) | Поле состояния или ссылка на систему. |
| `flex` | [2008](../src/style.css#L2008) | Поле состояния или ссылка на систему. |
| `padding` | [2010](../src/style.css#L2010) | Поле состояния или ссылка на систему. |
| `display` | [2013](../src/style.css#L2013) | Поле состояния или ссылка на систему. |
| `gap` | [2015](../src/style.css#L2015) | Поле состояния или ссылка на систему. |
| `padding` | [2019](../src/style.css#L2019) | Поле состояния или ссылка на систему. |
| `border` | [2020](../src/style.css#L2020) | Поле состояния или ссылка на систему. |
| `background` | [2022](../src/style.css#L2022) | Поле состояния или ссылка на систему. |
| `display` | [2023](../src/style.css#L2023) | Поле состояния или ссылка на систему. |
| `gap` | [2025](../src/style.css#L2025) | Поле состояния или ссылка на систему. |
| `display` | [2029](../src/style.css#L2029) | Поле состояния или ссылка на систему. |
| `gap` | [2030](../src/style.css#L2030) | Поле состояния или ссылка на систему. |
| `color` | [2035](../src/style.css#L2035) | Поле состояния или ссылка на систему. |
| `color` | [2044](../src/style.css#L2044) | Поле состояния или ссылка на систему. |
| `margin` | [2045](../src/style.css#L2045) | Поле состояния или ссылка на систему. |
| `color` | [2050](../src/style.css#L2050) | Поле состояния или ссылка на систему. |
| `padding` | [2055](../src/style.css#L2055) | Поле состояния или ссылка на систему. |
| `background` | [2059](../src/style.css#L2059) | Поле состояния или ссылка на систему. |
| `color` | [2060](../src/style.css#L2060) | Поле состояния или ссылка на систему. |
| `background` | [2065](../src/style.css#L2065) | Поле состояния или ссылка на систему. |
| `color` | [2066](../src/style.css#L2066) | Поле состояния или ссылка на систему. |
| `color` | [2072](../src/style.css#L2072) | Поле состояния или ссылка на систему. |
| `width` | [2075](../src/style.css#L2075) | Поле состояния или ссылка на систему. |
| `display` | [2078](../src/style.css#L2078) | Поле состояния или ссылка на систему. |
| `gap` | [2080](../src/style.css#L2080) | Поле состояния или ссылка на систему. |
| `margin` | [2081](../src/style.css#L2081) | Поле состояния или ссылка на систему. |
| `padding` | [2084](../src/style.css#L2084) | Поле состояния или ссылка на систему. |
| `border` | [2085](../src/style.css#L2085) | Поле состояния или ссылка на систему. |
| `background` | [2087](../src/style.css#L2087) | Поле состояния или ссылка на систему. |
| `display` | [2088](../src/style.css#L2088) | Поле состояния или ссылка на систему. |
| `gap` | [2091](../src/style.css#L2091) | Поле состояния или ссылка на систему. |
| `color` | [2099](../src/style.css#L2099) | Поле состояния или ссылка на систему. |
| `width` | [2123](../src/style.css#L2123) | Поле состояния или ссылка на систему. |
| `display` | [2280](../src/style.css#L2280) | Поле состояния или ссылка на систему. |
| `gap` | [2282](../src/style.css#L2282) | Поле состояния или ссылка на систему. |
| `width` | [2288](../src/style.css#L2288) | Поле состояния или ссылка на систему. |
| `gap` | [2289](../src/style.css#L2289) | Поле состояния или ссылка на систему. |
| `position` | [2292](../src/style.css#L2292) | Поле состояния или ссылка на систему. |
| `width` | [2295](../src/style.css#L2295) | Поле состояния или ссылка на систему. |
| `margin` | [2296](../src/style.css#L2296) | Поле состояния или ссылка на систему. |
| `position` | [2300](../src/style.css#L2300) | Поле состояния или ссылка на систему. |
| `width` | [2303](../src/style.css#L2303) | Поле состояния или ссылка на систему. |
| `margin` | [2304](../src/style.css#L2304) | Поле состояния или ссылка на систему. |
| `display` | [2326](../src/style.css#L2326) | Поле состояния или ссылка на систему. |
| `gap` | [2329](../src/style.css#L2329) | Поле состояния или ссылка на систему. |
| `margin` | [2332](../src/style.css#L2332) | Поле состояния или ссылка на систему. |
| `width` | [2335](../src/style.css#L2335) | Поле состояния или ссылка на систему. |
| `margin` | [2336](../src/style.css#L2336) | Поле состояния или ссылка на систему. |
| `padding` | [2337](../src/style.css#L2337) | Поле состояния или ссылка на систему. |
| `display` | [2341](../src/style.css#L2341) | Поле состояния или ссылка на систему. |
| `gap` | [2343](../src/style.css#L2343) | Поле состояния или ссылка на систему. |
| `display` | [2347](../src/style.css#L2347) | Поле состояния или ссылка на систему. |
| `gap` | [2348](../src/style.css#L2348) | Поле состояния или ссылка на систему. |
| `padding` | [2351](../src/style.css#L2351) | Поле состояния или ссылка на систему. |
| `border` | [2352](../src/style.css#L2352) | Поле состояния или ссылка на систему. |
| `background` | [2354](../src/style.css#L2354) | Поле состояния или ссылка на систему. |
| `color` | [2355](../src/style.css#L2355) | Поле состояния или ссылка на систему. |
| `color` | [2358](../src/style.css#L2358) | Поле состояния или ссылка на систему. |
| `background` | [2360](../src/style.css#L2360) | Поле состояния или ссылка на систему. |
| `color` | [2365](../src/style.css#L2365) | Поле состояния или ссылка на систему. |
| `display` | [2369](../src/style.css#L2369) | Поле состояния или ссылка на систему. |
| `display` | [2372](../src/style.css#L2372) | Поле состояния или ссылка на систему. |
| `color` | [2375](../src/style.css#L2375) | Поле состояния или ссылка на систему. |
| `margin` | [2380](../src/style.css#L2380) | Поле состояния или ссылка на систему. |
| `opacity` | [2383](../src/style.css#L2383) | Поле состояния или ссылка на систему. |
| `height` | [2386](../src/style.css#L2386) | Поле состояния или ссылка на систему. |
| `width` | [2387](../src/style.css#L2387) | Поле состояния или ссылка на систему. |
| `display` | [2389](../src/style.css#L2389) | Поле состояния или ссылка на систему. |
| `border` | [2390](../src/style.css#L2390) | Поле состояния или ссылка на систему. |
| `position` | [2394](../src/style.css#L2394) | Поле состояния или ссылка на систему. |
| `right` | [2395](../src/style.css#L2395) | Поле состояния или ссылка на систему. |
| `top` | [2396](../src/style.css#L2396) | Поле состояния или ссылка на систему. |
| `padding` | [2399](../src/style.css#L2399) | Поле состояния или ссылка на систему. |
| `border` | [2400](../src/style.css#L2400) | Поле состояния или ссылка на систему. |
| `background` | [2401](../src/style.css#L2401) | Поле состояния или ссылка на систему. |
| `display` | [2407](../src/style.css#L2407) | Поле состояния или ссылка на систему. |
| `color` | [2410](../src/style.css#L2410) | Поле состояния или ссылка на систему. |
| `display` | [2413](../src/style.css#L2413) | Поле состояния или ссылка на систему. |
| `color` | [2415](../src/style.css#L2415) | Поле состояния или ссылка на систему. |
| `margin` | [2416](../src/style.css#L2416) | Поле состояния или ссылка на систему. |
| `display` | [2419](../src/style.css#L2419) | Поле состояния или ссылка на систему. |
| `color` | [2422](../src/style.css#L2422) | Поле состояния или ссылка на систему. |
| `animation` | [2479](../src/style.css#L2479) | Поле состояния или ссылка на систему. |
| `animation` | [2482](../src/style.css#L2482) | Поле состояния или ссылка на систему. |
| `display` | [2505](../src/style.css#L2505) | Поле состояния или ссылка на систему. |
| `padding` | [2508](../src/style.css#L2508) | Поле состояния или ссылка на систему. |
| `margin` | [2517](../src/style.css#L2517) | Поле состояния или ссылка на систему. |
| `background` | [2520](../src/style.css#L2520) | Поле состояния или ссылка на систему. |
| `padding` | [2522](../src/style.css#L2522) | Поле состояния или ссылка на систему. |
| `color` | [2523](../src/style.css#L2523) | Поле состояния или ссылка на систему. |
| `display` | [2526](../src/style.css#L2526) | Поле состояния или ссылка на систему. |
| `gap` | [2528](../src/style.css#L2528) | Поле состояния или ссылка на систему. |
| `margin` | [2529](../src/style.css#L2529) | Поле состояния или ссылка на систему. |
| `color` | [2530](../src/style.css#L2530) | Поле состояния или ссылка на систему. |
| `display` | [2534](../src/style.css#L2534) | Поле состояния или ссылка на систему. |
| `gap` | [2537](../src/style.css#L2537) | Поле состояния или ссылка на систему. |
| `color` | [2541](../src/style.css#L2541) | Поле состояния или ссылка на систему. |
| `border` | [2546](../src/style.css#L2546) | Поле состояния или ссылка на систему. |
| `background` | [2547](../src/style.css#L2547) | Поле состояния или ссылка на систему. |
| `color` | [2549](../src/style.css#L2549) | Поле состояния или ссылка на систему. |
| `padding` | [2551](../src/style.css#L2551) | Поле состояния или ссылка на систему. |
| `display` | [2554](../src/style.css#L2554) | Поле состояния или ссылка на систему. |
| `gap` | [2557](../src/style.css#L2557) | Поле состояния или ссылка на систему. |
| `color` | [2560](../src/style.css#L2560) | Поле состояния или ссылка на систему. |
| `width` | [2563](../src/style.css#L2563) | Поле состояния или ссылка на систему. |
| `height` | [2564](../src/style.css#L2564) | Поле состояния или ссылка на систему. |
| `background` | [2565](../src/style.css#L2565) | Поле состояния или ссылка на систему. |
| `color` | [2566](../src/style.css#L2566) | Поле состояния или ссылка на систему. |
| `border` | [2567](../src/style.css#L2567) | Поле состояния или ссылка на систему. |
| `width` | [2571](../src/style.css#L2571) | Поле состояния или ссылка на систему. |
| `padding` | [2572](../src/style.css#L2572) | Поле состояния или ссылка на систему. |
| `margin` | [2576](../src/style.css#L2576) | Поле состояния или ссылка на систему. |
| `margin` | [2579](../src/style.css#L2579) | Поле состояния или ссылка на систему. |
| `margin` | [2582](../src/style.css#L2582) | Поле состояния или ссылка на систему. |
| `height` | [2585](../src/style.css#L2585) | Поле состояния или ссылка на систему. |
| `margin` | [2589](../src/style.css#L2589) | Поле состояния или ссылка на систему. |
| `gap` | [2590](../src/style.css#L2590) | Поле состояния или ссылка на систему. |
| `padding` | [2593](../src/style.css#L2593) | Поле состояния или ссылка на систему. |
| `border` | [2594](../src/style.css#L2594) | Поле состояния или ссылка на систему. |
| `background` | [2595](../src/style.css#L2595) | Поле состояния или ссылка на систему. |
| `color` | [2596](../src/style.css#L2596) | Поле состояния или ссылка на систему. |
| `color` | [2601](../src/style.css#L2601) | Поле состояния или ссылка на систему. |
| `margin` | [2605](../src/style.css#L2605) | Поле состояния или ссылка на систему. |
| `margin` | [2610](../src/style.css#L2610) | Поле состояния или ссылка на систему. |
| `position` | [2748](../src/style.css#L2748) | Поле состояния или ссылка на систему. |
| `outline` | [2749](../src/style.css#L2749) | Поле состояния или ссылка на систему. |
| `animation` | [2751](../src/style.css#L2751) | Поле состояния или ссылка на систему. |
| `display` | [2761](../src/style.css#L2761) | Поле состояния или ссылка на систему. |
| `gap` | [2762](../src/style.css#L2762) | Поле состояния или ссылка на систему. |
| `margin` | [2764](../src/style.css#L2764) | Поле состояния или ссылка на систему. |
| `font` | [2767](../src/style.css#L2767) | Поле состояния или ссылка на систему. |
| `color` | [2768](../src/style.css#L2768) | Поле состояния или ссылка на систему. |
| `background` | [2769](../src/style.css#L2769) | Поле состояния или ссылка на систему. |
| `border` | [2770](../src/style.css#L2770) | Поле состояния или ссылка на систему. |
| `padding` | [2773](../src/style.css#L2773) | Поле состояния или ссылка на систему. |
| `animation` | [2774](../src/style.css#L2774) | Поле состояния или ссылка на систему. |
| `background` | [2777](../src/style.css#L2777) | Поле состояния или ссылка на систему. |
| `color` | [2778](../src/style.css#L2778) | Поле состояния или ссылка на систему. |
| `transform` | [2779](../src/style.css#L2779) | Поле состояния или ссылка на систему. |
| `color` | [2786](../src/style.css#L2786) | Поле состояния или ссылка на систему. |
| `display` | [2789](../src/style.css#L2789) | Поле состояния или ссылка на систему. |
| `top` | [2792](../src/style.css#L2792) | Поле состояния или ссылка на систему. |
| `bottom` | [2793](../src/style.css#L2793) | Поле состояния или ссылка на систему. |
| `left` | [2794](../src/style.css#L2794) | Поле состояния или ссылка на систему. |
| `right` | [2795](../src/style.css#L2795) | Поле состояния или ссылка на систему. |
| `transform` | [2796](../src/style.css#L2796) | Поле состояния или ссылка на систему. |
| `width` | [2797](../src/style.css#L2797) | Поле состояния или ссылка на систему. |
| `padding` | [2798](../src/style.css#L2798) | Поле состояния или ссылка на систему. |
| `display` | [2805](../src/style.css#L2805) | Поле состояния или ссылка на систему. |
| `margin` | [2809](../src/style.css#L2809) | Поле состояния или ссылка на систему. |
| `padding` | [2815](../src/style.css#L2815) | Поле состояния или ссылка на систему. |
| `position` | [2819](../src/style.css#L2819) | Поле состояния или ссылка на систему. |
| `transform` | [2821](../src/style.css#L2821) | Поле состояния или ссылка на систему. |
| `background` | [2822](../src/style.css#L2822) | Поле состояния или ссылка на систему. |
| `border` | [2823](../src/style.css#L2823) | Поле состояния или ссылка на систему. |
| `padding` | [2825](../src/style.css#L2825) | Поле состояния или ссылка на систему. |
| `color` | [2827](../src/style.css#L2827) | Поле состояния или ссылка на систему. |
| `animation` | [2829](../src/style.css#L2829) | Поле состояния или ссылка на систему. |
| `display` | [2835](../src/style.css#L2835) | Поле состояния или ссылка на систему. |
| `color` | [2838](../src/style.css#L2838) | Поле состояния или ссылка на систему. |
| `background` | [2848](../src/style.css#L2848) | Поле состояния или ссылка на систему. |
| `width` | [2851](../src/style.css#L2851) | Поле состояния или ссылка на систему. |
| `background` | [2853](../src/style.css#L2853) | Поле состояния или ссылка на систему. |
| `display` | [2856](../src/style.css#L2856) | Поле состояния или ссылка на систему. |
| `gap` | [2858](../src/style.css#L2858) | Поле состояния или ссылка на систему. |
| `color` | [2860](../src/style.css#L2860) | Поле состояния или ссылка на систему. |
| `color` | [2864](../src/style.css#L2864) | Поле состояния или ссылка на систему. |
| `margin` | [2865](../src/style.css#L2865) | Поле состояния или ссылка на систему. |
| `display` | [2876](../src/style.css#L2876) | Поле состояния или ссылка на систему. |
| `gap` | [2877](../src/style.css#L2877) | Поле состояния или ссылка на систему. |
| `padding` | [2880](../src/style.css#L2880) | Поле состояния или ссылка на систему. |
| `border` | [2882](../src/style.css#L2882) | Поле состояния или ссылка на систему. |
| `color` | [2887](../src/style.css#L2887) | Поле состояния или ссылка на систему. |
| `color` | [2890](../src/style.css#L2890) | Поле состояния или ссылка на систему. |
| `color` | [2893](../src/style.css#L2893) | Поле состояния или ссылка на систему. |
| `color` | [2896](../src/style.css#L2896) | Поле состояния или ссылка на систему. |
| `display` | [2958](../src/style.css#L2958) | Поле состояния или ссылка на систему. |
| `background` | [2960](../src/style.css#L2960) | Поле состояния или ссылка на систему. |
| `padding` | [2963](../src/style.css#L2963) | Поле состояния или ссылка на систему. |
| `content` | [2966](../src/style.css#L2966) | Поле состояния или ссылка на систему. |
| `position` | [2967](../src/style.css#L2967) | Поле состояния или ссылка на систему. |
| `inset` | [2968](../src/style.css#L2968) | Поле состояния или ссылка на систему. |
| `background` | [2969](../src/style.css#L2969) | Поле состояния или ссылка на систему. |
| `position` | [2973](../src/style.css#L2973) | Поле состояния или ссылка на систему. |
| `width` | [2974](../src/style.css#L2974) | Поле состояния или ссылка на систему. |
| `padding` | [2975](../src/style.css#L2975) | Поле состояния или ссылка на систему. |
| `background` | [2976](../src/style.css#L2976) | Поле состояния или ссылка на систему. |
| `border` | [2977](../src/style.css#L2977) | Поле состояния или ссылка на систему. |
| `overflow` | [2981](../src/style.css#L2981) | Поле состояния или ссылка на систему. |
| `color` | [2988](../src/style.css#L2988) | Поле состояния или ссылка на систему. |
| `margin` | [2990](../src/style.css#L2990) | Поле состояния или ссылка на систему. |
| `color` | [2994](../src/style.css#L2994) | Поле состояния или ссылка на систему. |
| `width` | [3000](../src/style.css#L3000) | Поле состояния или ссылка на систему. |
| `background` | [3002](../src/style.css#L3002) | Поле состояния или ссылка на систему. |
| `color` | [3004](../src/style.css#L3004) | Поле состояния или ссылка на систему. |
| `display` | [3018](../src/style.css#L3018) | Поле состояния или ссылка на систему. |
| `display` | [3021](../src/style.css#L3021) | Поле состояния или ссылка на систему. |
| `gap` | [3023](../src/style.css#L3023) | Поле состояния или ссылка на систему. |
| `margin` | [3024](../src/style.css#L3024) | Поле состояния или ссылка на систему. |
| `color` | [3025](../src/style.css#L3025) | Поле состояния или ссылка на систему. |
| `width` | [3029](../src/style.css#L3029) | Поле состояния или ссылка на систему. |
| `height` | [3030](../src/style.css#L3030) | Поле состояния или ссылка на систему. |
| `width` | [3034](../src/style.css#L3034) | Поле состояния или ссылка на систему. |
| `background` | [3036](../src/style.css#L3036) | Поле состояния или ссылка на систему. |
| `color` | [3038](../src/style.css#L3038) | Поле состояния или ссылка на систему. |
| `color` | [3042](../src/style.css#L3042) | Поле состояния или ссылка на систему. |
| `color` | [3048](../src/style.css#L3048) | Поле состояния или ссылка на систему. |
| `position` | [3049](../src/style.css#L3049) | Поле состояния или ссылка на систему. |
| `padding` | [3050](../src/style.css#L3050) | Поле состояния или ссылка на систему. |
| `background` | [3051](../src/style.css#L3051) | Поле состояния или ссылка на систему. |
| `border` | [3052](../src/style.css#L3052) | Поле состояния или ссылка на систему. |
| `content` | [3058](../src/style.css#L3058) | Поле состояния или ссылка на систему. |
| `position` | [3059](../src/style.css#L3059) | Поле состояния или ссылка на систему. |
| `bottom` | [3060](../src/style.css#L3060) | Поле состояния или ссылка на систему. |
| `left` | [3061](../src/style.css#L3061) | Поле состояния или ссылка на систему. |
| `width` | [3062](../src/style.css#L3062) | Поле состояния или ссылка на систему. |
| `height` | [3063](../src/style.css#L3063) | Поле состояния или ссылка на систему. |
| `background` | [3064](../src/style.css#L3064) | Поле состояния или ссылка на систему. |
| `color` | [3071](../src/style.css#L3071) | Поле состояния или ссылка на систему. |
| `background` | [3072](../src/style.css#L3072) | Поле состояния или ссылка на систему. |
| `display` | [3077](../src/style.css#L3077) | Поле состояния или ссылка на систему. |
| `color` | [3080](../src/style.css#L3080) | Поле состояния или ссылка на систему. |
| `animation` | [3081](../src/style.css#L3081) | Поле состояния или ссылка на систему. |
| `position` | [3084](../src/style.css#L3084) | Поле состояния или ссылка на систему. |
| `left` | [3086](../src/style.css#L3086) | Поле состояния или ссылка на систему. |
| `top` | [3087](../src/style.css#L3087) | Поле состояния или ссылка на систему. |
| `transform` | [3088](../src/style.css#L3088) | Поле состояния или ссылка на систему. |
| `display` | [3093](../src/style.css#L3093) | Поле состояния или ссылка на систему. |
| `position` | [3094](../src/style.css#L3094) | Поле состояния или ссылка на систему. |
| `color` | [3098](../src/style.css#L3098) | Поле состояния или ссылка на систему. |
| `animation` | [3102](../src/style.css#L3102) | Поле состояния или ссылка на систему. |
| `content` | [3105](../src/style.css#L3105) | Поле состояния или ссылка на систему. |
| `position` | [3106](../src/style.css#L3106) | Поле состояния или ссылка на систему. |
| `left` | [3107](../src/style.css#L3107) | Поле состояния или ссылка на систему. |
| `bottom` | [3108](../src/style.css#L3108) | Поле состояния или ссылка на систему. |
| `width` | [3109](../src/style.css#L3109) | Поле состояния или ссылка на систему. |
| `height` | [3110](../src/style.css#L3110) | Поле состояния или ссылка на систему. |
| `background` | [3111](../src/style.css#L3111) | Поле состояния или ссылка на систему. |
| `display` | [3118](../src/style.css#L3118) | Поле состояния или ссылка на систему. |
| `color` | [3119](../src/style.css#L3119) | Поле состояния или ссылка на систему. |
| `animation` | [3122](../src/style.css#L3122) | Поле состояния или ссылка на систему. |

## Изображения и музыка

### [src/assets/armed-motion-atlas.webp](../src/assets/armed-motion-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.52 МиБ.

### [src/assets/biome-atlas.webp](../src/assets/biome-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.74 МиБ.

### [src/assets/combat-atlas.webp](../src/assets/combat-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.54 МиБ.

### [src/assets/creep-atlas.webp](../src/assets/creep-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.68 МиБ.

### [src/assets/details-atlas.webp](../src/assets/details-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.68 МиБ.

### [src/assets/equipment-atlas.webp](../src/assets/equipment-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.28 МиБ.

### [src/assets/hero-atlas.webp](../src/assets/hero-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.32 МиБ.

### [src/assets/interiors-atlas.webp](../src/assets/interiors-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.63 МиБ.

### [src/assets/music/boss-battle-10-metal.mp3](../src/assets/music/boss-battle-10-metal.mp3)

Музыкальная запись. Подключение и выбор режима — audio/Soundtrack.ts; авторы и лицензия — ASSET_CREDITS.md.

Ресурс: 0.49 МиБ.

### [src/assets/music/boss-battle-2-symphonic-metal.mp3](../src/assets/music/boss-battle-2-symphonic-metal.mp3)

Музыкальная запись. Подключение и выбор режима — audio/Soundtrack.ts; авторы и лицензия — ASSET_CREDITS.md.

Ресурс: 0.30 МиБ.

### [src/assets/music/boss-battle-9-metal.mp3](../src/assets/music/boss-battle-9-metal.mp3)

Музыкальная запись. Подключение и выбор режима — audio/Soundtrack.ts; авторы и лицензия — ASSET_CREDITS.md.

Ресурс: 0.49 МиБ.

### [src/assets/music/choir-1.mp3](../src/assets/music/choir-1.mp3)

Музыкальная запись. Подключение и выбор режима — audio/Soundtrack.ts; авторы и лицензия — ASSET_CREDITS.md.

Ресурс: 1.05 МиБ.

### [src/assets/music/choir-2.mp3](../src/assets/music/choir-2.mp3)

Музыкальная запись. Подключение и выбор режима — audio/Soundtrack.ts; авторы и лицензия — ASSET_CREDITS.md.

Ресурс: 0.61 МиБ.

### [src/assets/music/choir-3.mp3](../src/assets/music/choir-3.mp3)

Музыкальная запись. Подключение и выбор режима — audio/Soundtrack.ts; авторы и лицензия — ASSET_CREDITS.md.

Ресурс: 1.44 МиБ.

### [src/assets/music/fairy-adventure.mp3](../src/assets/music/fairy-adventure.mp3)

Музыкальная запись. Подключение и выбор режима — audio/Soundtrack.ts; авторы и лицензия — ASSET_CREDITS.md.

Ресурс: 1.65 МиБ.

### [src/assets/music/fight-for-better-future-rockmetal.mp3](../src/assets/music/fight-for-better-future-rockmetal.mp3)

Музыкальная запись. Подключение и выбор режима — audio/Soundtrack.ts; авторы и лицензия — ASSET_CREDITS.md.

Ресурс: 0.78 МиБ.

### [src/assets/music/heavy-battle-1.mp3](../src/assets/music/heavy-battle-1.mp3)

Музыкальная запись. Подключение и выбор режима — audio/Soundtrack.ts; авторы и лицензия — ASSET_CREDITS.md.

Ресурс: 0.93 МиБ.

### [src/assets/music/heavy-battle-2.mp3](../src/assets/music/heavy-battle-2.mp3)

Музыкальная запись. Подключение и выбор режима — audio/Soundtrack.ts; авторы и лицензия — ASSET_CREDITS.md.

Ресурс: 0.95 МиБ.

### [src/assets/resident-atlas.webp](../src/assets/resident-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.38 МиБ.

### [src/assets/roll-atlas.webp](../src/assets/roll-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.50 МиБ.

### [src/assets/story-atlas.webp](../src/assets/story-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.63 МиБ.

### [src/assets/stride-atlas.webp](../src/assets/stride-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.47 МиБ.

### [src/assets/title-v10.webp](../src/assets/title-v10.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.18 МиБ.

### [src/assets/village-atlas.webp](../src/assets/village-atlas.webp)

Рисованный атлас или иллюстрация. Загрузка — GameScene.preload; нарезка — rendering/TextureFactory.ts; титульное изображение — src/style.css.

Ресурс: 0.52 МиБ.

## Сборка и настройки

### [package.json](../package.json)

Команды проекта, зависимости и требование к версии Node.js.

Строк: 31.

### [scripts/build-offline.mjs](../scripts/build-offline.mjs)

Собирает docs/ для сайта и PLAY.html с папкой play/ для запуска без интернета.

Строк: 125.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `styles` | [43](../scripts/build-offline.mjs#L43) | Поле состояния или ссылка на систему. |
| `scripts` | [44](../scripts/build-offline.mjs#L44) | Поле состояния или ссылка на систему. |
| `current` | [101](../scripts/build-offline.mjs#L101) | Поле состояния или ссылка на систему. |

### [scripts/generate-project-map.mjs](../scripts/generate-project-map.mjs)

Обновляет эту карту и индекс символов из текущих исходников.

Строк: 149.

### [scripts/test-domain.mjs](../scripts/test-domain.mjs)

Собирает тесты правил игры и запускает встроенный тестовый раннер Node.js.

Строк: 35.

### [tsconfig.json](../tsconfig.json)

Строгая проверка TypeScript и правила разрешения импортов.

Строк: 18.

### [vite.config.ts](../vite.config.ts)

Настройки Vite; base ./ сохраняет работу сайта в подпапке GitHub Pages.

Строк: 10.

## Проверки

### [tests/browser.mjs](../tests/browser.mjs)

Проверяет настоящую игру в Chromium, интерфейс, сохранения и готовые сборки.

Строк: 412.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `args` | [14](../tests/browser.mjs#L14) | Поле состояния или ссылка на систему. |

### [tests/domain.test.ts](../tests/domain.test.ts)

Проверяет формулы, покупки, навыки, задания, сохранения, босcов и геометрию.

Строк: 205.

| Символ | Строка | Назначение |
| --- | --- | --- |
| `purchase` | [26](../tests/domain.test.ts#L26) | Проверяет цену, печати и владение; списывает валюту и меняет профиль. |
| `purchase` | [30](../tests/domain.test.ts#L30) | Проверяет цену, печати и владение; списывает валюту и меняет профиль. |
| `purchase` | [35](../tests/domain.test.ts#L35) | Проверяет цену, печати и владение; списывает валюту и меняет профиль. |
| `purchase` | [38](../tests/domain.test.ts#L38) | Проверяет цену, печати и владение; списывает валюту и меняет профиль. |
| `purchase` | [46](../tests/domain.test.ts#L46) | Проверяет цену, печати и владение; списывает валюту и меняет профиль. |
| `purchase` | [49](../tests/domain.test.ts#L49) | Проверяет цену, печати и владение; списывает валюту и меняет профиль. |
| `purchase` | [52](../tests/domain.test.ts#L52) | Проверяет цену, печати и владение; списывает валюту и меняет профиль. |
| `purchase` | [54](../tests/domain.test.ts#L54) | Проверяет цену, печати и владение; списывает валюту и меняет профиль. |
| `learnSkill` | [63](../tests/domain.test.ts#L63) | Проверяет ветку, печати, искры и оплату навыка. |
| `toggleSkill` | [66](../tests/domain.test.ts#L66) | Убирает изученный навык с панели или возвращает его. |
| `learnSkill` | [72](../tests/domain.test.ts#L72) | Проверяет ветку, печати, искры и оплату навыка. |
| `questEvent` | [131](../tests/domain.test.ts#L131) | Засчитывает действия, сбрасывает серию от урона и возвращает новые успехи. |
| `advanceQuests` | [138](../tests/domain.test.ts#L138) | Ведёт таймер и окно серии убийств. |
