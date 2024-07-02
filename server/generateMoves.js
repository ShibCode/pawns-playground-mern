const incrementPosition = require("./incrementPosition");

const getOccupiedTiles = (pieces) => {
  return pieces.map((piece) => ({
    position: piece.position,
    color: piece.description.color,
  }));
};

const pawn = (pieces, position, color, defaultPosition) => {
  const possibleMoves = [];

  // if color is white, the num stays num but if it is black it changes to -num since black pawns wud move in the opposite direction :)
  const adjustForColor = (num) => (color === "white" ? num : -num);

  const Up1 = incrementPosition(position, [0, adjustForColor(1)]);
  const Up2 = incrementPosition(position, [0, adjustForColor(2)]);
  const Up1Left1 = incrementPosition(position, [-1, adjustForColor(1)]);
  const Up1Right1 = incrementPosition(position, [1, adjustForColor(1)]);

  const occupiedTiles = getOccupiedTiles(pieces);

  if (Up1 && !occupiedTiles.some((tile) => tile.position === Up1)) {
    possibleMoves.push(Up1);
  }

  if (
    defaultPosition === position &&
    !occupiedTiles.some((tile) => tile.position === Up2) &&
    !occupiedTiles.some((tile) => tile.position === Up1)
  ) {
    possibleMoves.push(Up2);
  }

  const Up1Left1Exists = occupiedTiles.find(
    (tile) => tile.position === Up1Left1
  );
  if (Up1Left1Exists && Up1Left1Exists?.color !== color) {
    possibleMoves.push(Up1Left1);
  }

  const Up1Right1Exists = occupiedTiles.find(
    (tile) => tile.position === Up1Right1
  );
  if (Up1Right1Exists && Up1Right1Exists?.color !== color) {
    possibleMoves.push(Up1Right1);
  }
  return possibleMoves;
};

const rook = (pieces, position, color) => {
  const possibleMoves = [];

  const occupiedTiles = getOccupiedTiles(pieces);

  const translationVectors = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  translationVectors.forEach((vector) => {
    let [x, y] = [0, 0];

    while (true) {
      const move = incrementPosition(position, [x + vector[0], y + vector[1]]);

      if (move === null) return;

      const movementHindered = occupiedTiles.find(
        (tile) => tile.position === move
      );

      if (!movementHindered) {
        possibleMoves.push(move);

        x += vector[0];
        y += vector[1];

        continue;
      }

      if (movementHindered.color !== color) possibleMoves.push(move);

      return;
    }
  });

  return possibleMoves;
};

const knight = (pieces, position, color) => {
  const occupiedTiles = getOccupiedTiles(pieces);

  const up2Left1 = incrementPosition(position, [-1, 2]);
  const up2Right1 = incrementPosition(position, [1, 2]);
  const left2Up1 = incrementPosition(position, [-2, 1]);
  const left2Down1 = incrementPosition(position, [-2, -1]);
  const own2Left1 = incrementPosition(position, [-1, -2]);
  const down2Right1 = incrementPosition(position, [1, -2]);
  const right2Up1 = incrementPosition(position, [2, 1]);
  const right2Down1 = incrementPosition(position, [2, -1]);

  const allMoves = [
    up2Left1,
    up2Right1,
    left2Up1,
    left2Down1,
    own2Left1,
    down2Right1,
    right2Up1,
    right2Down1,
  ];

  const rawPossibleMoves = allMoves.filter((move) => move);

  const possibleMoves = rawPossibleMoves.filter((move) => {
    const isOccupied = occupiedTiles.find((tile) => tile.position === move);
    return isOccupied?.color !== color;
  });

  return possibleMoves;
};

const bishop = (pieces, position, color) => {
  const possibleMoves = [];

  const occupiedTiles = getOccupiedTiles(pieces);

  const translationVectors = [
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, -1],
  ];

  translationVectors.forEach((vector) => {
    let [x, y] = [0, 0];

    while (true) {
      const move = incrementPosition(position, [x + vector[0], y + vector[1]]);

      if (move === null) return;

      const movementHindered = occupiedTiles.find(
        (tile) => tile.position === move
      );

      if (!movementHindered) {
        possibleMoves.push(move);

        x += vector[0];
        y += vector[1];

        continue;
      }

      if (movementHindered.color !== color) possibleMoves.push(move);

      return;
    }
  });

  return possibleMoves;
};

const queen = (pieces, position, color) => {
  const possibleMoves = [];

  const occupiedTiles = getOccupiedTiles(pieces);

  const translationVectors = [
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, -1],
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  translationVectors.forEach((vector) => {
    let [x, y] = [0, 0];

    while (true) {
      const move = incrementPosition(position, [x + vector[0], y + vector[1]]);

      if (move === null) return;

      const movementHindered = occupiedTiles.find(
        (tile) => tile.position === move
      );

      if (!movementHindered) {
        possibleMoves.push(move);

        x += vector[0];
        y += vector[1];

        continue;
      }

      if (movementHindered.color !== color) possibleMoves.push(move);

      return;
    }
  });

  return possibleMoves;
};

const king = (
  pieces,
  position,
  color,
  canCastleKingSide,
  canCastleQueenSide
) => {
  const occupiedTiles = getOccupiedTiles(pieces);

  const up1 = incrementPosition(position, [0, 1]);
  const right1 = incrementPosition(position, [1, 0]);
  const down1 = incrementPosition(position, [0, -1]);
  const left1 = incrementPosition(position, [-1, 0]);
  const up1Left1 = incrementPosition(position, [-1, 1]);
  const up1Right1 = incrementPosition(position, [1, 1]);
  const down1Left1 = incrementPosition(position, [-1, -1]);
  const down1Right1 = incrementPosition(position, [1, -1]);

  const kingSideCastle = incrementPosition(position, [2, 0]);
  const queenSideCastle = incrementPosition(position, [-2, 0]);

  const cantCastleKingSide = occupiedTiles.some((t) => t.position === right1);
  const cantCastleQueenSide = occupiedTiles.some((t) => t.position === left1);

  const allMoves = [
    up1,
    right1,
    down1,
    left1,
    up1Left1,
    up1Right1,
    down1Left1,
    down1Right1,
    canCastleKingSide && !cantCastleKingSide ? kingSideCastle : undefined,
    canCastleQueenSide && !cantCastleQueenSide ? queenSideCastle : undefined,
  ];

  const rawPossibleMoves = allMoves.filter((move) => move);

  const possibleMoves = rawPossibleMoves.filter((move) => {
    const isOccupied = occupiedTiles.find((tile) => tile.position === move);
    return isOccupied?.color !== color;
  });

  return possibleMoves;
};

const generateMoves = {
  pawn,
  rook,
  knight,
  bishop,
  queen,
  king,
};

module.exports = generateMoves;
