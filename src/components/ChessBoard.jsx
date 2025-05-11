import { useState, useEffect } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import OpeningSearchModal from './OpeningSearchModal';
import GameControls from './GameControls';
import GameStatus from './GameStatus';
import MoveHistory from "./MoveHistory";
import SearchIcon from "./SearchIcon";
import './ChessBoard.css';

import { 
  Button,
  Card,
  TextBox,
  Cell,
} from '@salutejs/plasma-ui';

export default function ChessBoardComponent({ pgn = "", initialMode = "learn" }) {
  const [mode, setMode] = useState(initialMode);
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isGameLoaded, setIsGameLoaded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);

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

  const onSquareClick = (square) => {
    if (selectedSquare === null) {
      // No square selected, select a piece
      if (game.get(square) && game.turn() === game.get(square).color) {
        const moves = game.moves({ square: square, verbose: true });
        setSelectedSquare(square);
        setPossibleMoves(moves);
      }
    } else {
      // Square is selected, move the piece
      const move = possibleMoves.find((m) => m.to === square);
      if (move) {
        game.move(move.san); // Make the move
        setGame(new Chess(game.fen())); // Update the game state
        setSelectedSquare(null);
        setPossibleMoves([]);
      } else {
        // Clicked on an invalid square, deselect or select a different piece.
        if (game.get(square) && game.turn() === game.get(square).color) {
          const moves = game.moves({ square: square, verbose: true });
          setSelectedSquare(square);
          setPossibleMoves(moves);
        } else {
          setSelectedSquare(null);
          setPossibleMoves([]);
        }
      }
    }
  };

  const getSquareClassName = (square) => {
    let className = '';
    if (selectedSquare === square) {
        className += 'selected ';  // Add a space after the class
    }
    if (possibleMoves.some(move => move.to === square)) {
        className += 'possible ';   // Add a space after the class
    }
    return className;
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
            boardOrientation={isFlipped ? 'black' : 'white'}
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            squareClassName={getSquareClassName}
            boardWidth={Math.min(600, window.innerWidth - 350)}
            customBoardStyle={{
              margin: '0 auto' /* Центрируем доску в своей области */
            }}
            customDarkSquareStyle={{ backgroundColor: "#b58863" }}
            customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
          />
        </div>

        {/* Правая панель (контролы + история) */}
        <div className="right-panel">
  <Card style={{ 
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden'
  }}>
    <div className="card-content">
      {/* Первая строка: Поиск и ориентация */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Button 
          view="primary" 
          size="s" 
          onClick={() => setIsSearchOpen(true)}
          style={{ flex: 1 }}
        >
          Поиск дебюта
        </Button>
        <Button 
          view="secondary" 
          size="s" 
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ flex: 1 }}
        >
          Смена ориентации
        </Button>
      </div>

      {/* Статус игры */}
      <GameStatus game={game} errorMessage={errorMessage} />

      {/* Кнопки режимов */}
      <GameControls
        mode={mode}
        setMode={setMode}
        resetGame={resetGame}
        hasPgn={!!pgn}
        isGameLoaded={isGameLoaded}
      />

      {/* История ходов */}
      {mode !== "practice" && moveHistory.length > 0 && (
        <MoveHistory
          moveHistory={moveHistory}
          currentMoveIndex={currentMoveIndex}
          goToMove={goToMove}
        />
      )}
    </div>
  </Card>
</div>
      </div>
    </div>
  );
}