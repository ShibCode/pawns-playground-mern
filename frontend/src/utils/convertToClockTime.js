function convertToClockTime(maxTime, timeRemaining) {
  function formatTime(seconds) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let secs = seconds % 60;

    let hoursStr = hours > 0 ? hours + ":" : "";
    let minutesStr = hours > 0 && minutes < 10 ? "0" + minutes : minutes;
    let secsStr = secs < 10 ? "0" + secs : secs;

    if (hours > 0) {
      return hoursStr + minutesStr + ":" + secsStr;
    } else {
      return minutesStr + ":" + secsStr;
    }
  }

  let timeRemainingFormatted = formatTime(timeRemaining);

  return timeRemainingFormatted;
}

export default convertToClockTime;
