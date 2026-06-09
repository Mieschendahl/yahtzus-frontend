// src/app/lib/socket.ts
import { io, Socket } from 'socket.io-client';

import {
  ClientToServerEvents,
  ServerToClientEvents,
} from '../shared/socket-types';

const stage = 'local'; // or use Angular environment files

const config = {
  local: {
    origin: 'http://localhost:4010',
  },
  test: {
    origin: 'https://test.yahtzus.goolagoon.org',
  },
  prod: {
    origin: 'https://yahtzus.goolagoon.org',
  },
}[stage];

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const socket: AppSocket = io(config.origin, {
  path: '/api',
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});