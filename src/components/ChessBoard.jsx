import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import OpeningSearchModal from './OpeningSearchModal';
import MoveNavigator from './MoveNavigator';
import GameControls from './GameControls';
import GameStatus from './GameStatus';
import GameHistory from "./GameHistory";
import SearchIcon from "./SearchIcon";
import './ChessBoard.css';

export default function ChessBoardComponent({ pgn = "", initialMode = "learn" }) {
  const [mode, setMode] = useState(initialMode);
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGameLoaded, setIsGameLoaded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Загрузка PGN при изменении пропса
  useEffect(() => {
    if (pgn && mode !== "free") {
      loadPgnGame();
    } else if (mode === "free") {
      resetGame();
    }
  }, [pgn, mode]);

  const loadPgnGame = () => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      setGame(new Chess()); // Начальная позиция
      setMoveHistory(chess.history());
      setCurrentMoveIndex(-1);
      setIsGameLoaded(true);
      setErrorMessage("");
    } catch (e) {
      setErrorMessage("Неверный формат PGN");
      setIsGameLoaded(false);
    }
  };

  const goToMove = (index) => {
    try {
      if (index < currentMoveIndex) {
        const chess = new Chess();
        const movesToApply = moveHistory.slice(0, index + 1);
        movesToApply.forEach(move => chess.move(move));
        setGame(chess);
      } else if (index > currentMoveIndex) {
        const chess = new Chess(game.fen());
        const movesToApply = moveHistory.slice(currentMoveIndex + 1, index + 1);
        movesToApply.forEach(move => chess.move(move));
        setGame(chess);
      }
      setCurrentMoveIndex(index);
      setErrorMessage("");
    } catch (e) {
      setErrorMessage("Ошибка при переходе к ходу");
    }
  };

  const makePlayerMove = (move) => {
    const correctMove = moveHistory[currentMoveIndex + 1];
    
    if (move.san === correctMove) {
      const chess = new Chess(game.fen());
      chess.move(move);
      setGame(chess);
      setCurrentMoveIndex(currentMoveIndex + 1);
      setErrorMessage("");
      return true;
    } else {
      setErrorMessage(`Ошибка! Правильный ход: ${correctMove}`);
      return false;
    }
  };

  const onDrop = (sourceSquare, targetSquare, piece) => {
    if (mode === "learn") return false;

    try {
      const move = {
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() || "q"
      };

      const chess = new Chess(game.fen());
      const result = chess.move(move);
      
      if (mode === "practice") {
        return makePlayerMove(result);
      }

      if (mode === "free") {
        setGame(chess);
        setMoveHistory([...moveHistory, result.san]);
        setCurrentMoveIndex(currentMoveIndex + 1);
      }
      
      return true;
    } catch {
      return false;
    }
  };

  const resetGame = () => {
    if (pgn && mode !== "free") {
      loadPgnGame();
    } else {
      setGame(new Chess());
      setMoveHistory([]);
      setCurrentMoveIndex(-1);
      setIsGameLoaded(true);
      setErrorMessage("");
    }
  };

  const handleOpeningSelect = async (opening) => {
    try {
      const response = await fetch(`/api/openings/${opening.id}`);
      const { pgn } = await response.json();
      
      const chess = new Chess();
      chess.loadPgn(pgn);
      setGame(new Chess()); // Начальная позиция
      setMoveHistory(chess.history());
      setCurrentMoveIndex(-1);
      setIsGameLoaded(true);
      setErrorMessage("");
      setIsSearchOpen(false);
    } catch (error) {
      setErrorMessage("Ошибка загрузки дебюта");
    }
  };

  return (
    <div className="chess-app-container">
      {/* Модальное окно поиска (первое в DOM) */}
      <OpeningSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectOpening={handleOpeningSelect}
      />

      {/* Основная сетка */}
      <div className="main-grid">
        {/* Шахматная доска */}
        <div className="chessboard-area">
          <Chessboard
            position={game.fen()}
            onPieceDrop={onDrop}
            boardWidth={Math.min(600, window.innerWidth - 350)}
            customDarkSquareStyle={{ backgroundColor: "#b58863" }}
            customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
          />
        </div>

        {/* Правая панель (контролы + история) */}
        <div className="right-panel">
          {/* Кнопка поиска и статус */}
          <div className="controls-group">
            <button 
              className="search-button"
              onClick={() => setIsSearchOpen(true)}
            >
              <SearchIcon /> Поиск дебюта
            </button>
            <GameStatus game={game} errorMessage={errorMessage} />
          </div>

          {/* Контролы режимов */}
          <GameControls
            mode={mode}
            setMode={setMode}
            resetGame={resetGame}
            hasPgn={!!pgn}
            isGameLoaded={isGameLoaded}
          />

          {/* История ходов */}
          {mode !== "practice" && moveHistory.length > 0 && (
            <div className="history-section">
              <h3>История ходов</h3>
              <div className="moves-list">
                {moveHistory.map((move, index) => (
                  <div
                    key={index}
                    className={`move ${index === currentMoveIndex ? 'active' : ''}`}
                    onClick={() => goToMove(index)}
                  >
                    {index % 2 === 0 ? `${Math.floor(index/2) + 1}.` : ''} {move}
                  </div>
                ))}
              </div>
              <div className="move-buttons">
                <button 
                  onClick={() => goToMove(currentMoveIndex - 1)}
                  disabled={currentMoveIndex < 0}
                >
                  ← Назад
                </button>
                <button
                  onClick={() => goToMove(currentMoveIndex + 1)}
                  disabled={currentMoveIndex >= moveHistory.length - 1}
                >
                  Вперед →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}