const generateMoves = require("./generateMoves");

const getDefaultPieces = () => {
  const defaultPieces = [
    {
      description: {
        color: "black",
        name: "rook",
        symbol: "R",
      },
      src: "/pieces/br.png",
      position: "a8",
      defaultPosition: "a8",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "knight",
        symbol: "N",
      },
      src: "/pieces/bn.png",
      position: "b8",
      defaultPosition: "b8",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "bishop",
        symbol: "B",
      },
      src: "/pieces/bb.png",
      position: "c8",
      defaultPosition: "c8",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "queen",
        symbol: "Q",
      },
      src: "/pieces/bq.png",
      position: "d8",
      defaultPosition: "d8",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "king",
        symbol: "K",
      },
      src: "/pieces/bk.png",
      position: "e8",
      defaultPosition: "e8",
      possibleMoves: [],
      canCastleKingSide: true,
      canCastleQueenSide: true,
    },
    {
      description: {
        color: "black",
        name: "bishop",
        symbol: "B",
      },
      src: "/pieces/bb.png",
      position: "f8",
      defaultPosition: "f8",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "knight",
        symbol: "N",
      },
      src: "/pieces/bn.png",
      position: "g8",
      defaultPosition: "g8",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "rook",
        symbol: "R",
      },
      src: "/pieces/br.png",
      position: "h8",
      defaultPosition: "h8",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/bp.png",
      position: "a7",
      defaultPosition: "a7",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/bp.png",
      position: "b7",
      defaultPosition: "b7",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/bp.png",
      position: "c7",
      defaultPosition: "c7",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/bp.png",
      position: "d7",
      defaultPosition: "d7",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/bp.png",
      position: "e7",
      defaultPosition: "e7",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/bp.png",
      position: "f7",
      defaultPosition: "f7",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/bp.png",
      position: "g7",
      defaultPosition: "g7",
      possibleMoves: [],
    },
    {
      description: {
        color: "black",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/bp.png",
      position: "h7",
      defaultPosition: "h7",
      possibleMoves: [],
    },

    {
      description: {
        color: "white",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/wp.png",
      position: "a2",
      defaultPosition: "a2",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/wp.png",
      position: "b2",
      defaultPosition: "b2",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/wp.png",
      position: "c2",
      defaultPosition: "c2",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/wp.png",
      position: "d2",
      defaultPosition: "d2",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/wp.png",
      position: "e2",
      defaultPosition: "e2",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/wp.png",
      position: "f2",
      defaultPosition: "f2",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/wp.png",
      position: "g2",
      defaultPosition: "g2",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "pawn",
        symbol: "",
      },
      src: "/pieces/wp.png",
      position: "h2",
      defaultPosition: "h2",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "rook",
        symbol: "R",
      },
      src: "/pieces/wr.png",
      position: "a1",
      defaultPosition: "a1",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "knight",
        symbol: "N",
      },
      src: "/pieces/wn.png",
      position: "b1",
      defaultPosition: "b1",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "bishop",
        symbol: "B",
      },
      src: "/pieces/wb.png",
      position: "c1",
      defaultPosition: "c1",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "queen",
        symbol: "Q",
      },
      src: "/pieces/wq.png",
      position: "d1",
      defaultPosition: "d1",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "king",
        symbol: "K",
      },
      src: "/pieces/wk.png",
      position: "e1",
      defaultPosition: "e1",
      possibleMoves: [],
      canCastleKingSide: true,
      canCastleQueenSide: true,
    },
    {
      description: {
        color: "white",
        name: "bishop",
        symbol: "B",
      },
      src: "/pieces/wb.png",
      position: "f1",
      defaultPosition: "f1",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "knight",
        symbol: "N",
      },
      src: "/pieces/wn.png",
      position: "g1",
      defaultPosition: "g1",
      possibleMoves: [],
    },
    {
      description: {
        color: "white",
        name: "rook",
        symbol: "R",
      },
      src: "/pieces/wr.png",
      position: "h1",
      defaultPosition: "h1",
      possibleMoves: [],
    },
  ];

  return defaultPieces.map((piece) => {
    const { position, defaultPosition } = piece;
    const { color, name } = piece.description;

    const parameters = [defaultPieces, position, color, defaultPosition];
    const possibleMoves = generateMoves[name](...parameters); // e.g generateMoves[pawn](parameters)
    return { ...piece, possibleMoves };
  });
};

module.exports = getDefaultPieces;
