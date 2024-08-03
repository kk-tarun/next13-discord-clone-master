// socket api backend 

import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { PrismaClient } from '@prisma/client';

import { NextApiResponseServerIo } from '@/types';

export const config = {
    api: {
      bodyParser: false,
    },
  };

const prisma = new PrismaClient();

const ioHandler = async (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');
    
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      // @ts-ignore
      addTrailingSlash: false,
    });


    io.on('connection', async (socket) => {
        console.log("Connection Successfull!\nSocket Id: ", socket.id);
        const userId = socket.handshake.query.userId as string | undefined;

        if (userId) {
            try {
                // Check if the user exists
                const user = await prisma.user.findUnique({ where: { id: userId } });

                if (user) {
                    // Update user status to online
                    await prisma.user.update({
                        where: { id: userId },
                        data: { isOnline: true },
                    });
                    console.log(`User ${userId} is now online.`);
                } else {
                    console.error(`User with ID ${userId} not found.`);
                    socket.emit('error', { message: 'User not found' });
                    socket.disconnect();
                }
            } catch (error) {
            console.error('Error updating user:', error);
                socket.emit('error', { message: 'An error occurred while updating user status' });
                socket.disconnect();
            }
        } else {
            console.error('UserId is undefined or invalid');
            socket.emit('error', { message: 'UserId is required' });
            socket.disconnect();
            return;
        }
  
        socket.on('disconnect', async () => {
          if (userId) {
            try {
              await prisma.user.update({
                where: { id: userId },
                data: { isOnline: false },
              });
              console.log('User disconnected', socket.id);
            } catch (error) {
              console.error('Error updating user:', error);
            }
          }
        });
  
        socket.on('request_random_user', async () => {
          const otherUsers = await prisma.user.findMany({
            where: {
              isOnline: true,
              id: { not: userId },
            },
          });
  
          if (otherUsers.length > 0) {
            const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
            socket.emit('random_user', randomUser.id);
          } else {
            socket.emit('no_users');
          }
        });
  
        socket.on('message', (message: { to: string; content: string; senderId: string }) => {
          const { to, content, senderId } = message;
          socket.to(to).emit('message', { content, senderId });
        });
  
        socket.on('call_user', (data: { to: string; from: string }) => {
          const { to, from } = data;
          socket.to(to).emit('incoming_call', { from });
        });
  
        socket.on('join_room', (roomId: string) => {
          socket.join(roomId);
        });
      });


    res.socket.server.io = io;
  }

  // @ts-ignore
  res.end();
};

export default ioHandler;
