import { readFileSync } from "fs";
import path from "path";

import { OpenAILineSplitter } from "@/lib/providers/openai-splitter";

type TestPhrasesJson = {
  cases: Array<{
    text: string;
    expect: string;
    note?: string;
  }>;
};

async function main() {
  const splitter = new OpenAILineSplitter();

  const phrasesPath = path.join(process.cwd(), "data", "test-phrases.json");
  const phrases = JSON.parse(readFileSync(phrasesPath, "utf-8")) as TestPhrasesJson;

  console.log(`Test cases: ${phrases.cases.length}`);
  console.log("Splitter: OpenAILineSplitter\n");

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
    });

    console.log("");
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
