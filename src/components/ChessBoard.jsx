import React, { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Button, Card } from '@salutejs/plasma-ui';
import { useSection, SECTION_ITEM_CLASS_NAME, setDefaultSectionByName } from '@salutejs/spatial';
import OpeningSearchModal from './OpeningSearchModal';
import HelpModal from './HelpModal';
import GameStatus from './GameStatus';
import GameControls from './GameControls';
import MoveHistory from "./MoveHistory";
import './ChessBoard.css';

const ChessBoardComponent = ({
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
}) => {
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
    pgn,
    selectedOpening,
    selectedVariation
  } = chessState;

  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [focusedSquare, setFocusedSquare] = useState(null);
  const [activeSection, setActiveSection] = useState('panel');

  // Создаем DOM-элементы для секций
  const panelElement = useRef(document.createElement('div'));
  const boardElement = useRef(document.createElement('div'));
  const panelContainerRef = useRef(null);
  const boardContainerRef = useRef(null);

  // Инициализация элементов
  useEffect(() => {
    panelElement.current.id = 'panel';
    boardElement.current.id = 'chessboard';

    if (panelContainerRef.current) {
      panelContainerRef.current.appendChild(panelElement.current);
    }
    if (boardContainerRef.current) {
      boardContainerRef.current.appendChild(boardElement.current);
    }

    return () => {
      if (panelElement.current.parentNode) {
        panelElement.current.parentNode.removeChild(panelElement.current);
      }
      if (boardElement.current.parentNode) {
        boardElement.current.parentNode.removeChild(boardElement.current);
      }
    };
  }, []);

  // Регистрация секции панели управления
  useSection('panel', {
    getRootElement: () => document.getElementById('panel'),
    onNavigate: (direction) => {
      if (direction === 'down') {
        setActiveSection('chessboard');
        setFocusedSquare('e4');
        return true;
      }
      return false;
    }
  });

  // Регистрация секции шахматной доски
  useSection('chessboard', {
    getRootElement: () => document.getElementById('chessboard'),
    onNavigate: (direction) => {
      if (!focusedSquare) {
        setFocusedSquare('e4');
        return true;
      }

      const [file, rank] = focusedSquare.split('');
      let newFile = file;
      let newRank = rank;

      switch(direction) {
        case 'up': 
          newRank = Math.min(8, parseInt(rank) + 1).toString();
          break;
        case 'down': 
          newRank = Math.max(1, parseInt(rank) - 1).toString();
          if (newRank === '1') {
            setActiveSection('panel');
            return true;
          }
          break;
        case 'left': 
          newFile = String.fromCharCode(Math.max(97, file.charCodeAt(0) - 1));
          break;
        case 'right': 
          newFile = String.fromCharCode(Math.min(104, file.charCodeAt(0) + 1));
          break;
      }

      setFocusedSquare(newFile + newRank);
      return true;
    },
    onItemActivate: () => {
      if (focusedSquare) {
        handleSquareClick(focusedSquare);
      }
    }
  });

  // Инициализация навигации
  useEffect(() => {
    setDefaultSectionByName('panel');
  }, []);

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

  const handlePieceDrop = (sourceSquare, targetSquare, piece) => {
    onPieceDrop(sourceSquare, targetSquare, piece);
    setSelectedSquare(null);
    setPossibleMoves([]);
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

  const customSquareProps = (square) => ({
    tabIndex: -1,
    className: `${SECTION_ITEM_CLASS_NAME} ${
      square === focusedSquare && activeSection === 'chessboard' ? 'focused-square' : ''
    }`,
  });

  const maxBoardHeight = Math.min(window.innerHeight * 0.75, window.innerWidth * 0.85);
  const boardWidth = Math.min(1400, maxBoardHeight);

  const openingName = selectedOpening?.name || '';
  const variationName = selectedVariation?.name || '';

  const displayName = openingName
    ? variationName
      ? `${openingName} — ${variationName}`
      : openingName
    : '';

  return (
    <div className="chess-app-container">
      <OpeningSearchModal
        isOpen={isSearchOpen}
        onClose={() => onToggleSearch(false)}
        onSelectOpening={onSelectOpening}
        onSelectVariation={onSelectVariation}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => onHelpOpen(false)}
      />

      <div className="main-grid">
        <div 
          ref={boardContainerRef}
          className="chessboard-area"
          id="chessboard-container"
        >
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
            customBoardStyle={{ margin: '0 auto' }}
            customDarkSquareStyle={{ backgroundColor: "#eeeed2" }}
            customLightSquareStyle={{ backgroundColor: "#769656" }}
            animationDuration={0}
            customSquareProps={customSquareProps}
          />
        </div>

        <div 
          ref={panelContainerRef}
          className="right-panel"
          id="panel-container"
          style={{ height: boardWidth }}
        >
          <Card>
            <div className="card-content">
              <div className="controls-row">
                <Button
                  view="primary"
                  size="s"
                  tabIndex={0}
                  className={SECTION_ITEM_CLASS_NAME}
                  onClick={() => onToggleSearch(true)}
                  style={{ flex: 1 }}
                >
                  Поиск дебюта
                </Button>
                <Button
                  view="secondary"
                  size="s"
                  tabIndex={0}
                  className={SECTION_ITEM_CLASS_NAME}
                  onClick={onFlipBoard}
                  style={{ flex: 1 }}
                >
                  Смена ориентации
                </Button>
                <Button
                  view="secondary"
                  size="s"
                  tabIndex={0}
                  className={SECTION_ITEM_CLASS_NAME}
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
};

export default ChessBoardComponent;