const getDefaultPieces = require("../utils/getDefaultPieces.js");
const {
  updatePosition,
  findCheck,
  updatePossibleMoves,
  adjustForChecks,
} = require("../utils/moveFunctions.js");

// TODO: FIX getMoveNotation(), Nf3 is returning Ngf3. Also add promotion!
// TODO: Add En passant
// TODO: Stalemate
//TODO: Sound effects for castle and promotion
//TODO: Ability for user to choose promotion
// TODO: Add time control

class Game {
  constructor(id, player1Id, player2Id) {
    const isWhite = Math.random() > 0.5;

    this.id = id;
    this.player1 = { id: player1Id, color: isWhite ? "white" : "black" };
    this.player2 = { id: player2Id, color: isWhite ? "black" : "white" };

    this.pieces = getDefaultPieces();
    this.moves = [];
    this.turn = "white";
  }

  move(io, socket, pieceIndex, move) {
    const { player1, player2 } = this;

    const movedPiece = this.pieces.find((_, i) => i === pieceIndex);
    const playerWithTurn = player1.color === this.turn ? player1 : player2;

    if (playerWithTurn.id !== socket.id) return; // check if it's the player's turn
    if (!movedPiece.possibleMoves.includes(move)) {
      socket.emit("reverse-invalid-move", this);
      return;
    } // check if the move is valid

    const movedPieceBeforeUpdate = { ...movedPiece };

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

    let sound = "move";
    if (checkedTeam) sound = "check";
    else if (isCapture) sound = "capture";

    const hasNoMoves =
      pieces
        .filter((p) => p.description.color !== this.turn) // get opponent's moves pieces
        .flatMap((p) => p.possibleMoves).length === 0; // get all moves

    const isCheckmate = checkedTeam && hasNoMoves;

    const moveNotation = this.getMoveNotation(
      movedPieceBeforeUpdate,
      move,
      checkedTeam,
      isCheckmate,
      isCapture
    ); // get the move notation eg Nf3+ or O-O or Qxe5#

    if (this.turn === "white")
      this.moves.push([moveNotation]); // add a new move if it's white's turn
    else this.moves[this.moves.length - 1].push(moveNotation); // add to an existing move if it's black's turn

    const newTurn = this.turn === "white" ? "black" : "white";

    io.to(this.id).emit("move-response", pieces, this.moves, newTurn, sound);

    if (checkedTeam && hasNoMoves) {
      const winnerId = player1.color === turn ? player1.id : player2.id;
      io.to(this.id).emit("game-end", winnerId);

      // removes all players from the game and deletes the game
      io.sockets.sockets.get(player1.id).leave(this.id);
      io.sockets.sockets.get(player2.id).leave(this.id);

      return true;
    }

    this.pieces = pieces;
    this.turn = newTurn;

    return false;
  }

  getMoveNotation(movedPiece, newPos, isCheck, isCheckmate, isCapture) {
    // movedPiece is before update

    const oldPos = movedPiece.position;
    const { symbol, name, color } = movedPiece.description;

    let moveNotation = `${symbol}${newPos}`;

    const castleCondition = name === "king" && oldPos[0] === "e";

    if (castleCondition && newPos[0] === "g") moveNotation = "O-O";
    else if (castleCondition && newPos[0] === "c") moveNotation = "O-O-O";
    else {
      // get other moves that are of the same name and same color but not this one
      const sharedBy = this.pieces
        .filter(
          (piece) =>
            piece.description.name === name && // same type of piece eg knight
            piece.description.color === color && // same color
            piece !== movedPiece // howerver, not the moved piece
        )
        .find((p) => p.possibleMoves.includes(newPos));

      let oldPosNotation = oldPos[0]; // default to the file of the old position if move is shared by similar piece eg Nce5

      if (name !== "pawn" && sharedBy) {
        if (oldPos[0] === sharedBy.position[0]) oldPosNotation = oldPos[1]; // if the file is the same, use the rank instead eg N4e5

        moveNotation = `${symbol}${oldPosNotation}${newPos}`;
      }

      if (isCapture && name === "pawn") {
        moveNotation = `${oldPos[0]}x${newPos}`;
      } else if (isCapture) {
        moveNotation = sharedBy
          ? `${symbol}${oldPosNotation}x${newPos}`
          : `${symbol}x${newPos}`;
      }
    }

    if (isCheckmate) moveNotation = moveNotation + "#";
    else if (isCheck) moveNotation = moveNotation + "+";

    return moveNotation;
  }
}

module.exports = Game;
