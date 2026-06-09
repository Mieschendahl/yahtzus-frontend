import { Service, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';

import {
    ClientToServerEvents,
    ServerToClientEvents,
} from '../../shared/socket-types';

export type AppSocket = Socket<
    ServerToClientEvents,
    ClientToServerEvents
>;

@Service()
export class SocketService {
    readonly connected = signal(false);

    readonly socket: AppSocket = io('http://localhost:4010', {
        path: '/api',
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
    });

    constructor() {
        console.log("starting connect")
        this.socket.on('connect', () => {
            this.connected.set(true);
        });

        this.socket.on('disconnect', () => {
            this.connected.set(false);
        });

        this.connect();
    }

    connect(): void {
        console.log("tryingt to connect")

        if (!this.socket.connected) {
            this.socket.connect();
        }
    }

    disconnect(): void {
        this.socket.disconnect();
    }
}