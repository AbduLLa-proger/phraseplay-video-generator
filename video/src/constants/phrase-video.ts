import { loadFont } from "@remotion/google-fonts/Montserrat";
const { fontFamily } = loadFont();

type TWordTiming = {
  word: string;
  start: number;
  end: number;
};

export type TPhraseSceneProps = {
  introWords: string[];
  russianWords: string[];
  englishWords: string[];

  introWordTimings: TWordTiming[];
  russianWordTimings: TWordTiming[];
  englishWordTimings: TWordTiming[];

  introAudio: string;
  russianAudio: string;
  englishAudio: string;
  initialPauseSeconds: number;
};

export const introWords = ["Переведите", "предложение"];
export const russianWords = [
  "Она",
  "попросила",
  "меня",
  "никому",
  "не",
  "рассказывать",
];
export const englishWords = [
  "She",
  "asked",
  "me",
  "not",
  "to",
  "tell",
  "anyone",
];

export const introWordTimings: TWordTiming[] = [
  {
    word: "Переведите",
    start: 0.072,
    end: 0.498,
  },
  {
    word: "предложение.",
    start: 0.539,
    end: 1.229,
  },
];
export const russianWordTimings = [
  {
    word: "Она",
    start: 0.071,
    end: 0.232,
  },
  {
    word: "попросила",
    start: 0.272,
    end: 0.755,
  },
  {
    word: "меня",
    start: 0.795,
    end: 0.997,
  },
  {
    word: "никому",
    start: 1.037,
    end: 1.338,
  },
  {
    word: "не",
    start: 1.399,
    end: 1.459,
  },
  {
    word: "рассказывать.",
    start: 1.479,
    end: 2.123,
  },
];
export const englishWordTimings = [
  {
    word: "She",
    start: 0.392,
    end: 0.513,
  },
  {
    word: "asked",
    start: 0.653,
    end: 0.834,
  },
  {
    word: "me",
    start: 0.874,
    end: 0.955,
  },
  {
    word: "not",
    start: 0.995,
    end: 1.176,
  },
  {
    word: "to",
    start: 1.216,
    end: 1.276,
  },
  {
    word: "tell",
    start: 1.336,
    end: 1.517,
  },
  {
    word: "anyone.",
    start: 1.617,
    end: 1.959,
  },
];

export const ANSWER_HOLD_SECONDS = 2;
export const COUNTDOWN_PAUSE_SECONDS = 0.4;
export const INTRO_PAUSE_SECONDS = 0.2;
export const SILENCE_SECONDS = 0.5;
export const COUNTDOWN_NUMBERS = [5, 4, 3, 2, 1];
export const FONT_FAMILY = fontFamily;
export const VISUAL_OFFSET = 0.04;
