import type {
  ClarificationQuestioner,
  ClarificationQuestionInput,
} from "@/lib/engine/questioner";

function formatValues(values: string[]): string {
  if (values.length <= 1) {
    return values[0] ?? "";
  }

  if (values.length === 2) {
    return `${values[0]} or ${values[1]}`;
  }

  const head = values.slice(0, -1).join(", ");
  const tail = values[values.length - 1];
  return `${head}, or ${tail}`;
}

export class FakeQuestioner implements ClarificationQuestioner {
  ask(input: ClarificationQuestionInput): string {
    const values = formatValues(input.values);

    switch (input.attribute) {
      case "productType":
        return `What type of product — ${values}?`;
      case "phoneModel":
        return `Which model — ${values}?`;
      case "variant":
        return `Which type — ${values}?`;
      case "length":
        return `Which length — ${values}?`;
      case "size":
        return `Which size — ${values}?`;
      case "connector":
        return `Which connector — ${values}?`;
      case "wattage":
        return `Which wattage — ${values}?`;
      case "capacity":
        return `Which capacity — ${values}?`;
      default:
        return `Which ${input.attribute} — ${values}?`;
    }
  }
}
