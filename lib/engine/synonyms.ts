import { normalizeText } from "@/lib/engine/normalize";

export type SynonymRule = {
  pattern: RegExp;
  replacement: string;
};

export const SYNONYM_RULES: SynonymRule[] = [
  { pattern: /\btemp gls\b/g, replacement: "tempered glass" },
  { pattern: /\btempered\s+glass\b/g, replacement: "tempered glass" },
  { pattern: /\btype c\b/g, replacement: "usb-c" },
  { pattern: /\busb c\b/g, replacement: "usb-c" },
  { pattern: /\busbc\b/g, replacement: "usb-c" },
  { pattern: /\busb-c\b/g, replacement: "usb-c" },
  { pattern: /\bmicro usb\b/g, replacement: "micro-usb" },
  { pattern: /\bchgr\b/g, replacement: "charger" },
  { pattern: /\bcbl\b/g, replacement: "cable" },
  { pattern: /\bbrd\b/g, replacement: "braided" },
  { pattern: /\bblk\b/g, replacement: "black" },
  { pattern: /\bwht\b/g, replacement: "white" },
  { pattern: /\bclr\b/g, replacement: "clear" },
  { pattern: /\bred\b/g, replacement: "red" },
  { pattern: /\bblu\b/g, replacement: "blue" },
  { pattern: /\bcse\b/g, replacement: "case" },
  { pattern: /\bcabel\b/g, replacement: "cable" },
  { pattern: /\bscrn prot\b/g, replacement: "screen protector" },
  { pattern: /\bscreen prot\b/g, replacement: "screen protector" },
];

const LENGTH_PATTERN = /\b(\d+)\s*(?:ft|feet|')\b/g;

function normalizeLengths(text: string): string {
  return text.replace(LENGTH_PATTERN, (_match, digits: string) => `${digits}ft`);
}

export function applySynonyms(text: string): string {
  let result = normalizeText(text);

  for (const rule of SYNONYM_RULES) {
    result = result.replace(rule.pattern, rule.replacement);
  }

  return normalizeLengths(result);
}
