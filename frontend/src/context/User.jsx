"use client";

import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const User = ({ children }) => {
  const [user, setUser] = useState(null);
  // {
  //   id: "",
  //   boardSide: "white",
  //   isPlaying: false,
  //   color: "",
  // }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default User;
