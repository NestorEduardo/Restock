export type SplitLine = {
  quantity: number;
  unit: string | null;
  description: string;
  raw: string;
};

export interface LineSplitter {
  split(message: string): Promise<SplitLine[]>;
}
