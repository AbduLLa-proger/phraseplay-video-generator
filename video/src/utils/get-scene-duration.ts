import {
  ANSWER_HOLD_SECONDS,
  COUNTDOWN_NUMBERS,
  INTRO_PAUSE_SECONDS,
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
};

export const getSceneDurationFrames = ({
  russianWordTimings,
  englishWordTimings,
  fps,
}: TSceneDurationParams) => {
  const russianDuration = russianWordTimings.at(-1)?.end ?? 0;
  const englishDuration = englishWordTimings.at(-1)?.end ?? 0;

  const durationSeconds =
    INTRO_PAUSE_SECONDS +
    russianDuration +
    COUNTDOWN_NUMBERS.length +
    englishDuration +
    ANSWER_HOLD_SECONDS +
    COUNTDOWN_PAUSE_SECONDS;

  return Math.ceil(durationSeconds * fps);
};
