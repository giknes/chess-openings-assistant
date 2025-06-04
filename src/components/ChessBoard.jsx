import { useState } from "react";
import { Chessboard } from "react-chessboard";
import OpeningSearchModal from './OpeningSearchModal';
import GameControls from './GameControls';
import GameStatus from './GameStatus';
import MoveHistory from "./MoveHistory";
import './ChessBoard.css';
import HelpModal from './HelpModal';

import { 
  Button,
  Card,
} from '@salutejs/plasma-ui';

export default function ChessBoardComponent({
  chessState,
  onPieceDrop,
  onMoveSelect,
  onChangeMode,
  onFlipBoard,
  onToggleSearch,
  onHelpOpen,
  onSelectOpening,
  onSelectVariation,
  onReset
}) {

  const {
      game,
      moveHistory,
      currentMoveIndex,
      mode,
      isFlipped,
      isSearchOpen,
      isGameLoaded,
      isHelpOpen,
      errorMessage,
      pgn
  } = chessState;

  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);

  const openingName = chessState.selectedOpening?.name || '';
  const variationName = chessState.selectedVariation?.name || '';

  const displayName = openingName
  ? variationName
    ? `${openingName} — ${variationName}`
    : openingName
  : '';

  const handleSquareClick = (square) => {
      if (selectedSquare === null) {
          if (game.get(square) && game.turn() === game.get(square).color) {
              const moves = game.moves({ square: square, verbose: true });
              setSelectedSquare(square);
              setPossibleMoves(moves);
          }
      } else {
          const move = possibleMoves.find((m) => m.to === square);
          if (move) {
              onPieceDrop(selectedSquare, square, move.piece); 
              setSelectedSquare(null);
              setPossibleMoves([]);
          } else {
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

  const customSquareStyles = {};
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = {
      background: 'rgba(255, 255, 0, 0.6)',
      boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
    };
  }
  possibleMoves.forEach(move => {
    customSquareStyles[move.to] = {
      background: 'rgba(0, 255, 0, 0.3)',
      boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.3)',
      cursor: 'pointer'
    };
  });

  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    onPieceDrop(sourceSquare, targetSquare, piece);
    setSelectedSquare(null);
    setPossibleMoves([]);
  };

  const maxBoardHeight = Math.min(window.innerHeight * 0.75, window.innerWidth * 0.85); // учитываем голосовую строку
  const boardWidth = Math.min(1400, maxBoardHeight);

  return (
    <div className="chess-app-container">
      {/* Модальное окно поиска (первое в DOM) */}
      <OpeningSearchModal
        isOpen={isSearchOpen}
        onClose={() => onToggleSearch(false)} // Используем prop
        onSelectOpening={onSelectOpening}
        onSelectVariation={onSelectVariation}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => onHelpOpen(false)}
      />

      {/* Основная сетка */}
      <div className="main-grid">
        {/* Шахматная доска */}
        <div className="chessboard-area">
          <Chessboard
            position={game.fen()}
            boardOrientation={isFlipped ? 'black' : 'white'}
            onPieceDrop={handlePieceDrop}
            onPieceDragBegin={(piece, sourceSquare) => {
              const moves = game.moves({ square: sourceSquare, verbose: true });
              setSelectedSquare(sourceSquare);
              setPossibleMoves(moves);
            }}
            onSquareClick={handleSquareClick}
            customSquareStyles={customSquareStyles}
            boardWidth={boardWidth}
            customBoardStyle={{
              margin: '0 auto' /* Центрируем доску в своей области */
            }}
            customDarkSquareStyle={{ backgroundColor: "	#eeeed2" }}
            customLightSquareStyle={{ backgroundColor: "#769656" }}
            
            animationDuration={0}
          />
        </div>

        {/* Правая панель (контролы + история) */}
        <div className="right-panel" style={{ height: boardWidth }}>
  <Card>
    <div className="card-content">
      {/* Кнопки управления */}
      <div className="controls-row">
        <Button 
          view="primary" 
          size="s" 
          onClick={() => onToggleSearch(true)}
          style={{ flex: 1 }}
        >
          Поиск дебюта
        </Button>
        <Button 
          view="secondary" 
          size="s" 
          onClick={onFlipBoard}
          style={{ flex: 1 }}
        >
          Смена ориентации
        </Button>
        <Button 
          view="secondary"
          size="s"
          onClick={() => onHelpOpen(true)}
          style={{ flex: 1 }}
        >
          Помощь
        </Button>
      </div>
      <GameStatus game={game} errorMessage={errorMessage} />

      <GameControls
        mode={mode}
        onChangeMode={onChangeMode}
        resetGame={onReset}
        hasPgn={!!pgn}
        isGameLoaded={isGameLoaded}
      />

      {displayName && <div className="opening-name">{displayName}</div>}

      <div className="move-history-wrapper">
        {mode !== "practice" && moveHistory.length > 0 && (
          <MoveHistory
            moveHistory={moveHistory}
            currentMoveIndex={currentMoveIndex}
            goToMove={onMoveSelect}
          />
        )}
      </div>
    </div>
  </Card>
</div>
      </div>
    </div>
  );
}