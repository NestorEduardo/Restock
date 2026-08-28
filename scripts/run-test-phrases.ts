import { readFileSync } from "fs";
import path from "path";

import { JsonCatalogSource } from "@/lib/catalog/json-source";
import {
  analyzeSearchResults,
  searchCatalog,
} from "@/lib/engine/search";
import { CLEAR_SCORE_RATIO_THRESHOLD } from "@/lib/engine/types";

type TestPhrasesJson = {
  cases: Array<{
    text: string;
    expect: string;
    note?: string;
  }>;
};

const SKIPPED_CASES = new Set([6, 7, 8]);

function isMultiLineCase(text: string): boolean {
  return text.includes("\n");
}

async function main() {
  const catalog = new JsonCatalogSource();
  const items = await catalog.listItems("demo");

  const phrasesPath = path.join(process.cwd(), "data", "test-phrases.json");
  const phrases = JSON.parse(readFileSync(phrasesPath, "utf-8")) as TestPhrasesJson;

  console.log(`Catalog items: ${items.length}`);
  console.log(`Test cases: ${phrases.cases.length}`);
  console.log(`Clarity threshold: ratio >= ${CLEAR_SCORE_RATIO_THRESHOLD}\n`);

  phrases.cases.forEach((testCase, index) => {
    const caseNumber = index + 1;
    const skipped =
      SKIPPED_CASES.has(caseNumber) || isMultiLineCase(testCase.text);

    console.log(`--- Case ${caseNumber} [${testCase.expect}] ---`);
    console.log(`text: ${JSON.stringify(testCase.text)}`);
    if (testCase.note) {
      console.log(`note: ${testCase.note}`);
    }

    if (skipped) {
      console.log("status: SKIPPED (pending line splitting)");
      console.log("");
      return;
    }

    const results = searchCatalog(testCase.text, items, { topN: 5 });
    const clarity = analyzeSearchResults(results);
    const top = results[0];
    const second = results[1];

    if (results.length === 0) {
      console.log("results: (none — all scores <= 0)");
    } else {
      const summary = results
        .map(
          (result, rank) =>
            `#${rank + 1} sku=${result.sku} score=${result.score}${result.alternateSkus.length > 0 ? ` +${result.alternateSkus.length}` : ""}`,
        )
        .join(" | ");
      console.log(summary);
      console.log(
        `leader: sku=${top?.sku} score=${top?.score} ratio=${clarity.scoreRatio === Number.POSITIVE_INFINITY ? "inf" : clarity.scoreRatio}${second ? ` vs #2=${second.score}` : ""}`,
      );
      if (clarity.signal === "ambiguous") {
        console.log("signal: AMBIGUOUS (tight score cluster across groups)");
      } else if (clarity.signal === "clear") {
        console.log("signal: CLEAR (visible score ratio across groups)");
      }
    }

    console.log("");
  });

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
      `  signal: ${clarity.signal.toUpperCase()} ratio=${clarity.scoreRatio === Number.POSITIVE_INFINITY ? "inf" : clarity.scoreRatio}`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
