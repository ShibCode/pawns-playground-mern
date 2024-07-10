const gameStartSound =
  typeof Audio !== "undefined"
    ? new Audio("/sounds/game-start.mp3")
    : undefined;
const gameEndSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/game-end.mp3") : undefined;
const captureSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/capture.mp3") : undefined;
const moveSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/move.mp3") : undefined;
const checkSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/check.mp3") : undefined;
const castleSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/castle.mp3") : undefined;
const promotionSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/promotion.mp3") : undefined;

const playSound = (sound) => {
  switch (sound) {
    case "game-start":
      gameStartSound.play();
      break;
    case "game-end":
      gameEndSound.play();
      break;
    case "check":
      checkSound.play();
      break;
    case "capture":
      captureSound.play();
      break;
    case "castle":
      castleSound.play();
      break;
    case "promotion":
      promotionSound.play();
      break;
    case "move":
      moveSound.play();
      break;
    default:
      break;
  }
};

export default playSound;
