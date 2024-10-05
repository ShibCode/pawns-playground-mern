import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSocket } from "../../../context/Socket";
import playSound from "../../../utils/playSound";
import { useUser } from "../../../context/User";

const MESSAGES = {
  win: "You Won!",
  lose: "You Lost!",
  draw: "Draw!",
};

const GameEndModal = () => {
  const [message, setMessage] = useState(null);

  const { user } = useUser();
  const socket = useSocket();

  useEffect(() => {
    socket.on("game-end", (winnerId) => {
      playSound("game-end");
      localStorage.removeItem("ongoing-game");

      setMessage(() => {
        if (!winnerId) return MESSAGES.draw;
        if (winnerId === user.id) return MESSAGES.win;
        if (winnerId !== user.id) return MESSAGES.lose;
      });
    });
  }, []);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ translate: "-50% -50%" }}
          className="absolute z-10 left-1/2 top-1/2 w-[400px] flex flex-col text-center rounded-md overflow-hidden shadow-xl"
        >
          <div
            className={`text-[32px] text-white font-bold py-3 ${
              message === MESSAGES.win ? "bg-[#86A84F]" : "bg-[#666463]"
            }`}
          >
            {message}
          </div>

          <div className="bg-white p-5 flex flex-col gap-6">
            <div className="flex flex-col">
              <span className="uppercase font-semibold text-[15px] text-[#989795]">
                Your Rating
              </span>
              <span className="font-bold text-3xl">1240</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button className="w-full h-[60px] bg-[#86A84F] text-xl font-bold rounded-lg text-white border-b-4 border-[#4A642C] col-span-2">
                Game Review
              </button>
              <Link
                to="/"
                className="w-full h-[60px] bg-[#D9D8D6] text-lg font-semibold rounded-lg text-[#61605f] border-b-4 border-[#989795] flex justify-center items-center"
              >
                Home
              </Link>
              <button className="w-full h-[60px] bg-[#D9D8D6] text-lg font-semibold rounded-lg text-[#61605f] border-b-4 border-[#989795]">
                New Game
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameEndModal;
