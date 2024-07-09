const convertToClockTime = (maxTime, timeRemaining) => {
  let hours = Math.floor(timeRemaining / 3600);
  let minutes = Math.floor((timeRemaining % 3600) / 60);
  let seconds = timeRemaining % 60;

  let maxHours = Math.floor(maxTime / 3600);
  let maxMinutes = Math.floor((maxTime % 3600) / 60);

  if (maxHours > 0) {
    hours = hours.toString();
    minutes = minutes.toString().padStart(2, "0");
    seconds = seconds.toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  } else if (maxMinutes > 0) {
    minutes = Math.floor(timeRemaining / 60).toString();
    seconds = (timeRemaining % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  } else {
    seconds = timeRemaining.toString();
    return `0:${seconds.padStart(2, "0")}`;
  }
};

export default convertToClockTime;
