const generateMoves = require("../utils/generateMoves.js");
const getDefaultPieces = require("../utils/getDefaultPieces.js");

// TODO: Refactor
// TODO: handle time hack
// TODO: check possibilities for hack when seeing move history
// TODO: fix transition bug

class GameModal {
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
    this.moveNotations = [];
    this.moveHistory = [];
    this.turn = "white";
    this.lastUpdatedAt = null;
    this.isEnded = false;
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
    if (this.lastUpdatedAt)
      playerWithTurn.timeLeft -= Date.now() - this.lastUpdatedAt;

    this.lastUpdatedAt = Date.now();

    const movedPieceBefore = { ...movedPiece };

    const isCapture = this.updatePosition(movedPiece, move, true);
    this.pieces = this.updatePossibleMoves();
    this.pieces = this.adjustForChecks();
    const checkedTeam = this.findCheck();

    // disable castling if king is checked
    if (checkedTeam) {
      const king = this.getPiece(checkedTeam === "white" ? "e1" : "e8");

      if (king.position[0] === "e")
        king.possibleMoves = king.possibleMoves.filter(
          (move) => move[0] !== "g" && move[0] !== "c"
        );
    }

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
      this.pieces
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

    if (this.turn === "white") this.moveNotations.push([moveNotation]);
    // add a new move if it's white's turn
    else this.moveNotations[this.moveNotations.length - 1].push(moveNotation); // add to an existing move if it's black's turn

    if (hasNoMoves) {
      const winnerId = checkedTeam
        ? player1.color === this.turn
          ? player1.id
          : player2.id
        : null;

      // winner id is null when there is a stalemate

      this.moveHistory.push([pieceIndex, move, sound]);
      this.turn = this.turn === "white" ? "black" : "white";
      this.isEnded = true;

      io.to(this.id).emit("move-response", this, sound);
      io.to(this.id).emit("game-end", winnerId);

      // removes all players from the game and deletes the game
      io.sockets.sockets.get(player1.id).leave(this.id);
      io.sockets.sockets.get(player2.id).leave(this.id);

      return true;
    }

    this.moveHistory.push([pieceIndex, move, sound]);
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

  updatePosition(movedPiece, move, isPlayerMove = null) {
    // isPlayerMove is a thing because the server is also moving pieces to filter out moves after this function is called - adjustForChecks()

    const { defaultPosition } = movedPiece;
    const { name, color } = movedPiece.description;

    // <Castling>
    if (name === "king" && isPlayerMove) {
      if (movedPiece.canCastleKingSide && move[0] === "g") {
        const rook = this.getPiece(color === "white" ? "h1" : "h8");
        rook.position = `f${rook.position[1]}`;
      } else if (movedPiece.canCastleQueenSide && move[0] === "c") {
        const rook = this.getPiece(color === "white" ? "a1" : "a8");
        rook.position = `d${rook.position[1]}`;
      }

      movedPiece.canCastleKingSide = false;
      movedPiece.canCastleQueenSide = false;
    } else if (name === "rook" && isPlayerMove) {
      const hisKing = this.getPiece(color === "white" ? "e1" : "e8");

      if (defaultPosition[0] === "a") hisKing.canCastleQueenSide = false;
      else if (defaultPosition[0] === "h") hisKing.canCastleKingSide = false;
    } // </Castling>

    // <Promotions>
    if (name === "pawn" && isPlayerMove && (move[1] == 8 || move[1] == 1)) {
      const description = { name: "queen", symbol: "Q", color };
      movedPiece.description = description;
      movedPiece.src = `/pieces/${color[0]}q.png`;
    } // </Promotions>

    movedPiece.position = move; // Update the position of the piece

    let isCapture = false;

    this.pieces = this.pieces.filter((piece) => {
      if (piece.position !== move || piece === movedPiece) return true;

      isCapture = true;
      return false;
    }); // remove captured piece if any

    return isCapture;
  }

  updatePossibleMoves(pieces = this.pieces) {
    const newPieces = pieces.map((piece) => {
      const { color, name } = piece.description;

      const parameters = [pieces, piece.position, color];
      if (name === "pawn") parameters.push(piece.defaultPosition);
      else if (name === "king") {
        parameters.push(piece.canCastleKingSide);
        parameters.push(piece.canCastleQueenSide);
      }

      const possibleMoves = generateMoves[name](...parameters); // e.g generateMoves[pawn](parameters)

      return { ...piece, possibleMoves };
    });

    return newPieces;
  }

  findCheck(
    pieces = this.pieces,
    specificTeam = false,
    move = null,
    piece = null
  ) {
    const kingPositions = {
      white: this.getPiece("e1", pieces).position,
      black: this.getPiece("e8", pieces).position,
    }; // getting kings position

    const allPossibleMovesForWhite = new Set(
      pieces
        .filter(({ description }) => description.color === "white")
        .flatMap((p) => p.possibleMoves)
    );

    const allPossibleMovesForBlack = new Set(
      pieces
        .filter(({ description }) => description.color === "black")
        .flatMap((p) => p.possibleMoves)
    );

    if (specificTeam === "white") {
      return allPossibleMovesForBlack.has(kingPositions[specificTeam]);
    } else if (specificTeam === "black") {
      return allPossibleMovesForWhite.has(kingPositions[specificTeam]);
    }

    if (allPossibleMovesForBlack.has(kingPositions.white)) return "white";
    else if (allPossibleMovesForWhite.has(kingPositions.black)) return "black";
    else return null;
  }

  adjustForChecks() {
    return this.pieces.map((piece, index) => {
      const { color, name } = piece.description;

      if (color === this.turn) return piece;

      let canCastleKingSide = piece.canCastleKingSide;
      let canCastleQueenSide = piece.canCastleQueenSide;

      let newPossibleMoves = piece.possibleMoves.filter((move) => {
        // imaginary movements of piece
        let newPieces = this.pieces.reduce((acc, piece, i) => {
          if (piece.position === move) return acc;
          if (index !== i) return [...acc, piece];

          return [...acc, { ...piece, position: move }];
        }, []);

        newPieces = this.updatePossibleMoves(newPieces);
        const getsChecked = this.findCheck(newPieces, color, move, piece); // finds if piece's king is now checked

        // disable castling if the tile through which the king passes ,when castling, is attacked
        if (name === "king" && getsChecked) {
          if (move[0] === "d") canCastleQueenSide = false;
          else if (move[0] === "f") canCastleKingSide = false;
        }

        return !getsChecked; // if piece's king gets check, discard the move
      });

      if (name === "king" && piece.position[0] === "e") {
        newPossibleMoves = newPossibleMoves.filter((move) => {
          if (move[0] === "g" && !canCastleKingSide) return false;
          else if (move[0] === "c" && !canCastleQueenSide) return false;
          return true;
        });
      }

      return { ...piece, possibleMoves: newPossibleMoves };
    });
  }

  getPiece(defaultPosition, fromPieces) {
    return (fromPieces ?? this.pieces).find(
      (piece) => defaultPosition === piece.defaultPosition
    );
  }
}

module.exports = GameModal;
