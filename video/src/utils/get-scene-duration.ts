import {
  ANSWER_HOLD_SECONDS,
  COUNTDOWN_NUMBERS,
  INTRO_PAUSE_SECONDS,
  SILENCE_SECONDS,
  introWordTimings,
  COUNTDOWN_PAUSE_SECONDS,
} from "../constants/phrase-video";

type TWordTiming = {
  word: string;
  start: number;
  end: number;
};

type TSceneDurationParams = {
  russianWordTimings: TWordTiming[];
  englishWordTimings: TWordTiming[];
  fps: number;
  isFirstScene: boolean;
};

export const getSceneDurationFrames = ({
  russianWordTimings,
  englishWordTimings,
  fps,
  isFirstScene,
}: TSceneDurationParams) => {
  const introDuration = introWordTimings.at(-1)?.end ?? 0;
  const russianDuration = russianWordTimings.at(-1)?.end ?? 0;
  const englishDuration = englishWordTimings.at(-1)?.end ?? 0;

  const initialPause = isFirstScene ? SILENCE_SECONDS : 0;

  const durationSeconds =
    initialPause +
    introDuration +
    INTRO_PAUSE_SECONDS +
    russianDuration +
    COUNTDOWN_NUMBERS.length +
    englishDuration +
    ANSWER_HOLD_SECONDS +
    COUNTDOWN_PAUSE_SECONDS;

  return Math.ceil(durationSeconds * fps);
};
