const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const ranks = [1, 2, 3, 4, 5, 6, 7, 8];

const incrementPosition = (position, translationVector) => {
  const [oldX, oldY] = position;
  const [translateX, translateY] = translationVector;

  const x = String.fromCharCode(oldX.charCodeAt(0) + translateX);
  const y = +oldY + translateY;

  if (!files.includes(x) || !ranks.includes(y)) return null;

  const newPosition = `${x}${y}`;

  return newPosition;
};

module.exports = incrementPosition;
