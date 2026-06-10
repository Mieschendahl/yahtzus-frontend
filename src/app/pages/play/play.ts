import { Component, DestroyRef, OnInit, computed, inject, signal, viewChild, ɵɵdeferHydrateOnViewport } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Menu, MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';

import { SocketService } from '../../services/socket/socket.service';
import { GameIO, ServerData } from '../../shared/socket-types';
import { sum } from '../../lib/utils';

const ROW_ID = [
  "userId",
  "ones",
  "twos",
  "threes",
  "fours",
  "fives",
  "sixes",
  "total"
] as const;

const ROW_NAMES = {
  userId: "",
  ones: "Ones",
  twos: "Twos",
  threes: "Threes",
  fours: "Fours",
  fives: "Fives",
  sixes: "Sixes",
  total: "Total"
} as const;

class Field {
  constructor(
    public text: string | number,
    public isPreview: boolean = false,
    public canSelect: boolean = false
  ) { }
}

@Component({
  selector: 'app-play',
  imports: [ButtonModule, DialogModule, MenuModule, ToastModule],
  providers: [MessageService],
  templateUrl: './play.html',
  styleUrl: './play.css',
})
export class Play implements OnInit {
  readonly showInfo = signal(false);
  readonly menu = viewChild.required<Menu>('menu');
  readonly userId = signal<string | undefined>(undefined);
  readonly game = signal<GameIO | undefined>(undefined);
  readonly cols = computed<Field[][]>(() => {
    const game = this.game();
    const cols = [];

    let fields: Field[] = [];
    for (const rowId of ROW_ID) {
      fields.push(new Field(ROW_NAMES[rowId]));
    }
    cols.push(fields);

    if (game === undefined) {
      return cols;
    }

    const userId = this.userId();
    const isActiveGame = game.state.kind === "playing";
    const isActivePlayer = isActiveGame && game.players[game.activePlayerId!].userId === userId;

    for (const player of game.players) {
      fields = [];
      for (const rowId of ROW_ID) {
        let field: Field | undefined = undefined;
        switch (rowId) {
          case "userId":
            field = new Field(player.userId);
            break;
          case "total":
            const total = isActiveGame
              ? sum(Object.keys(player.fields).map(key => player.fields[key]?.value ?? 0))
              : "";
            field = new Field(total);
            break;
          default:
            const {value, isPreview} = player.fields[rowId];
            field = new Field(value ?? "", isPreview, isPreview && isActivePlayer);
        }
        fields.push(field);
      }
      cols.push(fields);
    }

    return cols;
  });

  private readonly route = inject(ActivatedRoute);
  private readonly socketService = inject(SocketService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/',
    },
    {
      label: 'Info',
      icon: 'pi pi-info-circle',
      command: () => this.showInfo.set(true),
    },
  ];

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

  openMenu(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  async inviteFriend(): Promise<void> {
    const url = new URL(window.location.href);
    url.searchParams.delete('user');

    await navigator.clipboard.writeText(url.toString());

    this.messageService.add({
      severity: 'success',
      summary: 'Copied invite link',
    });
  }

  startGame(): void {
    // TODO
  }
}