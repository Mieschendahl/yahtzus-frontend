import { DerivedFieldId, EffectId, FieldId } from "../../shared/socket-types";

export const COL_LAYOUT: {
  colId: FieldId | DerivedFieldId;
  colName: string;
}[] = [
  {
    colId: "ones",
    colName: "Ones",
  },
  {
    colId: "twos",
    colName: "Twos",
  },
  {
    colId: "threes",
    colName: "Threes",
  },
  {
    colId: "fours",
    colName: "Fours",
  },
  {
    colId: "fives",
    colName: "Fives",
  },
  {
    colId: "sixes",
    colName: "Sixes",
  },
  // {
  //   colId: "upper total",
  //   colName: "Upper Total",
  // },
  {
    colId: "upper bonus",
    colName: "Bonus",
  },
  {
    colId: "three of a kind",
    colName: "3 of a Kind",
  },
  {
    colId: "four of a kind",
    colName: "4 of a Kind",
  },
  {
    colId: "full house",
    colName: "Full House",
  },
  {
    colId: "small straight",
    colName: "SM Straight",
  },
  {
    colId: "large straight",
    colName: "LG Straight",
  },
  {
    colId: "yahtzee",
    colName: "Yahtzus",
  },
  {
    colId: "chance",
    colName: "Chance",
  },
  // {
  //   colId: "lower total",
  //   colName: "Lower Total",
  // },
  {
    colId: "total",
    colName: "Total",
  },
] as const;

export const EFFECT_DATA: Map<EffectId, string> = new Map([
  ["double", "2x"],
  ["roll", "Roll"],
  ["high", "High"],
  ["low", "Low"],
  ["mid", "Mid"],
  ["pair", "Pair"],
  ["diff", "Diff"]
]);

export const EFFECT_HEADER_NAME = "";

export const CONDITION_HEADER_NAME = "";

export function transpose<T>(cols: T[][]): T[][] {
  if (!cols.length) return [];

  return cols[0].map((_, rowIndex) =>
    cols.map(col => col[rowIndex])
  );
}