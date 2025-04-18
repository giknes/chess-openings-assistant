import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import './ChessBoard.css';

export default function ChessBoardComponent() {
  const [game, setGame] = useState(new Chess());

  function makeAMove(move) {
    try {
      const result = game.move(move);
      setGame(new Chess(game.fen())); // Обновляем состояние с новой позицией
      return result; // Возвращаем результат хода (null, если ход недействителен)
    } catch (error) {
      return null; // Ход недействителен
    }
  }

  function onDrop(sourceSquare, targetSquare, piece) {
    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece[1].toLowerCase() ?? "q"
    });

    // Если ход невозможен, возвращаем false для отмены перемещения на доске
    return move !== null;
  }

  // Функция для определения возможных ходов (подсветка клеток)
  function onSquareClick(square) {
    const moves = game.moves({ square, verbose: true });
    if (moves.length === 0) return;

    return moves.map(move => ({
      [move.to]: {
        background: game.get(move.to)?.color !== game.get(square).color
          ? "radial-gradient(circle, rgba(255,215,0,0.5) 25%, transparent 25%)"
          : "radial-gradient(circle, rgba(255,255,0,0.4) 25%, transparent 25%)",
        borderRadius: "50%"
      }
    }));
  }

  function resetGame() {
    setGame(new Chess());
  }

  return (
    <div className="chess-game-container">
      <div className="controls">
        <button className="reset-button" onClick={resetGame}>
          Новая игра
        </button>
        <div className="game-status">
          {game.isGameOver() ? (
            <strong>
              {game.isCheckmate()
                ? `Мат! Победа ${game.turn() === "w" ? "чёрных" : "белых"}`
                : game.isDraw() && "Ничья!"}
            </strong>
          ) : game.isCheck() ? (
            <strong>Шах!</strong>
          ) : (
            `Ход: ${game.turn() === "w" ? "белых" : "чёрных"}`
          )}
        </div>
      </div>
      
      <div className="chess-board">
        <Chessboard
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          boardWidth={400}
          customDarkSquareStyle={{ backgroundColor: "#b58863" }}
          customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
          customBoardStyle={{
            borderRadius: "4px",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.2)"
          }}
        />
      </div>
    </div>
  );
}