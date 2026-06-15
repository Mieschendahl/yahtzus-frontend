import { EffectId, FieldId } from "../../shared/socket-types";

export const COL_IDS = [
  "header",
  "total"
];

export type ColId = (typeof COL_IDS)[number];

export const COL_LAYOUT: {coldId?: FieldId | ColId, colName: string}[] = [
  {
    coldId: "header",
    colName: "User ID"
  },
  {
    coldId: "ones",
    colName: "Ones"
  },
  {
    coldId: "twos",
    colName: "Twos"
  },
  {
    coldId: "threes",
    colName: "Threes"
  }
] as const;

export const EFFECT_DATA: Map<EffectId, string> = new Map([
  ["double", "2x"],
  ["dice", "Dice"],
  ["roll", "Roll"]
]);

export const EFFECT_HEADER_NAME = "Effect";