export const getDynamicFontSize = (wordCount: number) => {
  if (wordCount <= 10) {
    return 95;
  }

  if (wordCount <= 14) {
    return 88;
  }

  if (wordCount <= 18) {
    return 80;
  }

  if (wordCount <= 22) {
    return 75;
  }

  return 75;
};
