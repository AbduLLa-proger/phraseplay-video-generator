import { Series, useVideoConfig } from "remotion";
import scenesData from "../public/data/scenes.json";

import { PhraseScene } from "./components/PhraseScene";
import { VideoIntro } from "./components/VideoIntro";
import { getSceneDurationFrames } from "./utils/get-scene-duration";
import {
  INTRO_PAUSE_SECONDS,
  VIDEO_INTRO_PAUSE_SECONDS,
  HOLD_DURATION_FOR_FIVE_WORDS,
} from "./constants/phrase-video";
import type { TPhraseSceneData, TWordTiming } from "./types/phrase";

export const PhraseVideo = () => {
  const { fps } = useVideoConfig();

  const { intro, scenes } = scenesData;

  const levelWordTimings = intro.levelWordTimings as TWordTiming[];

  const countWordTimings = intro.countWordTimings as TWordTiming[];

  const levelDuration = levelWordTimings.at(-1)?.end ?? 0;

  const countDuration = countWordTimings.at(-1)?.end ?? 0;

  const introDurationFrames = Math.ceil(
    (HOLD_DURATION_FOR_FIVE_WORDS +
      levelDuration +
      countDuration +
      INTRO_PAUSE_SECONDS +
      VIDEO_INTRO_PAUSE_SECONDS) *
      fps,
  );

  return (
    <Series>
      <Series.Sequence durationInFrames={introDurationFrames}>
        <VideoIntro
          levelAudio={intro.levelAudio}
          countAudio={intro.countAudio}
          levelWordTimings={levelWordTimings}
          countWordTimings={countWordTimings}
        />
      </Series.Sequence>

      {scenes.map((scene) => {
        const typedScene = scene as TPhraseSceneData;

        return (
          <Series.Sequence
            key={typedScene.id}
            durationInFrames={getSceneDurationFrames({
              russianWordTimings: typedScene.russianWordTimings,
              englishWordTimings: typedScene.englishWordTimings,
              fps,
            })}
          >
            <PhraseScene {...typedScene} />
          </Series.Sequence>
        );
      })}
    </Series>
  );
};
