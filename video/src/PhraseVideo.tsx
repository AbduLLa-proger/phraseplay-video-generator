import { Series, useVideoConfig } from "remotion";
import scenes from "../public/data/scenes.json";
import { PhraseScene } from "./components/PhraseScene";
import { getSceneDurationFrames } from "./utils/get-scene-duration";
import {
  introWords,
  introWordTimings,
  SILENCE_SECONDS,
} from "./constants/phrase-video";

export const PhraseVideo = () => {
  const { fps } = useVideoConfig();
  return (
    <Series>
      {scenes.map((scene, index) => {
        const initialPause = index === 0 ? SILENCE_SECONDS : 0;

        const sceneDurationFrames = getSceneDurationFrames({
          russianWordTimings: scene.russianWordTimings,
          englishWordTimings: scene.englishWordTimings,
          fps,
          isFirstScene: index === 0,
        });

        return (
          <Series.Sequence
            key={scene.id}
            durationInFrames={sceneDurationFrames}
          >
            <PhraseScene
              initialPauseSeconds={initialPause}
              introWords={introWords}
              russianWords={scene.russianWords}
              englishWords={scene.englishWords}
              introWordTimings={introWordTimings}
              russianWordTimings={scene.russianWordTimings}
              englishWordTimings={scene.englishWordTimings}
              introAudio="audio/intro-01.wav"
              russianAudio={scene.russianAudio}
              englishAudio={scene.englishAudio}
            />
          </Series.Sequence>
        );
      })}
    </Series>
  );
};
