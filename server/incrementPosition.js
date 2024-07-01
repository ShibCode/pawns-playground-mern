const letterKeys = require("./letterKeys.json");

const incrementPosition = (position, translationVector) => {
  const [oldLetter, oldY] = position;
  const [translateX, translateY] = translationVector;

  const oldX = Object.values(letterKeys).indexOf(oldLetter) + 1; // converting letter into corresponding number
  const newX = oldX + translateX;
  const newY = +oldY + translateY;

  if (newX <= 0 || newX >= 9 || newY <= 0 || newY >= 9) return null;

  const newLetter = letterKeys[newX]; // convering number into corresponding letter

  const newPosition = `${newLetter}${newY}`;

  return newPosition;
};

module.exports = incrementPosition;
