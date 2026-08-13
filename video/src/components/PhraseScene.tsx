import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  FONT_FAMILY,
  ANSWER_HOLD_SECONDS,
  COUNTDOWN_NUMBERS,
  VISUAL_OFFSET,
  COUNTDOWN_PAUSE_SECONDS,
  LAST_RUSSIAN_WORD_HOLD_SECONDS,
} from "../constants/phrase-video";
import type { TPhraseSceneProps } from "../types/phrase";

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
    <AbsoluteFill
      style={{
        display: "flex",
        background: "#d9d9d9",
        fontFamily: FONT_FAMILY,
        justifyContent: "space-between",
        alignItems: "center",
        padding: 60,
        height: "100%",
      }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Sequence from={russianAudioStartFrame}>
          <Audio src={staticFile(russianAudio)} />
        </Sequence>

        <Sequence from={englishAudioStartFrame}>
          <Audio src={staticFile(englishAudio)} />
        </Sequence>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: 20,
              fontSize: 90,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 20,
              fontFamily: FONT_FAMILY,
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {showCountdown && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 65,
                fontSize: 105,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
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
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 25,
              fontSize: 85,
              fontFamily: FONT_FAMILY,
              lineHeight: 1.35,
              textAlign: "center",
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
