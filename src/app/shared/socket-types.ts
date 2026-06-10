export type ClientData = (
  | {
    kind: "join room";
    data?: {
      userId: string
    }
  }
  | {
    kind: "leave room";
    data?: undefined;
  }
);

export type ClientToServerEvents = {
  send: (data: ClientData) => void
};

export type ServerData = (
  | {
    kind: "set game";
    data: undefined;
  }
);

export type ServerToClientEvents = {
  send: (data: ServerData) => void;
};