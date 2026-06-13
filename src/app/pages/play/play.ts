import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SocketService } from '../../services/socket/socket.service';
import { DiceIO, FIELD_IDS, GameIO, ServerData } from '../../shared/socket-types';
import { DiceComponent } from '../../components/dice/dice';
import { HeaderComponent } from './header/header';

class Field {
  constructor(
    public text: string,
    public isPreview: boolean = false,
    public canSelect: boolean = false,
    public onSelect: () => void = () => {}
  ) { }
}

export class Dice {
  constructor(
    public num: number = 1,
    public selected: boolean = true
  ) { }

  static fromIO({ num, selected }: DiceIO): Dice {
    return new Dice(num, selected);
  }
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
  private readonly destroyRef = inject(DestroyRef);

  readonly showInfo = signal(false);
  readonly userId = signal<string | undefined>(undefined);
  readonly game = signal<GameIO | undefined>(undefined);

  readonly dices = computed<Dice[]>(() => {
    // console.log("got game")
    const game = this.game();
    let dices: Dice[] = [];
    if (!game) {
      dices = Array.from({ length: 5 }, () => new Dice());
    } else {
      dices = game.dices.map(dice => Dice.fromIO(dice));
    }
    return dices;
  });

  readonly isActivePlayer = computed(() => {
    const game = this.game();
    if (!game)
      return false;
    const userId = this.userId();
    const isActiveGame = game.state.kind === "playing";
    return isActiveGame && game.players[game.activePlayerId!].userId === userId;
  });

  readonly cols = computed<Field[][]>(() => {
    const socket = this.socketService.socket;
    const game = this.game();
    const cols: Field[][] = [];
    cols.push(FIELD_IDS.map(fieldId => new Field(fieldId, false, false)));

    if (!game)
      return cols;

    const userId = this.userId();
    const isActiveGame = game.state.kind === "playing";
    const isActivePlayer = isActiveGame && game.players[game.activePlayerId!].userId === userId;
    const activePlayer = !isActiveGame ? undefined : game.players[game.activePlayerId!];

    let fields: Field[];
    if (activePlayer) {
      fields = activePlayer.fields.map(({fieldId, effect}) => {
        if (fieldId === "User ID")
          return new Field("Effect");
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
        return new Field(effectId ?? "", isPreview, canSelect, onSelect);
      });
    } else {
      fields = FIELD_IDS.map(_ => new Field(""));
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
        return new Field(value ?? "", isPreview, canSelect, onSelect);
      }));
    }
    return cols;
  });

  readonly rows = computed(() => {
    const cols = this.cols();
    if (!cols.length) return [];

    return cols[0].map((_, rowIndex) =>
      cols.map(col => col[rowIndex])
    );
  });

  selectDices(index: number) {
    const dices = this.dices();
    const socket = this.socketService.socket;
    socket.emit("send", {
      kind: "select dices",
      data: {
        selected: dices.map((dice, index_) => index === index_ ? !dice.selected : dice.selected)
      }
    })
  }

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParamMap.get('user')?.trim();
    this.userId.set(userId);

    const socket = this.socketService.socket;

    const handleData = ({ kind, data }: ServerData) => {
      switch (kind) {
        case "set game":
          const { game } = data;
          this.game.set(game);
          break;
      }
    };

    socket.on("send", handleData);

    socket.emit("send", {
      kind: "join room",
      data: {
        userId: userId
      }
    });

    this.destroyRef.onDestroy(() => {
      socket.off("send", handleData);
    });
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