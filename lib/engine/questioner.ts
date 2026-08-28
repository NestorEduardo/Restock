export type ClarificationQuestionInput = {
  attribute: string;
  values: string[];
  context?: string;
};

export interface ClarificationQuestioner {
  ask(input: ClarificationQuestionInput): string;
}
