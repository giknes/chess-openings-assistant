import React, { useState, useEffect, useCallback,useRef } from 'react';
import { Chess } from 'chess.js';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';

import './App.css';
import {
  setupGame,
  goToMove,
  handleOnDrop,
  resetGame,
  handleOpeningSelect,
  handleVariationSelect,
  handleCastling
} from './components/ChessLogic';
import ChessBoardComponent from './components/ChessBoard';

const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? '',
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
      nativePanel: {
        defaultText: 'Шахматный помощник',
        screenshotMode: false,
      },
    });
  }
  return createAssistant({ getState });
};

function App() {
  const [assistant, setAssistant] = useState(null);
  const [chessState, setChessState] = useState({
    game: new Chess(),
    moveHistory: [],
    currentMoveIndex: -1,
    mode: 'learn',
    selectedOpening: null,    
    selectedVariation: null,  
    isFlipped: false,
    isSearchOpen: false,
    isGameLoaded: false,
    isHelpOpen: false,
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6',
    errorMessage: ''
  });

  const dispatchRef = useRef();

  const getStateForAssistant = useCallback(() => ({
  }), []);

  // Инициализация ассистента
  useEffect(() => {
    const newAssistant = initializeAssistant(getStateForAssistant);
    
    const handleData = (event) => {
      if (event.action) dispatchRef.current(event.action);
    };

    newAssistant.on('data', handleData);
    newAssistant.on('start', (event) => {
    });

    newAssistant.on('command', (event) => {
      console.log(`assistant.on(command)`, event);
    });

    newAssistant.on('error', (event) => {
      console.log(`assistant.on(error)`, event);
    });

    newAssistant.on('tts', (event) => {
      console.log(`assistant.on(tts)`, event);
    });

    window.addEventListener('keydown', (event) => {
      switch(event.code) {
        case 'ArrowDown':
          // вниз
          break;
          case 'ArrowUp':
          // вверх
          break;
          case 'ArrowLeft':
          // влево
          break;
          case 'ArrowRight':
          // вправо
          break;
          case 'Enter':
          // ок
          break;
      }
    });

    setAssistant(newAssistant);
  }, [getStateForAssistant]);

  const speak = useCallback((text) => {
    assistant?.sendData({ action: { action_id: 'speak', parameters: { value: text } } });
  }, [assistant]);

  // Основные функции игры
   // Используйте useGameSetup для загрузки/сброса игры
   useEffect(() => {
    setupGame(chessState.pgn, chessState.mode, setChessState);
  }, [chessState.pgn, chessState.mode]);


   // Оберните handleOnDrop, чтобы передать setChessState и chessState
   const handlePieceDrop = useCallback((sourceSquare, targetSquare, piece) => {
    handleOnDrop(sourceSquare, targetSquare, piece, chessState.mode, setChessState, chessState.game,
       chessState.moveHistory, chessState.currentMoveIndex, speak);
  }, [chessState.game, chessState.mode, chessState.currentMoveIndex, chessState.moveHistory, speak]);

  const handleMoveSelect = useCallback((index) => {
      goToMove(index, setChessState, speak);
  }, [speak]);

  const handleOpeningSelection = useCallback((opening) => {
      handleOpeningSelect(opening, setChessState)
  }, []);

  const handleVariationSelection = useCallback(({ variation, opening }) => {
    handleVariationSelect(variation, opening, setChessState);
  }, []);

  const handleFlipBoard = useCallback(() => {
      setChessState(prevState => ({
          ...prevState,
          isFlipped: !prevState.isFlipped
      }));
  }, []);

  const handleResetGame = useCallback(() => {
      resetGame(chessState.pgn, chessState.mode, setChessState);
  }, [chessState.pgn, chessState.mode]);

  const handleChangeMode = useCallback((mode) => {
      setChessState(prev => ({ ...prev, mode }));
  }, []);

  const handleToggleSearch = useCallback((isOpen) => {
      setChessState(prev => ({ ...prev, isSearchOpen: isOpen }));
  }, []);

  const handleToogleHelp = useCallback((isOpen) => {
    setChessState(prev => ({ ...prev, isHelpOpen: isOpen }));
}, []);

  const handleNextMove = useCallback(() => {
    goToMove(chessState.currentMoveIndex + 1, setChessState, speak);
  }, [chessState.currentMoveIndex, speak]);

  const handlePrevMove = useCallback(() => {
    goToMove(chessState.currentMoveIndex - 1, setChessState, speak);
  }, [chessState.currentMoveIndex, speak]);

  const handleCastle= useCallback((type) => {
    handleCastling(type, chessState.game, setChessState, speak);
  }, [chessState.game, speak]);

  const dispatchAssistantAction = useCallback((action) => {
    const actionHandlers = {
      reset_game: () => handleResetGame(),
      change_mode: () => handleChangeMode(action.mode),
      flip_board: () => handleFlipBoard(),
      open_openings: () => handleToggleSearch(true),
      close_openings: () => handleToggleSearch(false),
      next_move: () => handleNextMove(),
      prev_move: () => handlePrevMove(),
      make_move: () => handlePieceDrop(action.from, action.to, action.promotion),
      short_castle: () => handleCastle("short"),
      long_castle: () => handleCastle("long"),
      open_help: () => handleToogleHelp(true)
    };

    if (actionHandlers[action.type]) {
      actionHandlers[action.type]();
    }
  }, [handleChangeMode, handleFlipBoard, handleNextMove, handleToggleSearch,
    handlePieceDrop, handlePrevMove, handleResetGame, handleCastle, handleToogleHelp
  ]);

  useEffect(() => {
    dispatchRef.current = dispatchAssistantAction;
  }, [dispatchAssistantAction]);

  return (
    <ChessBoardComponent
      chessState={chessState}
      onPieceDrop={handlePieceDrop}
      onMoveSelect={handleMoveSelect}
      onChangeMode={handleChangeMode}
      onFlipBoard={handleFlipBoard}
      onToggleSearch={handleToggleSearch}
      onHelpOpen={handleToogleHelp}
      onSelectOpening={handleOpeningSelection}
      onSelectVariation={handleVariationSelection}
      onReset={handleResetGame}
    />
  );
}

export default App;