import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  introWords,
  russianWords,
  englishWords,
  introWordTimings,
  russianWordTimings,
  englishWordTimings,
  INTRO_PAUSE_SECONDS,
  SILENCE_SECONDS,
  COUNTDOWN_NUMBERS,
  FONT_FAMILY,
  VISUAL_OFFSET,
  ANSWER_HOLD_SECONDS,
} from "./constants/phrase-video";

export const PhraseVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const introDuration = introWordTimings.at(-1)?.end ?? 0;

  const russianDuration = russianWordTimings.at(-1)?.end ?? 0;

  const introAudioStartFrame = Math.round(SILENCE_SECONDS * fps);

  const russianAudioStartFrame =
    introAudioStartFrame +
    Math.ceil((introDuration + INTRO_PAUSE_SECONDS) * fps);

  const countdownStartFrame =
    russianAudioStartFrame + Math.ceil(russianDuration * fps);

  const countdownDurationFrames = 5 * fps;

  const englishAudioStartFrame = countdownStartFrame + countdownDurationFrames;

  const sceneEndFrame =
    englishAudioStartFrame + Math.ceil(ANSWER_HOLD_SECONDS * fps);

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

  const showEnglish = frame >= englishAudioStartFrame;

  return (
    <AbsoluteFill
      style={{
        background: "#d9d9d9",
        fontFamily: FONT_FAMILY,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <Sequence from={introAudioStartFrame}>
        <Audio src={staticFile("audio/intro-01.wav")} />
      </Sequence>
      <Sequence
        from={russianAudioStartFrame}
        style={{
          scale: 1.008,
        }}
      >
        <Audio src={staticFile("audio/question-01.wav")} />
      </Sequence>
      <Sequence from={englishAudioStartFrame}>
        <Audio src={staticFile("audio/answer-01.wav")} />
      </Sequence>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 42,
          fontSize: 55,
          fontWeight: 700,
          textAlign: "center",
          fontFamily: FONT_FAMILY,
          transform: "translateY(-200px)",
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
          maxWidth: 620,
          minHeight: 150,
          marginBottom: 50,
          fontSize: 55,
          fontFamily: FONT_FAMILY,
          lineHeight: 1.35,
          textAlign: "center",
          transform: "translateY(-230px)",
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
      <div
        style={{
          minHeight: 110,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 45,
            fontSize: 74,
            fontWeight: 700,
            lineHeight: 1,
            transform: "translateY(-170px)",
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
      </div>
      <div
        style={{
          minHeight: 145,
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
            maxWidth: 620,
            fontSize: 55,
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
    </AbsoluteFill>
  );
};
