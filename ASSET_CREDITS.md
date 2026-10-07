# Музыка и графика RAID COIN 9.1

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

## Графика

Графика создана встроенным imagegen для проекта. Атласы сохранены локально; PNG перекодированы в WebP (качество 89–90). Прозрачность сохранена. Разделение кадров, оттенки обликов, движение, удары, полёт призрака и переходы между сценами выполняются кодом игры.

| Файл в `src/assets/` | Содержимое | Размер / прозрачность |
|---|---|---|
| village-atlas.webp | Четыре дома и четыре разных жителя | 1536 × 1024, RGBA |
| biome-atlas.webp | Восемь ориентиров локаций | 1536 × 1024, RGBA |
| creep-atlas.webp | Семь мистических врагов и страж оружия | 1536 × 1024, RGBA |
| hero-atlas.webp | Антропоморфный лис, четыре направления и две позы | 1536 × 1024, RGBA |
| interiors-atlas.webp | Кузница, бронная мастерская, дом лекаря, лавка | 1254 × 1254, RGB |
| details-atlas.webp | Четыре новых врага и предметы деревни | 1536 × 1024, RGBA |
| story-atlas.webp | Четыре сюжетные картины с новым героем | 1536 × 1024, RGB |
| combat-atlas.webp | Шесть видов оружия, снаряды, метеор, воронка и дуга удара | 1254 × 1254, RGBA |
| stride-atlas.webp | Четыре кадра бега в каждом из четырёх направлений | 1254 × 1254, RGBA |
| roll-atlas.webp | Приседание, два кадра переката и приземление, четыре направления | 1254 × 1254, RGBA |
| resident-atlas.webp | Восемь антропоморфных жителей разных видов | 1536 × 1024, RGBA |
| equipment-atlas.webp | Шесть новых детальных оружий, плечо, предплечье и четыре вида перчатки | 1448 × 1086, RGBA |
| armed-motion-atlas.webp | Модульное тело: четыре направления, стойка и четыре шага, руки анимируются отдельно | 1402 × 1122, RGBA |

Новые рисунки 9.0 созданы встроенным imagegen. Бег уточнён редактированием исходного атласа; остальные три атласа созданы для этой версии. Подробные строки кадрирования оружия и варианты обликов формируются в `art.ts`; анимация рук, рык, вспышки и переходы выполняются игровым кодом.

Версия 9.1 добавляет два атласа: оружие и части рук созданы встроенным imagegen, кадры тела получены редактированием `stride-atlas.webp` с сохранением внешности лиса. Прозрачность сохранена при перекодировании в WebP. Прямоугольники кадров и центр торса измерены по рисункам; положение обеих кистей, хват рукояти, локти и фазовые анимации задаются кодом игры.
