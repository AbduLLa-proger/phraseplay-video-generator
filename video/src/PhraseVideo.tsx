import { Series, useVideoConfig } from "remotion";
import scenes from "../public/data/scenes.json";
import { PhraseScene } from "./components/PhraseScene";
import {
  introWords,
  introWordTimings,
  INTRO_PAUSE_SECONDS,
  ANSWER_HOLD_SECONDS,
  COUNTDOWN_NUMBERS,
  SILENCE_SECONDS,
} from "./constants/phrase-video";

export const PhraseVideo = () => {
  const { fps } = useVideoConfig();
  return (
    <Series>
      {scenes.map((scene, index) => {
        const introDuration = introWordTimings.at(-1)?.end ?? 0;
        const russianDuration = scene.russianWordTimings.at(-1)?.end ?? 0;
        const englishDuration = scene.englishWordTimings.at(-1)?.end ?? 0;

        const initialPause = index === 0 ? SILENCE_SECONDS : 0;

        const sceneDurationSeconds =
          initialPause +
          introDuration +
          INTRO_PAUSE_SECONDS +
          russianDuration +
          COUNTDOWN_NUMBERS.length +
          englishDuration +
          ANSWER_HOLD_SECONDS;

        const sceneDurationFrames = Math.ceil(sceneDurationSeconds * fps);

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