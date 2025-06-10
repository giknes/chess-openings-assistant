import React, { useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Button, Card } from '@salutejs/plasma-ui';
import { SECTION_ITEM_CLASS_NAME, setDefaultSectionByName, spatnavInstance } from '@salutejs/spatial';
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
  const panelContainerRef = useRef(null);
  const boardContainerRef = useRef(null);
  const searchContainerRef = useRef(null);
  const helpContainerRef = useRef(null);

  const freeButtonRef = useRef(null);


  useEffect(() => {
    if (isSearchOpen) {
      spatnavInstance.add('searchModal', {
        enterTo: 'last-focused',
        restrict: 'self-only',
        getDefaultElement: () => document.querySelector('.search-modal .SECTION_ITEM_CLASS_NAME') || null,
      });
      setActiveSection('searchModal');
      spatnavInstance.focus('searchModal');
    } else {
      spatnavInstance.remove('searchModal');
      // Возвращаем фокус обратно на панель
      setActiveSection('panel');
      spatnavInstance.focus('panel');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (isHelpOpen) {
      spatnavInstance.add('helpModal', {
        enterTo: 'last-focused',
        restrict: 'self-only',
        getDefaultElement: () => document.querySelector('.help-modal .SECTION_ITEM_CLASS_NAME') || null,

      });
      setActiveSection('helpModal');
      spatnavInstance.focus('helpModal');
    } else {
      spatnavInstance.remove('helpModal');
      // Возвращаем фокус обратно на панель или другую секцию
      setActiveSection('panel');
      spatnavInstance.focus('panel');
    }
  }, [isHelpOpen]);
  

  useEffect(() => {
    if (!panelContainerRef.current || !boardContainerRef.current) return;

    spatnavInstance.add('panel', {
      enterTo: 'last-focused',
      restrict: 'self-only',
      leaveFor: {
        left: () => {
          if (window.matchMedia('(orientation: landscape)').matches) {
            setActiveSection('chessboard');
            setFocusedSquare(focusedSquare || 'e4');
            return 'chessboard';
          }
          return {
            type: 'no-spatnav-navigation',
            result: null,
        }
        },
        up: () => {
          if (window.matchMedia('(orientation: portrait)').matches) {
            setActiveSection('chessboard');
            setFocusedSquare(focusedSquare || 'e4');
            return 'chessboard';
          }
          return {
            type: 'no-spatnav-navigation',
            result: null,
        }
        },
      },
      getDefaultElement: () => {
        // Можно возвращать конкретный элемент с классом SECTION_ITEM_CLASS_NAME внутри панели
        return panelContainerRef.current.querySelector(`.${SECTION_ITEM_CLASS_NAME}`) || null;
      },
    });

    spatnavInstance.add('chessboard', {
      enterTo: 'last-focused',
      restrict: 'self-only',
      getDefaultElement: () => {
        // Фокусируемся на центре доски или e4 по умолчанию
        return boardContainerRef.current.querySelector('[data-square="e4"]') || null;
      },
      // Здесь onNavigate отсутствует, будем контролировать навигацию вручную
    });

    setDefaultSectionByName('panel');
    spatnavInstance.focus('panel');

    // Очистка секций при размонтировании
    return () => {
      spatnavInstance.remove('panel');
      spatnavInstance.remove('chessboard');
    };
  }, []);

  useEffect(() => {
    if (activeSection === 'panel') {
      spatnavInstance.focus('panel');
    } else if (activeSection === 'chessboard') {
      spatnavInstance.focus('chessboard');
      if (focusedSquare) {
        focusSquareElement(focusedSquare);
      }
    }
  }, [activeSection, focusedSquare]);

  // Обработчик клавиатуры для кастомной логики навигации
  useEffect(() => {
    const handleKeyDown = (e) => {
      const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        Enter: 'select',
      };
  
      const direction = keyMap[e.key];
      if (!direction) return;
  
      e.preventDefault();
  
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  
      if (direction === 'select') {
        if (activeSection === 'chessboard' && focusedSquare) {
          handleSquareClick(focusedSquare);
        } else {
          const focusedEl = document.activeElement;
          if (focusedEl && typeof focusedEl.click === 'function') {
            focusedEl.click();
          }
        }
        return;
      }
  
      // === С ПАНЕЛИ ===
      if (activeSection === 'panel'  || activeSection === 'searchModal' || activeSection === 'helpModal') {
        let panelEl = null;
        if (activeSection === 'panel') {
          panelEl = panelContainerRef.current;
        }
        if (activeSection === 'searchModal') {
          panelEl = searchContainerRef.current;
        }
        if (activeSection === 'helpModal') {
          panelEl = helpContainerRef.current;
        }
        if (!panelEl) return null;

        if (direction === 'down') {
          const bottomReached = panelEl.scrollHeight - panelEl.scrollTop === panelEl.clientHeight;
          if (!bottomReached) {
            panelEl.scrollBy({ top: 120, behavior: 'smooth' });
            return 'handled';
          }
        } else if (direction === 'up') {
          if (panelEl.scrollTop > 0) {
            panelEl.scrollBy({ top: -120, behavior: 'smooth' });
            return 'handled';
          }
        }
        return;
      }
  
      // === С ДОСКИ ===
      if (activeSection === 'chessboard') {
        if (!focusedSquare) {
          const defaultSquare = 'e4';
          setFocusedSquare(defaultSquare);
          focusSquareElement(defaultSquare);
          return;
        }
  
        let [file, rank] = focusedSquare.split('');
        let newFile = file.charCodeAt(0); // 'a' to 'h'
        let newRank = parseInt(rank);     // 1 to 8
  
        let effectiveDirection = direction;
        if (chessState.isFlipped) {
          switch (direction) {
            case 'up': effectiveDirection = 'down'; break;
            case 'down': effectiveDirection = 'up'; break;
            case 'left': effectiveDirection = 'right'; break;
            case 'right': effectiveDirection = 'left'; break;
          }
        }

        // Условие выхода с доски на панель
        const shouldMoveToPanel =
          (!isPortrait && effectiveDirection === 'right' && file === 'h' && !isFlipped) ||
          (!isPortrait && effectiveDirection === 'left' && file === 'a' && isFlipped) ||
          (isPortrait && effectiveDirection === 'down' && rank === '1' && !isFlipped) ||
          (isPortrait && effectiveDirection === 'up' && rank === '8' && isFlipped);

        if (shouldMoveToPanel) {
          setActiveSection('panel');
          setFocusedSquare(null);
          return;
        }

        // Навигация по доске
        switch (effectiveDirection) {
          case 'up':
            if (newRank < 8) newRank++;
            break;
          case 'down':
            if (newRank > 1) newRank--;
            break;
          case 'left':
            if (newFile > 97) newFile--;
            break;
          case 'right':
            if (newFile < 104) newFile++;
            break;
        }

        const nextSquare = String.fromCharCode(newFile) + newRank;
        setFocusedSquare(nextSquare);
      
        setTimeout(() => {
          focusSquareElement(nextSquare);
        }, 0);
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, focusedSquare]);

  // Функция фокуса на квадрат доски
  const focusSquareElement = (square) => {
    const el = boardContainerRef.current.querySelector(`[data-square="${square}"]`);
    if (el) {
      el.setAttribute('tabindex', '0');
      el.focus();
    }
  };

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
    tabIndex: square === focusedSquare && activeSection === 'chessboard' ? 0 : -1,
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
        searchContainerRef={searchContainerRef}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => onHelpOpen(false)}
        helpContainerRef={helpContainerRef}
      />

      <div className="main-grid">
        <div 
          ref={boardContainerRef}
          className="chessboard-area"
          id="chessboard"
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
          className="sn-section-root right-panel"
          id="panel"
          style={{ height: boardWidth }}
        >
          <Card>
            <div className="card-content">
              <div className="controls-row">
                <Button
                  data-edge="top left"
                  view="primary"
                  size="s"
                  tabIndex={activeSection === 'panel' ? 0 : -1}
                  className={SECTION_ITEM_CLASS_NAME}
                  onClick={() => onToggleSearch(true)}
                  style={{ flex: 1 }}
                >
                  Поиск дебюта
                </Button>
                <Button
                  data-edge="top"
                  view="secondary"
                  size="s"
                  tabIndex={activeSection === 'panel' ? 0 : -1}
                  className={SECTION_ITEM_CLASS_NAME}
                  onClick={onFlipBoard}
                  style={{ flex: 1 }}
                >
                  Смена цвета
                </Button>
                <Button
                  data-edge="top"
                  view="secondary"
                  size="s"
                  tabIndex={activeSection === 'panel' ? 0 : -1}
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
                freeButtonRef={freeButtonRef}
              />

              {displayName && <div className="opening-name">{displayName}</div>}

              <div className="move-history-wrapper">
                {mode !== "practice" && moveHistory.length >= 0 && (
                  <MoveHistory
                    moveHistory={moveHistory}
                    currentMoveIndex={currentMoveIndex}
                    goToMove={onMoveSelect}
                    freeButtonRef={freeButtonRef}
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