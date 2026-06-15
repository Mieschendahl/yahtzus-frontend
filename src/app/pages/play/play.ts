import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SocketService } from '../../services/socket/socket.service';
import { getEffectId, getField } from '../../shared/socket-types';
import { DiceComponent } from '../../components/dice/dice';
import { HeaderComponent } from './header/header';
import { COL_LAYOUT, EFFECT_HEADER_NAME, UPPER_HEADER_NAME as CONDITION_HEADER_NAME, EFFECT_DATA, transpose } from './utils';
import { prettyNone } from '../../lib/utils';

class CellUi {
  constructor(
    public text: string,
    public isPreview: boolean = false,
    public isCrossed: boolean = false,
    public canSelect: boolean = false,
    public onSelect: () => void = () => {}
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

  readonly basicCols = computed<CellUi[][]>(() => {
    const staticGame = this.staticGame();
    const cols: CellUi[][] = [];
    let cells = [new CellUi(prettyNone(CONDITION_HEADER_NAME))];
    COL_LAYOUT.forEach(({colName: fieldName}) => cells.push(new CellUi(fieldName)));
    cols.push(cells);

    if (!staticGame)
      return cols;

    cells = [new CellUi(prettyNone(EFFECT_HEADER_NAME))];
    COL_LAYOUT.forEach(({coldId}) => {
      const effectId = getEffectId(coldId, staticGame.effectIds);
      const effectName = EFFECT_DATA.get(effectId);
      cells.push(new CellUi(effectName ?? "", true, true));
    });
    cols.push(cells);
    return cols;
  });

  readonly basicRows = computed(() => transpose(this.basicCols()));

  readonly playerCols = computed<CellUi[][]>(() => {
    const staticGame = this.staticGame();
    const dynamicGame = this.dynamicGame();
    const players = this.players();
    const cols: CellUi[][] = [];

    if (!staticGame || !dynamicGame || !players)
      return cols;

    const userId = this.userId();
    const isActiveGame = dynamicGame.state === "playing";
    const isActivePlayer = isActiveGame && dynamicGame.activeUserId === userId;
    const activePlayerId = dynamicGame.activeUserId;

    players.forEach(({userId, fields}) => {
      let cells = [new CellUi(userId)];
      COL_LAYOUT.forEach(({coldId}) => {
        // console.log(coldId, colName);
        const field = getField(coldId, fields);
        if (field) {
          if (field.fieldValue !== undefined) {
            cells.push(new CellUi(prettyNone(coldId)));
          } else if (activePlayerId === userId) {
            // TODO: Calc preview
            const canSelect = isActivePlayer && dynamicGame.rollCount > 0;
            const onSelect = canSelect
              ? () => this.socketService.send({
                kind: "select field",
                data: {
                  fieldId: field.fieldId
                }
              })
              : () => {};
            cells.push(new CellUi(prettyNone(""), true, false, canSelect, onSelect));
          } else {
            cells.push(new CellUi(prettyNone("")));
          }
        } else if (isActiveGame) {
          // TODO: Calc derived
          cells.push(new CellUi("0"));
        } else {
          cells.push(new CellUi(prettyNone("")));
        }
      });
      cols.push(cells);
    });
    
    return cols;
    /*
    const userId = this.userId();
    const isActiveGame = game.state.kind === "playing";
    const isActivePlayer = isActiveGame && game.players[game.activePlayerId!].userId === userId;
    const activePlayer = !isActiveGame ? undefined : game.players[game.activePlayerId!];

    let fields: FieldUi[];
    if (activePlayer) {
      fields = activePlayer.fields.map(({fieldId, effect}) => {
        if (fieldId === "User ID")
          return new FieldUi("Effect");
        const {effectId, status} = effect;
        const isPreview = status === "locked";
        const canSelect = status === "unlocked" && isActivePlayer && game.rollCount! > 0;
        const onSelect = canSelect
            ? () => socket.emit("send", {
              kind: "select effect",
              data: {
                fieldId
              }
            })
            : () => {};
        return new FieldUi(effectId ?? "", isPreview, canSelect, onSelect);
      });
    } else {
      fields = FIELD_IDS.map(_ => new FieldUi(""));
    }
    cols.push(fields)

    for (const player of game.players) {
      cols.push(player.fields.map(({ fieldId, value, isPreview }) => {
        const canSelect = isPreview && isActivePlayer;
        const onSelect = canSelect
          ? () => socket.emit("send", {
            kind: "select field",
            data: {
              fieldId
            }
          })
          : () => {};
        return new FieldUi(value ?? "", isPreview, canSelect, onSelect);
      }));
    }
    return cols;
    */
  });

  readonly playerRows = computed(() => transpose(this.playerCols()));

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

  // openMenu(event: MouseEvent): void {
  //   this.menu().toggle(event);
  // }

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
}