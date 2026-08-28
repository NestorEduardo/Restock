export const BUYER_UNIT_ALIASES: Record<string, string> = {
  case: "CS",
  cases: "CS",
  cs: "CS",
  dozen: "DOZ",
  doz: "DOZ",
  each: "EA",
  ea: "EA",
  pack: "PK",
  packs: "PK",
  pk: "PK",
  blister: "BLISTER",
  blisters: "BLISTER",
};

export type BuyerUnitRecognition = {
  recognised: boolean;
  family?: string;
};

export function recogniseBuyerUnit(unit: string | null): BuyerUnitRecognition {
  if (unit === null) {
    return { recognised: true };
  }

  const normalised = unit.trim().toLowerCase();
  const family = BUYER_UNIT_ALIASES[normalised];

  if (family) {
    return { recognised: true, family };
  }

  return { recognised: false };
}
