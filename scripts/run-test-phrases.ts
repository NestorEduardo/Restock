import { readFileSync } from "fs";
import path from "path";

import { JsonCatalogSource } from "@/lib/catalog/json-source";
import { decideLine } from "@/lib/engine/decide";
import type { LineOutcome } from "@/lib/engine/types";
import { FakeLineSplitter } from "@/lib/providers/fake-splitter";

type TestPhrasesJson = {
  cases: Array<{
    text: string;
    expect: string;
    note?: string;
  }>;
};

type CaseOutcome = "resolve" | "ask" | "not_found" | "no_lines";

type OutcomeCounts = {
  RESOLVED: number;
  NEEDS_CLARIFICATION: number;
  NOT_FOUND: number;
};

function deriveCaseOutcome(
  lineCount: number,
  outcomes: LineOutcome[],
): CaseOutcome {
  if (lineCount === 0) {
    return "no_lines";
  }

  if (outcomes.some((outcome) => outcome.type === "NEEDS_CLARIFICATION")) {
    return "ask";
  }

  if (outcomes.some((outcome) => outcome.type === "NOT_FOUND")) {
    return "not_found";
  }

  return "resolve";
}

function expectMatches(actual: CaseOutcome, expect: string): boolean {
  if (expect === "resolve_or_ask") {
    return actual === "resolve" || actual === "ask";
  }

  return actual === expect;
}

function printOutcome(outcome: LineOutcome, indent: string): void {
  switch (outcome.type) {
    case "RESOLVED":
      console.log(`${indent}outcome: RESOLVED`);
      console.log(`${indent}  sku=${outcome.sku} name=${JSON.stringify(outcome.name)}`);
      console.log(
        `${indent}  price=${outcome.price} quantity=${outcome.quantity} unit=${JSON.stringify(outcome.unit)}`,
      );
      console.log(`${indent}  reason: ${outcome.reason}`);
      console.log(`${indent}  availability: ${outcome.availability}`);
      console.log(
        `${indent}  unitRecognised: ${outcome.unitRecognised}${outcome.buyerUnit ? ` (buyer said ${JSON.stringify(outcome.buyerUnit)})` : ""}`,
      );
      break;
    case "NEEDS_CLARIFICATION":
      console.log(`${indent}outcome: NEEDS_CLARIFICATION`);
      console.log(`${indent}  question: ${outcome.question}`);
      console.log(
        `${indent}  distinguishingAttribute: ${outcome.distinguishingAttribute}`,
      );
      for (const option of outcome.options) {
        console.log(
          `${indent}  option: ${option.label} (sku=${option.sku})`,
        );
      }
      break;
    case "NOT_FOUND":
      console.log(`${indent}outcome: NOT_FOUND`);
      console.log(
        `${indent}  description: ${JSON.stringify(outcome.description)}`,
      );
      break;
  }
}

async function main() {
  const verbose = process.argv.includes("--verbose");
  const catalog = new JsonCatalogSource();
  const items = await catalog.listItems("demo");
  const splitter = new FakeLineSplitter();

  const phrasesPath = path.join(process.cwd(), "data", "test-phrases.json");
  const phrases = JSON.parse(readFileSync(phrasesPath, "utf-8")) as TestPhrasesJson;

  console.log(`Catalog items: ${items.length}`);
  console.log(`Test cases: ${phrases.cases.length}`);
  console.log("Splitter: FakeLineSplitter (offline)\n");

  const outcomeCounts: OutcomeCounts = {
    RESOLVED: 0,
    NEEDS_CLARIFICATION: 0,
    NOT_FOUND: 0,
  };
  const mismatches: Array<{ caseNumber: number; expect: string; actual: CaseOutcome }> =
    [];

  for (const [index, testCase] of phrases.cases.entries()) {
    const caseNumber = index + 1;

    console.log(`--- Case ${caseNumber} [expect: ${testCase.expect}] ---`);
    console.log(`text: ${JSON.stringify(testCase.text)}`);
    if (testCase.note) {
      console.log(`note: ${testCase.note}`);
    }

    const lines = await splitter.split(testCase.text);
    console.log(`lines: ${lines.length}`);

    const outcomes: LineOutcome[] = [];

    if (lines.length === 0) {
      const actual = deriveCaseOutcome(0, outcomes);
      console.log(`case outcome: ${actual}`);
      if (!expectMatches(actual, testCase.expect)) {
        mismatches.push({
          caseNumber,
          expect: testCase.expect,
          actual,
        });
      }
      console.log("");
      continue;
    }

    for (const [lineIndex, line] of lines.entries()) {
      const unitLabel = line.unit === null ? "null" : JSON.stringify(line.unit);
      console.log(
        `  [${lineIndex + 1}] qty=${line.quantity} unit=${unitLabel} desc=${JSON.stringify(line.description)}`,
      );
      console.log(`      raw: ${JSON.stringify(line.raw)}`);

      const outcome = decideLine(line, items);
      outcomes.push(outcome);
      outcomeCounts[outcome.type] += 1;
      printOutcome(outcome, "      ");
    }

    const actual = deriveCaseOutcome(lines.length, outcomes);
    console.log(`case outcome: ${actual}`);
    if (!expectMatches(actual, testCase.expect)) {
      mismatches.push({ caseNumber, expect: testCase.expect, actual });
    }

    console.log("");
  }

  console.log("=== Summary ===");
  console.log(`RESOLVED lines: ${outcomeCounts.RESOLVED}`);
  console.log(
    `NEEDS_CLARIFICATION lines: ${outcomeCounts.NEEDS_CLARIFICATION}`,
  );
  console.log(`NOT_FOUND lines: ${outcomeCounts.NOT_FOUND}`);

  if (mismatches.length === 0) {
    console.log("All cases match expect.");
  } else {
    console.log(`Mismatches (${mismatches.length}):`);
    for (const mismatch of mismatches) {
      console.log(
        `  Case ${mismatch.caseNumber}: expect=${mismatch.expect}, actual=${mismatch.actual}`,
      );
    }
  }

  if (verbose) {
    console.log("\n(--verbose: raw search output omitted; use decideLine outcomes above)");
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
