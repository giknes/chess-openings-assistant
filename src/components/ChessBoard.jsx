import { useState } from "react";
import { Chessboard } from "react-chessboard";
import OpeningSearchModal from './OpeningSearchModal';
import GameControls from './GameControls';
import GameStatus from './GameStatus';
import MoveHistory from "./MoveHistory";
import './ChessBoard.css';

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

  const getSquareClassName = (square) => {
      let className = '';
      if (selectedSquare === square) {
          className += 'selected ';  
      }
      if (possibleMoves.some(move => move.to === square)) {
          className += 'possible ';   
      }
      return className;
  };

  return (
    <div className="chess-app-container">
      {/* Модальное окно поиска (первое в DOM) */}
      <OpeningSearchModal
        isOpen={isSearchOpen}
        onClose={() => onToggleSearch(false)} // Используем prop
        onSelectOpening={onSelectOpening}
        onSelectVariation={onSelectVariation}
      />

      {/* Основная сетка */}
      <div className="main-grid">
        {/* Шахматная доска */}
        <div className="chessboard-area">
          <Chessboard
            position={game.fen()}
            boardOrientation={isFlipped ? 'black' : 'white'}
            onPieceDrop={onPieceDrop}
            onSquareClick={handleSquareClick}
            squareClassName={getSquareClassName}
            boardWidth={Math.min(600, window.innerWidth - 350)}
            customBoardStyle={{
              margin: '0 auto' /* Центрируем доску в своей области */
            }}
            customDarkSquareStyle={{ backgroundColor: "#b58863" }}
            customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
            
            animationDuration={0}
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
      </div>

      {/* Статус игры */}
      <GameStatus game={game} errorMessage={errorMessage} />

      {/* Кнопки режимов */}
      <GameControls
        mode={mode}
        onChangeMode={onChangeMode}
        resetGame={onReset}
        hasPgn={!!pgn}
        isGameLoaded={isGameLoaded}
      />

      {displayName && (
        <div className="opening-name-box">
          {displayName}
        </div>
      )}

      {/* История ходов */}
      {mode !== "practice" && moveHistory.length > 0 && (
        <MoveHistory
          moveHistory={moveHistory}
          currentMoveIndex={currentMoveIndex}
          goToMove={onMoveSelect}
        />
      )}
    </div>
  </Card>
</div>
      </div>
    </div>
  );
}