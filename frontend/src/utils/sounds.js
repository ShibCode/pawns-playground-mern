export const gameStartSound =
  typeof Audio !== "undefined"
    ? new Audio("/sounds/game-start.mp3")
    : undefined;
export const gameEndSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/game-end.mp3") : undefined;
export const captureSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/capture.mp3") : undefined;
export const moveSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/move.mp3") : undefined;
export const checkSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/check.mp3") : undefined;
export const castleSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/castle.mp3") : undefined;
export const promotionSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/promotion.mp3") : undefined;
