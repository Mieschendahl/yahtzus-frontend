export type ClientData = (
  | {
    kind: "join room";
    data?: undefined;
  }
);

export type ServerCb = (
  data: 
  | {
    kind: "join room";
    data?: undefined;
  }
) => void;

export type ClientToServerEvents = {
  send: (data: ClientData) => void,
  sendCb: (data: ClientData, cb: ServerCb) => void
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