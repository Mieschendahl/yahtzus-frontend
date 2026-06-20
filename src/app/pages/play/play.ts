import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SocketService } from '../../services/socket/socket.service';
import { DynamicGameType, getDerivedField, getDerivedFieldValues, getEffectId, getField, getFieldValues } from '../../shared/socket-types';
import { DiceComponent } from '../../components/dice/dice';
import { HeaderComponent } from './header/header';
import { COL_LAYOUT, EFFECT_HEADER_NAME, CONDITION_HEADER_NAME, EFFECT_DATA, transpose } from './utils';
import { prettyNone } from '../../lib/utils';

class CellUi {
  constructor(
    public text: string,
    public isPreview: boolean = false,
    public isCrossed: boolean = false,
    public canSelect: boolean = false,
    public onSelect: () => void = () => { }
  ) { }
}

@Component({
  selector: 'app-play',
  imports: [HeaderComponent, DiceComponent],
  templateUrl: './play.html',
  styleUrl: './play.css',
})
export class PlayPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly socketService = inject(SocketService);

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParamMap.get('user')?.trim();
    this.userId.set(userId);
    this.socketService.send({
      kind: "join room",
      data: {
        userId
      }
    });
  }

  readonly userId = signal<string | undefined>(undefined);
  readonly staticGame = this.socketService.staticGame;
  readonly dynamicGame = this.socketService.dynamicGame;
  readonly dice = this.socketService.dice;
  readonly players = this.socketService.players;

  readonly isActivePlayer = computed(() => {
    const dynamicGame = this.dynamicGame();
    if (!dynamicGame)
      return false;
    const userId = this.userId();
    const isActiveGame = dynamicGame.state === "playing";
    const isActivePlayer = isActiveGame && dynamicGame.activeUserId === userId;
    return isActivePlayer;
  });

  readonly canRoll = computed(() => this.isActivePlayer() && this.dynamicGame()?.rollCount! < 3 && this.dice()?.some(die => die.selected));

  readonly basicCols = computed<CellUi[][]>(() => {
    const cols: CellUi[][] = [];
    let cells = [new CellUi(prettyNone(CONDITION_HEADER_NAME))];
    COL_LAYOUT.forEach(({ colName: fieldName }) => cells.push(new CellUi(fieldName)));
    cols.push(cells);
    return cols;
  });

  readonly activeEffectId = computed(() => EFFECT_DATA.get(this.dynamicGame()?.activeEffect));

  readonly basicRows = computed(() => transpose(this.basicCols()));

  readonly playerCols = computed<CellUi[][][]>(() => {
    const staticGame = this.staticGame();
    const dynamicGame = this.dynamicGame();
    const players = this.players();
    const dice = this.dice();
    const cols: CellUi[][][] = [];

    if (!staticGame || !dynamicGame || !players || !dice)
      return cols;

    const userId = this.userId();
    const isActiveGame = dynamicGame.state === "playing";
    const isActivePlayer = isActiveGame && dynamicGame.activeUserId === userId;
    const activePlayerId = dynamicGame.activeUserId;
    const hasRolled = (dynamicGame.rollCount ?? 0) > 0;
    const fieldValues = getFieldValues(dice);

    players.forEach(({ userId: userId_, fields: fields_ }) => {
      let cells = [new CellUi(userId_)];
      const derivedValues = getDerivedFieldValues(fields_);
      const pair: CellUi[][] = [];
      COL_LAYOUT.forEach(({ colId }) => {
        // console.log(coldId, colName);
        const field = getField(colId, fields_);
        if (field) {
          if (field.fieldValue !== undefined) {
            cells.push(new CellUi(field.fieldValue.toString()));
          } else if (activePlayerId === userId_ && hasRolled) {
            const canSelect = isActivePlayer;
            const onSelect = canSelect
              ? () => this.socketService.send({
                kind: "select field",
                data: {
                  fieldId: field.fieldId
                }
              })
              : () => { };
            const fieldValue = getField(field.fieldId, fieldValues)?.fieldValue!;
            cells.push(new CellUi(fieldValue.toString(), true, false, canSelect, onSelect));
          } else {
            cells.push(new CellUi(prettyNone("")));
          }
        } else if (isActiveGame) {
          if (colId === "upper bonus") {
            const bonus = getDerivedField("upper bonus", derivedValues)?.fieldValue!;
            if (bonus > 0) {
              cells.push(new CellUi(bonus.toString()));
            } else {
              const total = getDerivedField("upper total", derivedValues)?.fieldValue!;
              cells.push(new CellUi(`${total}/63`, true));
            }
          } else {
            const value = getDerivedField(colId, derivedValues)?.fieldValue!;
            cells.push(new CellUi(value.toString()));
          }
        } else {
          cells.push(new CellUi(prettyNone("")));
        }
      });
      pair.push(cells);

      cells = [new CellUi(prettyNone(EFFECT_HEADER_NAME))];
      COL_LAYOUT.forEach(({ colId }) => {
        const effectId = getEffectId(colId, staticGame.effectIds);
        const effectName = EFFECT_DATA.get(effectId);
        const field = getField(colId, fields_);
        const isPreview = field?.effectState === "locked";
        const isCrossed = field?.effectState === "used";
        const canSelect = isActivePlayer && field?.effectState === "unlocked" && dynamicGame.activeEffect === undefined && (dynamicGame.rollCount ?? 0) > 0 && (dynamicGame?.rollCount ?? 0) < 3;
        // console.log("bruh", field)
        const onSelect = canSelect
          ? () => this.socketService.send({
            kind: "select effect",
            data: {
              fieldId: field.fieldId
            }
          })
          : () => { };
        cells.push(new CellUi(effectName ?? "", isPreview, isCrossed, canSelect, onSelect));
      });
      pair.push(cells);

      cols.push(pair);
    });

    return cols;
  });

  readonly playerRows = computed(() => this.playerCols().map(cols => transpose(cols)));

  private readonly nextRollSound = new Audio('/assets/sounds/dice-roll-wood.wav');
  private readonly nextTurnSound = new Audio('/assets/sounds/player-whoosh.wav');
  private readonly effectUsedSound = new Audio('/assets/sounds/effect-used.wav');
  private readonly gameFinishedSound = new Audio('/assets/sounds/game-finished.wav');

  constructor() {
    effect(() => {
      const dynamicGame = this.dynamicGame();
      if (!dynamicGame)
        return;

      if (dynamicGame.event === "next roll") {
        this.playSound(this.nextRollSound);
      } else if (dynamicGame.event === "next turn") {
        this.playSound(this.nextTurnSound);
      } else if (dynamicGame.event === "effect used") {
        this.playSound(this.effectUsedSound);
      } else if (dynamicGame.event === "game finished") {
        this.playSound(this.gameFinishedSound);
      }
    });
  }

  private playSound(sound: HTMLAudioElement): void {
    sound.currentTime = 0;
    sound.play().catch(() => {
      // Browser may block sound until user has clicked/interacted once.
    });
  }

  selectDices(index: number) {
    const dice = this.dice();
    if (!dice)
      return;
    this.socketService.send({
      kind: "select dices",
      data: {
        selected: dice.map((dice, index_) => index === index_ ? !dice.selected : dice.selected)
      }
    })
  }

  async inviteFriend(): Promise<void> {
    const url = new URL(window.location.href);
    url.searchParams.delete('user');
    await navigator.clipboard.writeText(url.toString());

    // this.messageService.add({
    //   severity: 'success',
    //   summary: 'Copied invite link',
    // });
  }

  startGame(): void {
    const socket = this.socketService.socket;
    socket.emit("send", {
      kind: "start game"
    });
  }

  rollDices(): void {
    const socket = this.socketService.socket;
    socket.emit("send", {
      kind: "roll dices"
    });
  }

  readonly seperatorRows = [0, 6, 7, 14];

  isSeperatorRow(rowIndex: number): boolean {
    return this.seperatorRows.includes(rowIndex);
  }

  readonly wideRows = [0, 7, 15];

  isWideRow(rowIndex: number): boolean {
    return this.wideRows.includes(rowIndex);
  }
}