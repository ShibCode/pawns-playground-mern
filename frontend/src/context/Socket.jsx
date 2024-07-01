"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const Socket = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io("ws://localhost:8080/");

    socket.on("connect", () => {
      setSocket(socket);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default Socket;
