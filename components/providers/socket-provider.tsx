// socket io frontend

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SocketContextType = {
  socket: any | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const socketInstance = new (ClientIO as any)(
      process.env.NEXT_PUBLIC_SITE_URL!,
      {
        path: "/api/socket/io",
        addTrailingSlash: false,
        query: { userId: userId }
      },
    );

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Connection Successful!\n Socket Id: ", socketInstance.id);
      
      console.log("userId: ", userId);

      socketInstance.on("error", (message: string) => {
        console.error(message);
      });

      socketInstance.on("disconnect", () => {
        setIsConnected(false);
        console.log("User disconnected", socketInstance.id);
      });

      socketInstance.on("request_random_user", async () => {
        console.log("called request_random_user server");
        // Implement the logic to handle request_random_user
        const otherUsers = await prisma.user.findMany({
          where: {
            id: { not: userId },
            isOnline: true,
          },
        });

        if (otherUsers.length > 0) {
          const randomUser =
            otherUsers[Math.floor(Math.random() * otherUsers.length)];
          socketInstance.emit("random_user", randomUser.id);
        } else {
          socketInstance.emit("no_users");
        }
      });

      socketInstance.on(
        "message",
        (message: { to: string; content: string; senderId: string }) => {
          const { to, content, senderId } = message;
          socketInstance.to(to).emit("message", { content, senderId });
        }
      );

      socketInstance.on("call_user", (data: { to: string; from: string }) => {
        const { to, from } = data;
        socketInstance.to(to).emit("incoming_call", { from });
      });

      socketInstance.on("join_room", (roomId: string) => {
        socketInstance.join(roomId);
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
