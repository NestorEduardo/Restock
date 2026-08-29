const STEM_EXCEPTIONS = new Set([
  "glass",
  "lens",
  "plus",
  "max",
  "pro",
  "mini",
  "this",
  "us",
  "is",
  "as",
  "has",
  "was",
  "gas",
  "bus",
  "yes",
  "less",
]);

export function stemWord(word: string): string {
  if (STEM_EXCEPTIONS.has(word) || word.length <= 3) {
    return word;
  }

  if (word.endsWith("ies") && word.length > 4) {
    return `${word.slice(0, -3)}y`;
  }

  if (word.endsWith("es") && word.length > 4) {
    const dropS = word.slice(0, -1);
    if (dropS.endsWith("e")) {
      return dropS;
    }

    const dropEs = word.slice(0, -2);
    if (/(?:[sxz]|ch|sh)$/.test(dropEs)) {
      return dropEs;
    }
  }

  if (word.endsWith("s") && !word.endsWith("ss") && word.length > 3) {
    return word.slice(0, -1);
  }

  return word;
}

export function stemText(text: string): string {
  return text
    .split(" ")
    .map((word) => stemWord(word))
    .join(" ");
}
