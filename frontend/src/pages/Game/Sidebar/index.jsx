import React from "react";
import Moves from "./Moves";

const Sidebar = ({ seePastPosition, currentPosition }) => {
  return (
    <div className="flex flex-col w-[360px] bg-black bg-opacity-15 rounded-[4px] text-gray-300">
      <div className="flex">
        <button className="font-semibold border-b-[3px] h-16 w-full">
          Moves
        </button>
      </div>

      <Moves
        seePastPosition={seePastPosition}
        currentPosition={currentPosition}
      />
    </div>
  );
};

export default Sidebar;
