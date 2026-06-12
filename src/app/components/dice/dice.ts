import {
  DICE_RADIUS,
  DICE_SIZE,
  PIP_RADIUS,
  STROKE_WIDTH,
} from "./dice-dimensions";
import {
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  signal,
} from "@angular/core";
import { pipToPoints } from "./dice.utils";

@Component({
  selector: 'app-dice',
  imports: [],
  templateUrl: './dice.html',
  styleUrl: './dice.css',
})
export class DiceComponent implements OnDestroy {
  readonly value = input.required<number>();
  readonly shuffle = input(false);

  readonly DICE_SIZE = DICE_SIZE;
  readonly DICE_RADIUS = DICE_RADIUS;
  readonly PIP_RADIUS = PIP_RADIUS;
  readonly STROKE_WIDTH = STROKE_WIDTH;

  private readonly displayValue = signal(1);

  readonly rolling = signal(false);
  readonly points = computed(() => pipToPoints(this.displayValue()));

  private intervalId: ReturnType<typeof setInterval> | undefined;
  private timeoutId: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    effect(() => {
      const value = this.value();

      this.clearTimers();

      if (!this.shuffle()) {
        this.displayValue.set(value);
        this.rolling.set(false);
        return;
      }

      this.rolling.set(true);

      this.intervalId = setInterval(() => {
        this.displayValue.set(Math.floor(Math.random() * 6) + 1);
      }, 40);

      this.timeoutId = setTimeout(() => {
        this.clearTimers();
        this.displayValue.set(value);
        this.rolling.set(false);
      }, 500);
    });
  }

  ngOnDestroy() {
    this.clearTimers();
  }

  private clearTimers() {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}