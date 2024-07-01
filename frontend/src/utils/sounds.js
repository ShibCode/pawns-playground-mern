export const captureSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/capture.mp3") : undefined;
export const moveSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/move.mp3") : undefined;
export const checkSound =
  typeof Audio !== "undefined" ? new Audio("/sounds/check.mp3") : undefined;
