import type { CSSProperties } from "react";

import { FONT_FAMILY } from "../constants/phrase-video";

export const phraseVideoStyles = {
  introContainer: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 44,
    padding: 60,
    boxSizing: "border-box",
    backgroundColor: "#d9d9d9",
    color: "#000",
    fontWeight: 700,
    textAlign: "center",
  },

  introWord: {
    marginRight: 14,
    fontFamily: FONT_FAMILY,
    fontSize: 100,
  },

  phraseContainer: {
    display: "flex",
    background: "#d9d9d9",
    fontFamily: FONT_FAMILY,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 70,
    paddingTop: 90,
    paddingBottom: 90,
    height: "100%",
  },

  phraseContent: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
  },

  russianText: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 20,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: FONT_FAMILY,
  },

  countdownWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  countdown: {
    display: "flex",
    justifyContent: "center",
    gap: 65,
    fontSize: 105,
    fontWeight: 700,
    lineHeight: 1,
  },

  englishWrapper: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
  },

  englishText: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 25,
    fontFamily: FONT_FAMILY,
    lineHeight: 1.35,
    textAlign: "center",
  },
} satisfies Record<string, CSSProperties>;
