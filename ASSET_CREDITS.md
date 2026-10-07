# Музыка и графика RAID COIN 7.1

Все перечисленные записи взяты со страниц самих авторов на OpenGameArt.org. На каждой странице указана CC0 1.0: https://creativecommons.org/publicdomain/zero/1.0/ . Записи разрешено включать в игру и распространять. Авторы сохранены в титрах добровольно. Файлы перекодированы в MP3, нормализованы по громкости; мелодии не выдаются за созданные нами.

| Файл | Автор | Источник |
|---|---|---|
| boss-battle-10-metal.mp3 | nene | https://opengameart.org/content/boss-battle-10-metal |
| boss-battle-2-symphonic-metal.mp3 | nene | https://opengameart.org/content/boss-battle-2-symphonic-metal |
| boss-battle-9-metal.mp3 | nene | https://opengameart.org/content/boss-battle-9-metal |
| choir-1.mp3 | César da Rocha (cesisco) | https://opengameart.org/content/fantasy-choir-3-orchestral-pieces |
| choir-2.mp3 | César da Rocha (cesisco) | https://opengameart.org/content/fantasy-choir-3-orchestral-pieces |
| choir-3.mp3 | César da Rocha (cesisco) | https://opengameart.org/content/fantasy-choir-3-orchestral-pieces |
| fairy-adventure.mp3 | MintoDog | https://opengameart.org/content/fairy-adventure |
| fight-for-better-future-rockmetal.mp3 | nene | https://opengameart.org/content/fight-for-better-future-rockmetal |
| heavy-battle-1.mp3 | MintoDog | https://opengameart.org/content/heavy-battle-1 |
| heavy-battle-2.mp3 | MintoDog | https://opengameart.org/content/heavy-battle-2 |

Хоровые темы - три записи из Fantasy Choir; это хор без текста песни. Два метал-трека nene используют предназначенные для цикла секции. Музыка проигрывается локально и переключается по биому и фазе боя.

Графика village-atlas.webp, biome-atlas.webp, story-atlas.webp и creep-atlas.webp создана встроенным imagegen для этого проекта. Остальная графика, анимация и эффекты рисуются кодом.

## Графические атласы

Использован встроенный imagegen (default built-in tool mode). Деревня, биомы и противники имеют прозрачный фон; сюжетные картины имеют непрозрачный пейзаж. PNG перекодированы в WebP с качеством 90 без изменения композиции и с сохранением альфа-канала. Итоговые файлы: `src/assets/village-atlas.webp` и `src/assets/biome-atlas.webp`, 1536 × 1024, RGBA. Изображения используются непосредственно в игре; кадры выделяются при загрузке средствами Canvas.

Задание для деревни: живописный атлас в четыре столбца и два ряда, прозрачный фон, одинаковая перспектива и чистые промежутки. Сверху - кузница с горном и наковальней, мастерская бронницы со щитами, дом травницы с растениями и бутылочками, лавка путешественника с сундуком и картами. Снизу - четыре разных жителя: барсук-кузнец, красная панда-бронница, олениха-травница и енот-путешественник. Тёплый сказочный стиль, детализация дерева, камня, тканей и металла; без текста, логотипов и фона.

Задание для биомов: восемь отдельных живописных ориентиров в сетке четыре на два на прозрачном фоне, одинаковая игровая перспектива, полностью помещённые силуэты. Духовный дуб, древний мавзолей, болотный алтарь, пылающее святилище; ледяные руины, вход в катакомбы с черепами, грозовая обсерватория и врата драконьей темницы. Детализированные материалы, выразительные цвета и мистическое освещение, без надписей и интерфейса.


## Новые сюжетные картины и противники (7.1)

Режим: встроенный imagegen, генерация новых изображений. Итоговые пути в проекте:

- `src/assets/story-atlas.webp`: 1536 × 1024, RGB, четыре картины в сетке 2 × 2.
- `src/assets/creep-atlas.webp`: 1536 × 1024, RGBA, семь противников и страж оружия в сетке 4 × 2, всего восемь кадров.

Полёт стража, вытягивание выбранного оружия, разрушение, частицы и переходы между кадрами выполняются кодом игры. Это анимация изображений, а не видеоролик. WebP с качеством 90 получены перекодированием результатов PNG; прозрачность сохранена.

Точные финальные задания для генерации:

### Сюжетный атлас

```text
Use case: illustration-story. Asset type: story atlas for a desktop dark fantasy browser game, exactly 1536x1024 landscape, four edge-to-edge illustrations in a precise 2-column 2-row grid; each panel is 768x512. Primary request: rich cinematic storybook paintings about an orange fox hero in a teal scarf who must cross cursed biomes to rescue his family from a dragon. Top-left panel: the fox with a simple steel sword, his fox partner and small child, happy outside their woodland cottage, warm evening sunlight, wildflowers, lived-in carved wood, peaceful intimacy. Top-right panel: a menacing huge black-red dragon attacking that cottage at night, glowing magical cages carrying away the partner and child alive, smoke, wind, shattered window light, the fox reaching for them with his sword; no injuries or gore. Bottom-left panel: the lonely fox faces a terrifying hooded spectral reaper in a misty ruined forest; the ghost's claws lift and break his glowing sword into cyan soul fragments, ancient stones, menace and readable silhouettes. Bottom-right panel: the fox departing a lantern-lit badger merchant village toward a winding path and a far volcanic dragon fortress, courageous dawn, detailed forge, healer hut and cobbled street. Style/medium: polished hand-painted fantasy illustration, layered landscape, strong atmospheric light, textured surfaces, carefully rendered expressive fox, sinister gothic antagonists. Composition/framing: all main characters and story actions stay inside the central 75 percent vertical band of each panel because the game crops to a wide cinematic frame; each panel self-contained. Constraints: exact equal grid, no borders, no speech bubbles, no text, no letters, no logo, no watermark. Family must stay alive. Palette transitions warm home, red attack, blue ghost, golden departure.
```

### Атлас противников

```text
Use case: stylized-concept. Asset type: transparent monster sprite atlas for a desktop top-down dark fantasy action game. Exactly 1536x1024 landscape, precise 4-column by 2-row grid, eight separate full-body characters, one centered within each 384x512 cell, clear transparent margins, silhouettes never cross cell boundaries. Order top row left to right: skeletal undead soldier with rusted sword and exposed skull; decaying zombie with torn grave clothes and eerie pale eyes; hooded necromancer in ragged robes with bone staff and violet spell light; aristocratic vampire in dark red cloak, pale sinister face and clawed hands. Bottom row left to right: menacing charcoal dragon with red cracks, folded wings and coiled tail, full body inside its cell; floating blue-white wraith with skeletal face, trailing torn shroud and soul wisps; cursed armored knight with battered black iron shield and sword, green eyes inside helmet; terrifying weapon-stealing spectral reaper, faceless pitch-black hood, very long thin clawed hands, black ragged cloak, floating ghost tail, cold cyan glowing eyes and broken sword shards in one hand. Primary request: make these opponents genuinely unsettling, expressive, detailed and readable at game sprite sizes, no cute proportions. Style/medium: premium hand-painted isometric game character art, 3/4 view facing down-right, painterly materials, rusty metal, weathered cloth, spectral glow, strong distinct silhouette. Lighting/mood: eerie rim lighting, controlled bright eyes and weapons. Constraints: actual transparent background, no floor, no scenery, no panels or grid lines, no labels or text, no logos, no watermark, no gore. All eight are distinct; the reaper must be visibly different from the wraith. All characters complete, no cropping.
```
