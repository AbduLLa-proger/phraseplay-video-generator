export type TWordTiming = {
  word: string;
  start: number;
  end: number;
};

export type TPhraseSceneProps = {
  russianWords: string[];
  englishWords: string[];

  russianWordTimings: TWordTiming[];
  englishWordTimings: TWordTiming[];

  russianAudio: string;
  englishAudio: string;
};

export type TPhraseSceneData = {
  id: string;
  russianWords: string[];
  englishWords: string[];
  russianWordTimings: TWordTiming[];
  englishWordTimings: TWordTiming[];
  russianAudio: string;
  englishAudio: string;
};

export type TEnglishLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type TVideoIntroProps = {
  level: TEnglishLevel;
  levelAudio: string;
  countAudio: string;
  levelWordTimings: TWordTiming[];
  countWordTimings: TWordTiming[];
};
