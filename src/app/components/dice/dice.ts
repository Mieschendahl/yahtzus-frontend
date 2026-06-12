import {
  DICE_RADIUS,
  DICE_SIZE,
  PIP_RADIUS,
  STROKE_WIDTH,
  pipToPoints
} from "./utils";
import {
  Component,
  computed, input
} from "@angular/core";

@Component({
  selector: 'app-dice',
  imports: [],
  templateUrl: './dice.html',
  styleUrl: './dice.css',
})
export class DiceComponent {
  readonly DICE_SIZE = DICE_SIZE;
  readonly DICE_RADIUS = DICE_RADIUS;
  readonly PIP_RADIUS = PIP_RADIUS;
  readonly STROKE_WIDTH = STROKE_WIDTH;

  readonly value = input.required<number>();
  readonly points = computed(() => pipToPoints(this.value()));
}