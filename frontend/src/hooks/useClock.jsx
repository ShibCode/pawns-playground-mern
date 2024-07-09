import { useState, useRef, useEffect } from "react";

export default function useClock(maxTime) {
  const [time, setTime] = useState(maxTime * 1000);

  const id = useRef();

  const updateTime = (currentTime, refTime) => {
    const newTime = (time - (currentTime - refTime)).toFixed(0);

    if (+newTime > 0) {
      setTime(+newTime);
      id.current = requestAnimationFrame((ct) => updateTime(ct, refTime));
    } else setTime(0);
  };

  const start = () => {
    if (id.current) return;

    const refTime = performance.now();
    requestAnimationFrame((ct) => updateTime(ct, refTime));
  };
  const pause = () => {
    cancelAnimationFrame(id.current);
    id.current = null;
  };

  const actions = { start, pause };

  return [Math.ceil(time / 1000), actions];
}
