import { useEffect, useRef, useState } from "react";

type BoardState = "IDLE" | "LOADING" | "ERROR";

const Board = () => {
  const [boardSize, setBoardSize] = useState({ width: 29, height: 29 });
  const [beadData, setBeadData] = useState([]);
  const [imageTerm, setImageTerm] = useState("");
  const [boardState, setBoardState] = useState<BoardState>("IDLE");
  const canvasRef = useRef(null);

  const renderBeadPattern = (data: any) => {
    setBeadData(data);
  };

  const generateSimplePattern = async (imageTerm: string) => {
    try {
      setBoardState("LOADING");
      const req = await fetch(`/api/board.json?imageTerm=${imageTerm}`);
      const board = await req.json();
      const newPattern = board;
      renderBeadPattern(newPattern);
      setBoardState("IDLE");
    } catch (err) {
      setBoardState("ERROR");
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fill the background with white
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate the size of each "bead" on the canvas
        const beadWidth = canvas.width / boardSize.width;
        const beadHeight = canvas.height / boardSize.height;

        // Draw the beads
        beadData.forEach((bead: any) => {
          ctx.fillStyle = bead.color;
          ctx.fillRect(
            Math.floor(bead.x * beadWidth),
            Math.floor(bead.y * beadHeight),
            Math.ceil(beadWidth),
            Math.ceil(beadHeight)
          );
        });

        // Draw grid
        drawGrid(ctx, canvas.width, canvas.height);
      }
    }
  }, [beadData, boardSize]);

  const drawGrid = (ctx: any, width: any, height: any) => {
    ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
    ctx.lineWidth = 1;

    const cellWidth = width / boardSize.width;
    const cellHeight = height / boardSize.height;

    // Draw vertical lines
    for (let x = 0; x <= boardSize.width; x++) {
      const xPos = Math.floor(x * cellWidth) + 0.5;
      ctx.beginPath();
      ctx.moveTo(xPos, 0);
      ctx.lineTo(xPos, height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= boardSize.height; y++) {
      const yPos = Math.floor(y * cellHeight) + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, yPos);
      ctx.lineTo(width, yPos);
      ctx.stroke();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-indigo-600">
        Perler Bead Pattern Maker
      </h1>

      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="border-4 border-indigo-300 rounded-lg shadow-lg"
      />
      <div className="mt-8 flex items-center">
        <label
          htmlFor="imageTerm"
          className="mr-4 text-lg font-semibold text-gray-700"
        >
          I want a picture of...
        </label>
        <input
          type="text"
          id="imageTerm"
          value={imageTerm}
          onChange={(e) => setImageTerm(e.target.value)}
          className="mr-4 p-2 border-2 border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={boardState === "LOADING"}
        />
      </div>
      <button
        onClick={() => generateSimplePattern(imageTerm)}
        className="mt-6 px-6 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-full hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={boardState === "LOADING"}
      >
        {boardState === "LOADING" ? "Loading..." : "Generate Pattern"}
      </button>
    </div>
  );
};

export default Board;
