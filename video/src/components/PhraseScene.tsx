import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  type TPhraseSceneProps,
  FONT_FAMILY,
  INTRO_PAUSE_SECONDS,
  ANSWER_HOLD_SECONDS,
  COUNTDOWN_NUMBERS,
  VISUAL_OFFSET,
  COUNTDOWN_PAUSE_SECONDS,
  LAST_RUSSIAN_WORD_HOLD_SECONDS,
} from "../constants/phrase-video";

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
  initialPauseSeconds,
}: TPhraseSceneProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introDuration = introWordTimings.at(-1)?.end ?? 0;

  const russianDuration = russianWordTimings.at(-1)?.end ?? 0;

  const englishDuration = englishWordTimings.at(-1)?.end ?? 0;

  const introAudioStartFrame = Math.round(initialPauseSeconds * fps);

  const russianAudioStartFrame =
    introAudioStartFrame +
    Math.ceil((introDuration + INTRO_PAUSE_SECONDS) * fps);

  const countdownStartFrame =
    russianAudioStartFrame +
    Math.ceil((russianDuration + COUNTDOWN_PAUSE_SECONDS) * fps);

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
    (timing, index) => {
      const isLaswWord = index === russianWordTimings.length - 1;

      const endTime = isLaswWord
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
        <Sequence from={introAudioStartFrame}>
          <Audio src={staticFile(introAudio)} />
        </Sequence>

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
              gap: 10,
              fontSize: 80,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 20,
              fontFamily: FONT_FAMILY,
            }}
          >
            {introWords.map((word, index) => {
              const isActive = index === activeIntroWordIndex;

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
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 12,
              marginBottom: 50,
              fontSize: 80,
              fontFamily: FONT_FAMILY,
              lineHeight: 1.35,
              textAlign: "center",
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
                gap: 45,
                fontSize: 90,
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
              gap: 14,
              fontSize: 80,
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
