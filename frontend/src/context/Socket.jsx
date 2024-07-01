"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

const Socket = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io(
      "https://pawns-playground-mern-3jc1srguz-shibcodes-projects-b9c69217.vercel.app/"
    );

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
