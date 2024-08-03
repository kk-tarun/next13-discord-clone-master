"use client";

import { SVGProps, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SocketIndicator } from "@/components/socket-indicator";
import { useSocket } from "@/components/providers/socket-provider";

type Message = {
  id: number;
  to: string;
  senderId: string;
  content: string;
};

export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatPartner, setChatPartner] = useState(null);
  const router = useRouter();
  const socket = useSocket();

  useEffect(() => {
    console.log("Requesting random user");
    const userId = localStorage.getItem("userId");
    const socket = io({ path: "/api/socket/io", query: { userId: userId } });

    socket.emit("request_random_user");

    socket.on("random_user", (user) => {
      console.log("Random user found:", user);
      setChatPartner(user);
      socket.emit("join_room", user);
    });

    socket.on("no_users", () => {
      console.log("No users available");
      alert(
        "No users are available to chat right now. Please try again later."
      );
      router.push("/home-page");
    });

    socket.on("message", (message) => {
      console.log("New message received:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("random_user");
      socket.off("no_users");
      socket.off("message");
    };
  }, [router]);

  const sendMessage = (id: number) => {
    const userId = localStorage.getItem("userId");
    const socket = io({ path: "/api/socket/io", query: { userId: userId } });
  
    if (!chatPartner) {
      console.error("Chat partner is not defined");
      return;
    }
  
    const message: Message = {
      id: id,
      to: chatPartner,
      content: newMessage,
      senderId: userId,
    };
    console.log("Sending message:", message);
  
    socket.emit("message", message);
    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage("");
  };
  

  if (!chatPartner)
    return (
      <div>
        <SocketIndicator />
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center">
        <SocketIndicator />
        <Avatar className="w-8 h-8 border-2 border-primary-foreground">
          <AvatarImage src="/placeholder-user.jpg" />
          <AvatarFallback>CP</AvatarFallback>
        </Avatar>
        <div className="ml-3 font-medium">Chat Partner</div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-4 ${
                msg.senderId === localStorage.getItem("userId")
                  ? "justify-end"
                  : ""
              }`}
            >
              {msg.senderId !== localStorage.getItem("userId") && (
                <Avatar className="w-8 h-8 border-2 border-primary">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>CP</AvatarFallback>
                </Avatar>
              )}
              <div className="grid gap-1 text-sm">
                <div
                  className={`flex items-center gap-2 ${
                    msg.senderId === localStorage.getItem("userId")
                      ? "justify-end"
                      : ""
                  }`}
                >
                  <div className="font-medium">
                    {msg.senderId === localStorage.getItem("userId")
                      ? "You"
                      : "Chat Partner"}
                  </div>
                  <div className="text-muted-foreground">Just now</div>
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    msg.senderId === localStorage.getItem("userId")
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
              </div>
              {msg.senderId === localStorage.getItem("userId") && (
                <Avatar className="w-8 h-8 border-2 border-primary">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>YO</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-background border-t border-muted px-4 py-3">
        <div className="relative">
          <Textarea
            placeholder="Type your message..."
            name="message"
            id="message"
            rows={1}
            className="min-h-[48px] rounded-2xl resize-none p-4 border border-neutral-400 shadow-sm pr-16"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <Button
            type="button"
            size="icon"
            className="absolute w-8 h-8 top-3 right-3"
            onClick={sendMessage(Date.now())}
          >
            <ArrowUpIcon className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ArrowUpIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 7-7 7 7" />
      <path d="M12 19V5" />
    </svg>
  );
}

function XIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
