import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  ANSWER_HOLD_SECONDS,
  COUNTDOWN_NUMBERS,
  VISUAL_OFFSET,
  COUNTDOWN_PAUSE_SECONDS,
  LAST_RUSSIAN_WORD_HOLD_SECONDS,
} from "../constants/phrase-video";
import type { TPhraseSceneProps } from "../types/phrase";
import { phraseVideoStyles } from "../styles/phrase-video";
import { getDynamicFontSize } from "../utils/get-dynamic-font-size";

export const PhraseScene = ({
  russianWords,
  englishWords,
  russianWordTimings,
  englishWordTimings,
  russianAudio,
  englishAudio,
}: TPhraseSceneProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const russianDuration = russianWordTimings.at(-1)?.end ?? 0;

  const englishDuration = englishWordTimings.at(-1)?.end ?? 0;

  const russianAudioStartFrame = 0;

  const countdownStartFrame =
    russianAudioStartFrame +
    Math.ceil((russianDuration + COUNTDOWN_PAUSE_SECONDS) * fps);

  const englishAudioStartFrame =
    countdownStartFrame + COUNTDOWN_NUMBERS.length * fps;

  const englishAudioEndFrame =
    englishAudioStartFrame + Math.ceil(englishDuration * fps);

  const sceneEndFrame =
    englishAudioEndFrame + Math.ceil(ANSWER_HOLD_SECONDS * fps);

  const russianTime = (frame - russianAudioStartFrame) / fps;

  const englishTime = (frame - englishAudioStartFrame) / fps;

  const activeRussianWordIndex = russianWordTimings.findIndex(
    (timing, index) => {
      const isLastWord = index === russianWordTimings.length - 1;

      const endTime = isLastWord
        ? timing.end + LAST_RUSSIAN_WORD_HOLD_SECONDS
        : timing.end;

      return (
        russianTime >= timing.start - VISUAL_OFFSET && russianTime < endTime
      );
    },
  );

  const activeEnglishWordIndex = englishWordTimings.findIndex(
    (timing) =>
      englishTime >= timing.start - VISUAL_OFFSET && englishTime < timing.end,
  );

  const countdownVisible =
    frame >= countdownStartFrame && frame < englishAudioStartFrame;

  const showCountdown = frame >= countdownStartFrame;

  const countdownElapsedFrames = frame - countdownStartFrame;

  const activeCountdownIndex = countdownVisible
    ? Math.floor(countdownElapsedFrames / fps)
    : -1;

  const showEnglish = frame >= englishAudioStartFrame && frame < sceneEndFrame;

  return (
    <AbsoluteFill style={phraseVideoStyles.phraseContainer}>
      <div style={phraseVideoStyles.phraseContent}>
        <Sequence from={russianAudioStartFrame}>
          <Audio src={staticFile(russianAudio)} />
        </Sequence>

        <Sequence from={englishAudioStartFrame}>
          <Audio src={staticFile(englishAudio)} />
        </Sequence>

        <div>
          <div
            style={{
              ...phraseVideoStyles.russianText,
              fontSize: getDynamicFontSize(russianWords),
            }}
          >
            {russianWords.map((word, index) => {
              const isActive = index === activeRussianWordIndex;

              return (
                <span
                  key={`${word}-${index}`}
                  style={{
                    color: isActive ? "#38b6ff" : "black",
                    fontWeight: 700,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>

        <div style={phraseVideoStyles.countdownWrapper}>
          {showCountdown && (
            <div style={phraseVideoStyles.countdown}>
              {COUNTDOWN_NUMBERS.map((number, index) => {
                const isActive = index === activeCountdownIndex;

                return (
                  <span
                    key={number}
                    style={{
                      color: isActive ? "#38b6ff" : "black",
                      transform: isActive ? "scale(1.08)" : "scale(1)",
                      fontWeight: 700,
                    }}
                  >
                    {number}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div style={phraseVideoStyles.englishWrapper}>
          <div
            style={{
              ...phraseVideoStyles.englishText,
              fontSize: getDynamicFontSize(englishWords),
              opacity: showEnglish ? 1 : 0,
            }}
          >
            {englishWords.map((word, index) => {
              const isActive = index === activeEnglishWordIndex;

              return (
                <span
                  key={`${word}-${index}`}
                  style={{
                    color: isActive ? "#38b6ff" : "black",
                    fontWeight: 700,
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
