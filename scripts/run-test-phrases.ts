import { readFileSync } from "fs";
import path from "path";

import { JsonCatalogSource } from "@/lib/catalog/json-source";
import {
  analyzeSearchResults,
  searchCatalog,
} from "@/lib/engine/search";
import { CLEAR_SCORE_RATIO_THRESHOLD } from "@/lib/engine/types";
import { FakeLineSplitter } from "@/lib/providers/fake-splitter";

type TestPhrasesJson = {
  cases: Array<{
    text: string;
    expect: string;
    note?: string;
  }>;
};

function formatRatio(ratio: number | null): string {
  return ratio === null ? "n/a (single group)" : String(ratio);
}

function printSearchResults(description: string, items: Awaited<ReturnType<JsonCatalogSource["listItems"]>>) {
  const results = searchCatalog(description, items, { topN: 5 });
  const clarity = analyzeSearchResults(results);
  const top = results[0];
  const second = results[1];

  if (results.length === 0) {
    console.log("      results: (none — all scores <= 0)");
    return;
  }

  const summary = results
    .map(
      (result, rank) =>
        `#${rank + 1} sku=${result.sku} score=${result.score}${result.alternateSkus.length > 0 ? ` +${result.alternateSkus.length}` : ""}`,
    )
    .join(" | ");
  console.log(`      ${summary}`);
  console.log(
    `      leader: sku=${top?.sku} score=${top?.score} ratio=${formatRatio(clarity.scoreRatio)}${second ? ` vs #2=${second.score}` : ""}`,
  );
  if (clarity.signal === "ambiguous") {
    console.log("      signal: AMBIGUOUS (tight score cluster across groups)");
  } else if (clarity.signal === "clear") {
    console.log("      signal: CLEAR (visible score ratio across groups)");
  }
}

async function main() {
  const catalog = new JsonCatalogSource();
  const items = await catalog.listItems("demo");
  const splitter = new FakeLineSplitter();

  const phrasesPath = path.join(process.cwd(), "data", "test-phrases.json");
  const phrases = JSON.parse(readFileSync(phrasesPath, "utf-8")) as TestPhrasesJson;

  console.log(`Catalog items: ${items.length}`);
  console.log(`Test cases: ${phrases.cases.length}`);
  console.log(`Clarity threshold: ratio >= ${CLEAR_SCORE_RATIO_THRESHOLD}`);
  console.log("Splitter: FakeLineSplitter (offline)\n");

  for (const [index, testCase] of phrases.cases.entries()) {
    const caseNumber = index + 1;

    console.log(`--- Case ${caseNumber} [${testCase.expect}] ---`);
    console.log(`text: ${JSON.stringify(testCase.text)}`);
    if (testCase.note) {
      console.log(`note: ${testCase.note}`);
    }

    const lines = await splitter.split(testCase.text);
    console.log(`lines: ${lines.length}`);

    if (lines.length === 0) {
      console.log("");
      continue;
    }

    lines.forEach((line, lineIndex) => {
      const unitLabel = line.unit === null ? "null" : JSON.stringify(line.unit);
      console.log(
        `  [${lineIndex + 1}] qty=${line.quantity} unit=${unitLabel} desc=${JSON.stringify(line.description)}`,
      );
      console.log(`      raw: ${JSON.stringify(line.raw)}`);
      printSearchResults(line.description, items);
    });

    console.log("");
  }

  const acceptanceQueries = [
    "usb c cable 6ft braided black",
    "usb c cables",
    "CBL USB-C 6FT BRD WHT",
    "bicycles",
    "10 tempered glass screen protectors for the 14 pro",
    "10 SCREEN PROTECTORS IPHONE 15 PRO GLASS",
    "3 chargers",
    "2 cases for the 14",
    "500 usb c cables 3ft black",
  ];

  console.log("=== Acceptance spot-checks ===");
  for (const query of acceptanceQueries) {
    const results = searchCatalog(query, items, { topN: 5 });
    const clarity = analyzeSearchResults(results);
    console.log(`\nquery: ${JSON.stringify(query)}`);
    if (results.length === 0) {
      console.log("  (no results)");
      continue;
    }
    for (const result of results.slice(0, 5)) {
      const alternates =
        result.alternateSkus.length > 0
          ? ` (+${result.alternateSkus.length} dupes)`
          : "";
      console.log(
        `  ${result.sku} score=${result.score}${alternates} — ${result.name}`,
      );
    }
    console.log(
      `  signal: ${clarity.signal.toUpperCase()} ratio=${formatRatio(clarity.scoreRatio)}`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
