"use client";

import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const User = ({ children }) => {
  const [user, setUser] = useState({
    id: "",
    color: "",
    boardSide: "white",
    isPlaying: false,
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default User;
