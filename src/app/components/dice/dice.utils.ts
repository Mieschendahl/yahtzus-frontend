import { DICE_SIZE } from "./dice-dimensions";

export type Point = {
  x: number;
  y: number;
};

export function pipToPoints(value: number): Point[] {
  const X = {
    left: DICE_SIZE * 0.2627,
    center: DICE_SIZE * 0.5,
    right: DICE_SIZE * 0.7373,
  };

  const Y = {
    top: DICE_SIZE * 0.2118,
    middle: DICE_SIZE * 0.5,
    bottom: DICE_SIZE * 0.7882,
  };

  switch (value) {
    case 1:
      return [{ x: X.center, y: Y.middle }];
    case 2:
      return [
        { x: X.left, y: Y.top },
        { x: X.right, y: Y.bottom },
      ];
    case 3:
      return [
        { x: X.left, y: Y.top },
        { x: X.center, y: Y.middle },
        { x: X.right, y: Y.bottom },
      ];
    case 4:
      return [
        { x: X.left, y: Y.top },
        { x: X.right, y: Y.top },
        { x: X.left, y: Y.bottom },
        { x: X.right, y: Y.bottom },
      ];
    case 5:
      return [
        { x: X.left, y: Y.top },
        { x: X.right, y: Y.top },
        { x: X.center, y: Y.middle },
        { x: X.left, y: Y.bottom },
        { x: X.right, y: Y.bottom },
      ];
    case 6:
      return [
        { x: X.left, y: Y.top },
        { x: X.right, y: Y.top },
        { x: X.left, y: Y.middle },
        { x: X.right, y: Y.middle },
        { x: X.left, y: Y.bottom },
        { x: X.right, y: Y.bottom },
      ];
    default:
      return [];
  }
}