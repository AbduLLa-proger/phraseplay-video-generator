import { Audio } from "@remotion/media";
import {
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import {
  VISUAL_OFFSET,
  FONT_FAMILY,
  VIDEO_INTRO_PAUSE_SECONDS,
  FIRST_INTRO_WORD_HOLD_SECONDS,
  SECOND_INTRO_WORD_HOLD_SECONDS,
  A1A2_LEVEL_HOLD_SECONDS,
  B1B2C1C2_LEVEL_HOLD_SECONDS,
} from "../constants/phrase-video";
import { phraseVideoStyles } from "../styles/phrase-video";
import type { TVideoIntroProps } from "../types/phrase";

export const VideoIntro = ({
  level,
  levelAudio,
  countAudio,
  levelWordTimings,
  countWordTimings,
}: TVideoIntroProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const levelDuration = levelWordTimings.at(-1)?.end ?? 0;

  const introPauseFrames = Math.ceil(VIDEO_INTRO_PAUSE_SECONDS * fps);

  const levelAudioStartFrame = introPauseFrames;

  const levelHoldSeconds =
    level === "A1" || level === "A2"
      ? A1A2_LEVEL_HOLD_SECONDS
      : B1B2C1C2_LEVEL_HOLD_SECONDS;

  const countAudioStartFrame =
    levelAudioStartFrame + levelHoldSeconds + Math.ceil(levelDuration * fps);
  const levelTime = (frame - levelAudioStartFrame) / fps;

  const countTime = (frame - countAudioStartFrame) / fps;

  const activeLevelWordIndex = levelWordTimings.findIndex((timing, index) => {
    const isLastWord = index === levelWordTimings.length - 1;

    const endTime = isLastWord
      ? timing.end + FIRST_INTRO_WORD_HOLD_SECONDS
      : timing.end;

    return levelTime >= timing.start - VISUAL_OFFSET && levelTime < endTime;
  });

  const activeCountWordIndex = countWordTimings.findIndex((timing, index) => {
    const isLastWord = index === countWordTimings.length - 1;

    const endTime = isLastWord
      ? timing.end + SECOND_INTRO_WORD_HOLD_SECONDS
      : timing.end;

    return countTime >= timing.start - VISUAL_OFFSET && countTime < endTime;
  });

  const levelWords = levelWordTimings.map(({ word }) => word);

  const countWords = countWordTimings.map(({ word }) => word);

  return (
    <div style={phraseVideoStyles.introContainer}>
      {levelWords.map((word, index) => (
        <span
          key={`${word}-${index}`}
          style={{
            color: index === activeLevelWordIndex ? "#38b6ff" : "#000",
            marginRight: 14,
            fontFamily: FONT_FAMILY,
            fontSize: 100,
          }}
        >
          {word}
        </span>
      ))}

      {countWords.map((word, index) => (
        <span
          key={`${word}-${index}`}
          style={{
            color: index === activeCountWordIndex ? "#38b6ff" : "#000",
            marginRight: 14,
            fontFamily: FONT_FAMILY,
            fontSize: 100,
          }}
        >
          {word}
        </span>
      ))}

      <Sequence from={levelAudioStartFrame}>
        <Audio src={staticFile(levelAudio)} />
      </Sequence>

      <Sequence from={countAudioStartFrame}>
        <Audio src={staticFile(countAudio)} />
      </Sequence>
    </div>
  );
};
