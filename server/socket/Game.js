const getDefaultPieces = require("../utils/getDefaultPieces.js");
const {
  updatePosition,
  findCheck,
  updatePossibleMoves,
  adjustForChecks,
} = require("../utils/moveFunctions.js");

class Game {
  constructor(id, player1Id, player2Id) {
    const isWhite = Math.random() > 0.5;

    this.id = id;
    this.player1 = {
      id: player1Id,
      color: isWhite ? "white" : "black",
      canCastleKingSide: true,
      canCastleQueenSide: true,
    };
    this.player2 = {
      id: player2Id,
      color: isWhite ? "black" : "white",
      canCastleKingSide: true,
      canCastleQueenSide: true,
    };

    this.pieces = getDefaultPieces();
    this.moves = [];
    this.turn = "white";
  }

  move(io, pieceIndex, newPosition) {
    const white = this.player1.color === "white" ? this.player1 : this.player2;
    const black = this.player1.color === "black" ? this.player1 : this.player2;

    const castle = {
      white: {
        canCastleKingSide: white.canCastleKingSide,
        canCastleQueenSide: white.canCastleQueenSide,
      },
      black: {
        canCastleKingSide: black.canCastleKingSide,
        canCastleQueenSide: black.canCastleQueenSide,
      },
    };

    let { pieces, isCapture, movedBy, isKingSideCastle, isQueenSideCastle } =
      updatePosition(
        this.pieces,
        pieceIndex,
        newPosition,
        this.turn === "white" ? white : black
      );

    pieces = updatePossibleMoves(pieces, castle);
    const checkedTeam = findCheck(pieces);

    // disable castling if king is checked
    if (checkedTeam) {
      pieces = pieces.map((piece) => {
        const { position, possibleMoves } = piece;
        const { name, color } = piece.description;

        if (name !== "king" || color !== checkedTeam) return piece;
        if (position !== "e1" || position !== "e8") return piece;

        const newMoves = possibleMoves.filter((move) => {
          return !(
            move === "g1" ||
            move === "c1" ||
            move === "g8" ||
            move === "c8"
          );
        });

        return { ...piece, possibleMoves: newMoves };
      });
    }

    pieces = adjustForChecks(pieces, this.turn, castle);

    let sound = "move";
    if (checkedTeam) sound = "check";
    else if (isCapture) sound = "capture";

    const newTurn = this.turn === "white" ? "black" : "white";

    const hasNoMoves =
      pieces
        .filter((p) => p.description.color !== this.turn) // get opponent's moves pieces
        .flatMap((p) => p.possibleMoves).length === 0; // get all moves

    const isCheckmate = checkedTeam && hasNoMoves;

    const moveNotation = this.getMoveNotation(
      pieceIndex,
      newPosition,
      isKingSideCastle,
      isQueenSideCastle,
      checkedTeam,
      isCheckmate,
      isCapture
    ); // get the move notation eg Nf3+ or O-O or Qxe5#

    if (this.turn === "white")
      this.moves.push([moveNotation]); // add a new move if it's white's turn
    else this.moves[this.moves.length - 1].push(moveNotation); // add to an existing move if it's black's turn

    io.to(this.id).emit("move-response", pieces, this.moves, newTurn, sound);

    if (checkedTeam && hasNoMoves) {
      io.to(this.id).emit(
        "game-end",
        checkedTeam === "black" ? white.id : black.id
      );

      // removes all players from the game and deletes the game
      io.sockets.sockets.get(white.id).leave(this.id);
      io.sockets.sockets.get(black.id).leave(this.id);

      return false;
    }

    if (this.turn === this.player1.color) this.player1 = movedBy;
    else this.player2 = movedBy;

    this.pieces = pieces;
    this.turn = newTurn;
  }

  getMoveNotation(
    pieceIndex,
    newPosition,
    isKingSideCastle,
    isQueenSideCastle,
    isCheck,
    isCheckmate,
    isCapture
  ) {
    const { position: oldPos, description } = this.pieces.find(
      (_, i) => i === pieceIndex
    );
    const { symbol, name, color } = description;

    let moveNotation = `${symbol}${newPosition}`;

    if (isKingSideCastle) moveNotation = "O-O";
    else if (isQueenSideCastle) moveNotation = "O-O-O";
    else {
      // get other moves that are of the same name and same color but not this one
      const sharedBy = this.pieces
        .filter(
          (p, i) =>
            p.description.name === name &&
            p.description.color === color &&
            i !== pieceIndex
        )
        .find((p) => p.possibleMoves.includes(newPosition));

      let oldPosNotation = oldPos[0]; // default to the file of the old position if move is shared by similar piece eg Nce5

      if (name !== "pawn" && sharedBy) {
        if (oldPos[0] === sharedBy.position[0]) oldPosNotation = oldPos[1]; // if the file is the same, use the rank instead eg N4e5

        moveNotation = `${symbol}${oldPosNotation}${newPosition}`;
      }

      if (isCapture && name === "pawn") {
        moveNotation = `${oldPos[0]}x${newPosition}`;
      } else if (isCapture) {
        moveNotation = sharedBy
          ? `${symbol}${oldPosNotation}x${newPosition}`
          : `${symbol}x${newPosition}`;
      }
    }

    if (isCheckmate) moveNotation = moveNotation + "#";
    else if (isCheck) moveNotation = moveNotation + "+";
  }
}

module.exports = Game;
