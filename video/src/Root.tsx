import { Composition } from "remotion";
import scenes from "../public/data/scenes.json";
import { PhraseVideo } from "./PhraseVideo";
import { getSceneDurationFrames } from "./utils/get-scene-duration";

const FPS = 30;
const durationInFrames = scenes.reduce(
  (total, scene, index) =>
    total +
    getSceneDurationFrames({
      russianWordTimings: scene.russianWordTimings,
      englishWordTimings: scene.englishWordTimings,
      fps: FPS,
      isFirstScene: index === 0,
    }),
  0,
);

export const RemotionRoot = () => {
  return (
    <Composition
      id="PhraseVideo"
      component={PhraseVideo}
      durationInFrames={durationInFrames}
      fps={FPS}
      width={720}
      height={1280}
    />
  );
};
