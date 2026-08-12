export type TWordTiming = {
  word: string;
  start: number;
  end: number;
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

export type TVideoIntroProps = {
  levelAudio: string;
  countAudio: string;
  levelWordTimings: TWordTiming[];
  countWordTimings: TWordTiming[];
};
