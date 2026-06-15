import { Service, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';

import {
    ClientData,
    ClientToServerEvents,
    DiceType,
    DynamicGameType,
    PlayerType,
    ServerData,
    ServerToClientEvents,
    StaticGameType
} from '../../shared/socket-types';

export type AppSocket = Socket<
    ServerToClientEvents,
    ClientToServerEvents
>;

@Service()
export class SocketService {
    readonly connected = signal(false);

    readonly staticGame = signal<StaticGameType | undefined>(undefined);
    readonly dynamicGame = signal<DynamicGameType | undefined>(undefined);
    readonly dice = signal<DiceType[] | undefined>(undefined);
    readonly players = signal<PlayerType[] | undefined>(undefined);

    readonly socket: AppSocket = io('http://localhost:4010', {
        path: '/api',
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
    });

    constructor() {
        this.socket.on('connect', () => {
            this.connected.set(true);
        });

        this.socket.on('disconnect', () => {
            this.connected.set(false);
        });

        this.socket.on('send', data => {
            this.handleServerData(data);
        });

        this.socket.connect();
    }

    send(data: ClientData): void {
        this.socket.emit('send', data);
    }

    private handleServerData({ kind, data }: ServerData): void {
        // console.log("server data", kind, data)
        if (kind === 'set static game') {
            this.staticGame.set(data.game);
        } else if (kind === 'set dynamic game') {
            this.dynamicGame.set(data.game);
        } else if (kind === 'set dice') {
            this.dice.set(data.dice);
        } else if (kind === 'set players') {
            this.players.set(data.players);
        } else if (kind === 'set field') {
            // console.log("players", this.players);
            this.players.update(players => {
                if (!players) return players;

                return players.map(player => {
                    if (player.userId !== data.userId) return player;

                    return {
                    ...player,
                    fields: player.fields.map(field =>
                        field.fieldId === data.field.fieldId ? data.field : field
                    ),
                    };
                });
            });
        }
    }
}