import { type RegionProgress, type Snapshot } from '../persistence/SaveSchema';
import { type Quest } from '../quests/TrialsAndLoot';
import { type Delivery, newDeliveries, type QuestLine, newLines } from '../story/StoryContent';
import { WAVE_FIRST } from '../enemies/EnemyConfig';
import { type Profile, newProfile } from '../progression/PlayerProgression';
import { type Point } from '../world/Navigation';
import { villagePosition } from '../world/WorldConfig';
/** Профиль, прогресс областей, задания и время текущего путешествия. */
export class JourneyState {
  progress: RegionProgress[] = [];
  quests: Quest[][] = [];
  campVisits = new Set<number>();
  deliveries: Delivery[] = newDeliveries();
  lines: QuestLine[] = newLines();
  lessonIndex = 0;
  lessonProgress = 0;
  tutorialFinished = false;
  wantsTraining = false;
  storyClosing = false;
  storyIndex = 0;
  storyTime = 0;
  dirty = false;
  combatMusicLeft = 0;
  waveClock = WAVE_FIRST;
  waveNumber = 0;
  pruneLeft = 1;
  profile: Profile = newProfile();
  saved: Snapshot | null = null;
  storageAvailable = true;
  score = 0;
  kills = 0;
  deaths = 0;
  elapsed = 0;
  nextId = 1;
  checkpoint: Point = { x: villagePosition(-1).x + 15, y: 645 };
  introLeft = 0;
  introBroken = false;
  introResume = false;
}
