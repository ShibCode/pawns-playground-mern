const getDefaultPieces = require("../utils/getDefaultPieces.js");
const {
  updatePosition,
  findCheck,
  updatePossibleMoves,
  adjustForChecks,
} = require("../utils/moveFunctions.js");

// TODO: Ability for user to choose promotion
// TODO: allow user to go to previous positions to view
// TODO: Add En passant
// TODO: Refactor

class Game {
  constructor(id, player1Id, player2Id) {
    const isWhite = Math.random() > 0.5;

    this.id = id;
    this.player1 = {
      id: player1Id,
      color: isWhite ? "white" : "black",
      timeLeft: 10 * 60 * 1000,
    };
    this.player2 = {
      id: player2Id,
      color: isWhite ? "black" : "white",
      timeLeft: 10 * 60 * 1000,
    };

    this.pieces = getDefaultPieces();
    this.moves = [];
    this.turn = "white";
    this.lastUpdatedAt = null;
  }

  move(io, socket, pieceIndex, move) {
    const { player1, player2 } = this;

    const movedPiece = this.pieces.find((_, i) => i === pieceIndex);
    const playerWithTurn = player1.color === this.turn ? player1 : player2;

    if (playerWithTurn.id !== socket.id) return; // check if it's the player's turn
    if (!movedPiece.possibleMoves.includes(move)) {
      socket.emit("reverse-invalid-action", this);
      return;
    } // check if the move is valid

    // deducting the time left for the player who moved (except for first move of white)
    if (this.lastUpdatedAt) {
      playerWithTurn.timeLeft -= Date.now() - this.lastUpdatedAt;
      this.lastUpdatedAt = Date.now();
    }

    const movedPieceBefore = { ...movedPiece };

    let { pieces, isCapture } = updatePosition(
      this.pieces,
      movedPiece,
      move,
      true
    );

    pieces = updatePossibleMoves(pieces);
    const checkedTeam = findCheck(pieces);

    // disable castling if king is checked
    if (checkedTeam) {
      const king = pieces.find(
        ({ description }) =>
          description.name === "king" && description.color === checkedTeam
      );

      if (king.canCastleKingSide || king.canCastleQueenSide) {
        king.possibleMoves = king.possibleMoves.filter(
          (move) => move[0] !== "g" && move[0] !== "c"
        );
      }
    }

    pieces = adjustForChecks(pieces, this.turn);

    const isCastle =
      movedPiece.description.name === "king" &&
      movedPieceBefore.position[0] === "e" &&
      (move[0] === "g" || move[0] === "c");

    const isPromotion =
      movedPieceBefore.description.name === "pawn" &&
      movedPiece.description.name !== "pawn";

    let sound = "move";
    if (checkedTeam) sound = "check";
    else if (isCastle) sound = "castle";
    else if (isPromotion) sound = "promotion";
    else if (isCapture) sound = "capture";

    const hasNoMoves =
      pieces
        .filter((p) => p.description.color !== this.turn) // get opponent's moves
        .flatMap((p) => p.possibleMoves).length === 0; // check to see if opponent has moves or not

    const isCheckmate = checkedTeam && hasNoMoves;

    const moveNotation = this.getMoveNotation(
      movedPiece, // after update
      movedPieceBefore,
      pieceIndex,
      checkedTeam,
      isCheckmate,
      isCapture
    ); // get the move notation eg Nf3+ or O-O or Qxe5#

    if (this.turn === "white")
      this.moves.push([moveNotation]); // add a new move if it's white's turn
    else this.moves[this.moves.length - 1].push(moveNotation); // add to an existing move if it's black's turn

    if (hasNoMoves) {
      const winnerId = checkedTeam
        ? player1.color === this.turn
          ? player1.id
          : player2.id
        : null;

      // winner id is null when there is a stalemate

      io.to(this.id).emit("game-end", winnerId);

      // removes all players from the game and deletes the game
      io.sockets.sockets.get(player1.id).leave(this.id);
      io.sockets.sockets.get(player2.id).leave(this.id);

      return true;
    }

    this.pieces = pieces;
    this.turn = this.turn === "white" ? "black" : "white";

    io.to(this.id).emit("move-response", this, sound);

    return false;
  }

  getMoveNotation(
    movedPieceAfter,
    movedPieceBefore,
    index,
    isCheck,
    isCheckmate,
    isCapture
  ) {
    const oldPos = movedPieceBefore.position;
    const { symbol, name, color } = movedPieceBefore.description;

    const newPos = movedPieceAfter.position;

    let moveNotation = `${symbol}${newPos}`;

    const castleCondition = name === "king" && oldPos[0] === "e";

    if (castleCondition && newPos[0] === "g") moveNotation = "O-O";
    else if (castleCondition && newPos[0] === "c") moveNotation = "O-O-O";
    else {
      // find if the move could have been made by another piece of the same name and color eg two black knights can move to the same square so notation has to be more specific.
      const sharedBy = this.pieces
        .filter(
          (piece, i) =>
            piece.description.name === name &&
            piece.description.color === color &&
            i !== index
        )
        .find((p) => p.possibleMoves.includes(newPos));

      let oldPosNotation = oldPos[0]; // default to the file of the old position if move is shared by similar piece eg the c in Nce5

      if (name !== "pawn" && sharedBy) {
        if (oldPos[0] === sharedBy.position[0]) oldPosNotation = oldPos[1]; // if the file is the same, use the rank instead eg the 4 in N4e5

        moveNotation = `${symbol}${oldPosNotation}${newPos}`;
      }

      // handles capture notation
      if (isCapture && (sharedBy || name === "pawn")) {
        moveNotation = `${symbol}${oldPosNotation}x${newPos}`;
      } else if (isCapture) moveNotation = `${symbol}x${newPos}`;
    }

    // handles pawn promotion notation
    if (name === "pawn" && movedPieceAfter.description.name !== "pawn") {
      moveNotation += `=${movedPieceAfter.description.symbol}`; // eg e8=Q
    }

    // handles check and checkmate notation
    if (isCheckmate) moveNotation += "#";
    else if (isCheck) moveNotation += "+";

    return moveNotation;
  }
}

module.exports = Game;
