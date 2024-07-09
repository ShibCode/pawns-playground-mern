import React, { useEffect, useRef } from "react";
import Clock from "../../../components/svg/Clock";
import convertToClockTime from "../../../utils/convertToClockTime";
import useClock from "../../../hooks/useClock";
import { useGame } from "../../../context/Game";
import { useUser } from "../../../context/User";
import { useSocket } from "../../../context/Socket";

const Player = ({ name, rating, flag, color, order }) => {
  const { game } = useGame();
  const { user } = useUser();
  const socket = useSocket();

  const { timeLeft } =
    game.player1.color === color ? game.player1 : game.player2;

  const [time, actions] = useClock(timeLeft / 1000);

  useEffect(() => {
    if (color === game.turn && game.moves.length > 0) actions.start();
    else actions.pause();
  }, [game.turn]);

  useEffect(() => {
    if (time === 0 && user.color === game.turn) socket.emit("timeout", game.id);
  }, [time]);

  return (
    <div style={{ order }} className={`flex gap-3 items-center`}>
      <img src="/imgs/default-pfp.svg" alt="pawn pfp" className="w-10" />

      <div>
        <h6 className="text-white flex gap-1.5 text-[16px] items-center leading-[1]">
          <span className="font-semibold">{name}</span>{" "}
          <span className="opacity-60">({rating})</span> <span>{flag}</span>
        </h6>
      </div>

      <div
        className={`self-stretch flex justify-between items-center rounded-[3px] text-[24px] font-semibold px-3 ml-auto w-[140px] leading-[1]  ${
          color === "white"
            ? "bg-white text-black"
            : "bg-[#262421] text-[#82817F]"
        } ${game.turn === color ? "opacity-100" : "opacity-60"}`}
      >
        {game.turn === color && <Clock className="size-6" />}
        <span className="ml-auto">{convertToClockTime(600, time)}</span>
      </div>
    </div>
  );
};

export default Player;
