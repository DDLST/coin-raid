import { REGIONS } from '../Constants';
import { type RegionProgress, type Snapshot } from '../persistence/SaveSchema';
import { newProfile, type Profile } from '../progression/PlayerProgression';
import { newQuests, type Quest } from '../quests/TrialRules';
import { type Delivery, newDeliveries, newLines, type QuestLine } from '../story/StoryProgress';
import { type Point } from '../world/Navigation';
import { villagePosition } from '../world/WorldLayout';

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

  reset(): void {
    const { saved, storageAvailable } = this;
    Object.assign(this, new JourneyState());
    this.saved = saved;
    this.storageAvailable = storageAvailable;
    this.progress = REGIONS.map(() => ({
      coins: 0,
      elapsed: 0,
      spawned: false,
      bossDead: false,
      cleared: false,
      income: 0,
      rewarded: false,
    }));
    this.quests = REGIONS.map((_, index) => newQuests(index));
  }
}
