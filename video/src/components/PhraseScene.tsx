import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type WordTiming = {
  word: string;
  start: number;
  end: number;
};

type PhraseSceneProps = {
  introWords: string[];
  russianWords: string[];
  englishWords: string[];

  introWordTimings: WordTiming[];
  russianWordTimings: WordTiming[];
  englishWordTimings: WordTiming[];

  introAudio: string;
  russianAudio: string;
  englishAudio: string;
};

const SILENCE_SECONDS = 1;
const INTRO_PAUSE_SECONDS = 0.3;
const ANSWER_HOLD_SECONDS = 1.5;

const COUNTDOWN_NUMBERS = [5, 4, 3, 2, 1];
const VISUAL_OFFSET = 0.04;

export const PhraseScene = ({
  introWords,
  russianWords,
  englishWords,
  introWordTimings,
  russianWordTimings,
  englishWordTimings,
  introAudio,
  russianAudio,
  englishAudio,
}: PhraseSceneProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introDuration = introWordTimings.at(-1)?.end ?? 0;

  const russianDuration = russianWordTimings.at(-1)?.end ?? 0;

  const englishDuration = englishWordTimings.at(-1)?.end ?? 0;

  const introAudioStartFrame = Math.round(SILENCE_SECONDS * fps);

  const russianAudioStartFrame =
    introAudioStartFrame +
    Math.ceil((introDuration + INTRO_PAUSE_SECONDS) * fps);

  const countdownStartFrame =
    russianAudioStartFrame + Math.ceil(russianDuration * fps);

  const englishAudioStartFrame =
    countdownStartFrame + COUNTDOWN_NUMBERS.length * fps;

  const englishAudioEndFrame =
    englishAudioStartFrame + Math.ceil(englishDuration * fps);

  const sceneEndFrame =
    englishAudioEndFrame + Math.ceil(ANSWER_HOLD_SECONDS * fps);

  const introTime = (frame - introAudioStartFrame) / fps;

  const russianTime = (frame - russianAudioStartFrame) / fps;

  const englishTime = (frame - englishAudioStartFrame) / fps;

  const activeIntroWordIndex = introWordTimings.findIndex(
    (timing) =>
      introTime >= timing.start - VISUAL_OFFSET && introTime < timing.end,
  );

  const activeRussianWordIndex = russianWordTimings.findIndex(
    (timing) =>
      russianTime >= timing.start - VISUAL_OFFSET && russianTime < timing.end,
  );

  const activeEnglishWordIndex = englishWordTimings.findIndex(
    (timing) =>
      englishTime >= timing.start - VISUAL_OFFSET && englishTime < timing.end,
  );

  const countdownVisible =
    frame >= countdownStartFrame && frame < englishAudioStartFrame;

  const countdownElapsedFrames = frame - countdownStartFrame;

  const activeCountdownIndex = countdownVisible
    ? Math.floor(countdownElapsedFrames / fps)
    : -1;

  const showEnglish = frame >= englishAudioStartFrame && frame < sceneEndFrame;

  return (
    <AbsoluteFill>
      <Sequence from={introAudioStartFrame}>
        <Audio src={staticFile(introAudio)} />
      </Sequence>

      <Sequence from={russianAudioStartFrame}>
        <Audio src={staticFile(russianAudio)} />
      </Sequence>

      <Sequence from={englishAudioStartFrame}>
        <Audio src={staticFile(englishAudio)} />
      </Sequence>

      {/* сюда перенесем твой текущий JSX интерфейса */}
    </AbsoluteFill>
  );
};
