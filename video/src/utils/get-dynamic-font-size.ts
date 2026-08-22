export const getDynamicFontSize = (words: string[]) => {
  const wordCount = words.length;

  const longestWordLength = Math.max(...words.map((word) => word.length), 0);

  const totalCharacters = words.reduce((total, word) => total + word.length, 0);

  let fontSize = 100;

  if (wordCount >= 6) {
    fontSize = 95;
  }

  if (wordCount >= 9) {
    fontSize = 90;
  }

  if (wordCount >= 12) {
    fontSize = 87;
  }

  if (longestWordLength >= 12) {
    fontSize -= 4;
  }

  if (longestWordLength >= 16) {
    fontSize -= 4;
  }

  if (totalCharacters >= 70) {
    fontSize -= 4;
  }

  return Math.max(fontSize, 60);
};
