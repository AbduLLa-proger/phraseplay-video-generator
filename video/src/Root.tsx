import { Composition } from "remotion";

import scenesData from "../public/data/scenes.json";
import { PhraseVideo } from "./PhraseVideo";
import { INTRO_PAUSE_SECONDS } from "./constants/phrase-video";
import type { TWordTiming } from "./types/phrase";
import { getSceneDurationFrames } from "./utils/get-scene-duration";

const FPS = 30;

const levelWordTimings = scenesData.intro.levelWordTimings as TWordTiming[];

const countWordTimings = scenesData.intro.countWordTimings as TWordTiming[];

const levelDuration = levelWordTimings.at(-1)?.end ?? 0;

const countDuration = countWordTimings.at(-1)?.end ?? 0;

const introDurationInFrames = Math.ceil(
  (levelDuration + countDuration + INTRO_PAUSE_SECONDS) * FPS,
);

const scenesDurationInFrames = scenesData.scenes.reduce(
  (total, scene) =>
    total +
    getSceneDurationFrames({
      russianWordTimings: scene.russianWordTimings,
      englishWordTimings: scene.englishWordTimings,
      fps: FPS,
    }),
  0,
);

const durationInFrames = introDurationInFrames + scenesDurationInFrames;

export const RemotionRoot = () => {
  return (
    <Composition
      id="PhraseVideo"
      component={PhraseVideo}
      durationInFrames={durationInFrames}
      fps={FPS}
      width={1080}
      height={1920}
    />
  );
};
