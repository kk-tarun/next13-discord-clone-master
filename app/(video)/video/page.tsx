"use client";

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useRouter } from 'next/navigation';

const socket = io({ path: '/api/socket/io' });
export default function Page() {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callIncoming, setCallIncoming] = useState(false);
  const [caller, setCaller] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log("Requesting random user for video call");
    socket.emit('request_random_user');

    socket.on('random_user', (user) => {
      console.log("Random user found for call:", user);
      setCaller(user);
      socket.emit('call_user', { to: user, from: localStorage.getItem('userId') });
    });

    socket.on('no_users', () => {
      console.log("No users available for video call");
      alert('No users are available to call right now. Please try again later.');
      router.push('/');
    });

    socket.on('incoming_call', (data) => {
      console.log("Incoming call from:", data.from);
      setCallIncoming(true);
      setCaller(data.from);
    });

    return () => {
      socket.off('random_user');
      socket.off('no_users');
      socket.off('incoming_call');
    };
  }, [router]);

  const acceptCall = () => {
    console.log("Call accepted");
    setCallAccepted(true);
    setCallIncoming(false);
  };

  if (callIncoming) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl">Incoming Call</h1>
          <button onClick={acceptCall} className="bg-green-500 text-white px-4 py-2 rounded-md mt-4">Accept</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      {callAccepted ? (
        <div>
          <h1 className="text-2xl">In Call</h1>
          {/* Implement video call UI here */}
        </div>
      ) : (
        <div>
          <h1 className="text-2xl">Calling...</h1>
        </div>
      )}
    </div>
  );
}
