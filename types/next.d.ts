import { Server as NetServer } from 'http';
import { Socket as NetSocket } from 'net';
import { Server as SocketIOServer } from 'socket.io';

declare module 'next' {
  interface NextApiResponse {
    socket: NetSocket & {
      server: NetServer & {
        io: SocketIOServer;
      };
    };
  }
}
