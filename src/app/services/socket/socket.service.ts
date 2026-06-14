import { Service, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';

import {
    ClientData,
    ClientToServerEvents,
    DiceType,
    GameType,
    PlayerType,
    ServerData,
    ServerToClientEvents,
    StateType,
} from '../../shared/socket-types';

export type AppSocket = Socket<
    ServerToClientEvents,
    ClientToServerEvents
>;

@Service()
export class SocketService {
    readonly connected = signal(false);

    readonly state = signal<GameType | undefined>(undefined);
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

        this.connect();
    }

    connect(): void {
        if (!this.socket.connected) {
            this.socket.connect();
        }
    }

    disconnect(): void {
        this.socket.disconnect();
    }

    send(data: ClientData): void {
        this.socket.emit('send', data);
    }

    private handleServerData({ kind, data }: ServerData): void {
        if (kind === 'set game') {
            this.state.set(data.game);
        } else if (kind === 'set dice') {
            this.dice.set(data.dice);
        } else if (kind === 'set players') {
            this.players.set(data.players);
        } else if (kind === 'set field') {
            this.players.update(players => {
                if (!players) {
                    return players;
                }

                const player = players.find(
                    player => player.userId === data.userId
                );

                if (!player) {
                    return players;
                }

                const fieldIdx = player.fields.findIndex(
                    field => field.fieldId === data.field.fieldId
                );

                if (fieldIdx < 0) {
                    return players;
                }

                player.fields[fieldIdx] = data.field;

                return players;
            });
        }
    }
}