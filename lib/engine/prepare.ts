import { stemText } from "@/lib/engine/stem";
import { applySynonyms } from "@/lib/engine/synonyms";

export function prepareSearchText(text: string): string {
  return stemText(applySynonyms(text));
}
