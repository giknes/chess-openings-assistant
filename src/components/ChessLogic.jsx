import { Chess } from 'chess.js';

// --- Эффект для загрузки/сброса игры при изменении PGN или режима ---
const setupGame = (pgn, mode, setChessState) => {
  // Убрать useEffect и сделать прямую логику
  if (pgn && mode !== "free") {
    loadPgnGame(pgn, mode, setChessState);
  } else if (mode === "free") {
    resetGame(pgn, mode, setChessState);
  }
};

// --- Загрузка игры из PGN ---
const loadPgnGame = (pgn, mode, setChessState) => {
  setChessState(prevState => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      const newGame = new Chess(); 
      return {
        ...prevState,
        game: newGame,
        moveHistory: chess.history(), 
        currentMoveIndex: -1,
        isGameLoaded: true,
        errorMessage: "",
        pgn: pgn,
        selectedOpening: prevState.selectedOpening || null,
        selectedVariation: prevState.selectedVariation || null
      };
    } catch (e) {
      console.error("Ошибка при загрузке PGN:", e);
      return {
        ...prevState,
        errorMessage: "Неверный формат PGN",
        isGameLoaded: false
      };
    }
  });
};

// --- Переход к определенному ходу в истории игры ---
const goToMove = (index, setChessState, speak) => {
  setChessState(prevState => {
      try {
          const { currentMoveIndex, moveHistory, game, mode } = prevState;

          if (index >= moveHistory.length) {
              console.warn("Недопустимый индекс хода:", index);
              return prevState; // Индекс за пределами допустимого диапазона
          }

          let newGame;
          let newMoveHistory = moveHistory;
          if (index < currentMoveIndex) {
              newGame = new Chess();
              const movesToApply = moveHistory.slice(0, index + 1);
              movesToApply.forEach(move => newGame.move(move));
              announceGameState(newGame, speak);
              if (mode === 'free') {
                newMoveHistory = movesToApply;
              }
          } else if (index > currentMoveIndex) {
              newGame = new Chess(game.fen());
              const movesToApply = moveHistory.slice(currentMoveIndex + 1, index + 1);
              movesToApply.forEach(move => newGame.move(move));
              announceGameState(newGame, speak);
          } else {
              return prevState; // Ничего не делаем, если индекс не изменился
          }

          return {
              ...prevState,
              game: newGame,
              currentMoveIndex: index,
              moveHistory: newMoveHistory,
              errorMessage: ""
          };
      } catch (e) {
          console.error("Ошибка при переходе к ходу:", e);
          return {
              ...prevState,
              errorMessage: "Ошибка при переходе к ходу"
          };
      }
  });
};

// --- Выполнение хода игрока (проверка в режиме "practice") ---
const makePlayerMove = (move, setChessState, game, moveHistory, currentMoveIndex, speak) => {
  const correctMove = moveHistory[currentMoveIndex + 1];

  if (correctMove && move.san === correctMove) {
      const newGame = new Chess(game.fen());
      newGame.move(move);
      speak("Ход " + move.from + " " + move.to + " выполнен");
      announceGameState(newGame, speak);
      setChessState(prevState => ({
          ...prevState,
          game: newGame,
          currentMoveIndex: prevState.currentMoveIndex + 1,
          errorMessage: ""
      }));
      return true;  // Ход успешен
  } else {
      let text = `Ошибка! Правильный ход: ${correctMove ? correctMove : "Нет следующего хода"}`;
      speak(text);
      setChessState(prevState => ({
          ...prevState,
          errorMessage: `Ошибка! Правильный ход: ${correctMove ? correctMove : "Нет следующего хода"}`
      }));
      return false; // Ход неверен
  }
};

// --- Обработчик хода с доски (onDrop) ---
const handleOnDrop = (sourceSquare, targetSquare, piece, mode, setChessState, game,moveHistory, currentMoveIndex, speak) => {
  if (mode === "learn"){
    speak("В режиме обучения нельзя делать ходы");
    return false;
  }
    try {
        const move = {
            from: sourceSquare,
            to: targetSquare,
            promotion: piece[1]?.toLowerCase() || "q"
        };

        const chess = new Chess(game.fen()); 
        const result = chess.move(move);

        if (mode === "practice") {
            return makePlayerMove(result, setChessState, game, moveHistory, currentMoveIndex, speak);
        }

        if (mode === "free") {
          setChessState(prevState => ({
              ...prevState,
              game: chess, 
              moveHistory: [...prevState.moveHistory, result.san], 
              currentMoveIndex: prevState.currentMoveIndex + 1, 
              errorMessage: ""
          }));
          speak("Ход " + sourceSquare + " " + targetSquare + " выполнен");
          announceGameState(chess, speak);
        }

        return true;
    } catch (error) {
        speak("Это невозможный ход");
        console.error("Некорректный ход:", error);
        setChessState(prevState => ({
            ...prevState,
            errorMessage: "Некорректный ход"
        }));
        return false;
    }
};


// --- Сброс игры (в начальную позицию или загрузка PGN) ---
const resetGame = (pgn, mode, setChessState) => {
  if (pgn && mode !== "free") {
    loadPgnGame(pgn, mode, setChessState);
  } else {
    setChessState(prevState => ({  
      ...prevState,
      game: new Chess(),
      moveHistory: [],
      currentMoveIndex: -1,
      isGameLoaded: true,
      errorMessage: "",
      selectedSquare: null,
      possibleMoves: []
    }));
  }
};

// --- Обработчик выбора дебюта ---
const handleOpeningSelect = async (opening, setChessState) => {
  try {
    const API_BASE = process.env.REACT_APP_API_BASE;
    const response = await fetch(`${API_BASE}/api/openings/${opening.id}`);
    const result = await response.json();
    const { pgn } = result.data;

    setChessState(prevState => {
      const chess = new Chess();
      chess.loadPgn(pgn);
      const newGame = new Chess();
      return {
        ...prevState,
        game: newGame,
        moveHistory: chess.history(),
        currentMoveIndex: -1,
        isGameLoaded: true,
        errorMessage: "",
        isSearchOpen: false,
        pgn: pgn,
        selectedOpening: opening,           
        selectedVariation: null  
      };
    });
  } catch (error) {
    console.error("Ошибка загрузки дебюта:", error);
    setChessState(prevState => ({
      ...prevState,
      errorMessage: "Ошибка загрузки дебюта"
    }));
  }
};

const handleVariationSelect = (variation, opening, setChessState) => {
  try {
    setChessState(prevState => {
      const chess = new Chess();
      chess.loadPgn(variation.pgn);
      const newGame = new Chess();
      return {
        ...prevState,
        game: newGame,
        moveHistory: chess.history(),
        currentMoveIndex: -1,
        isGameLoaded: true,
        errorMessage: "",
        isSearchOpen: false,
        pgn: variation.pgn,
        selectedOpening: opening, 
        selectedVariation: variation
      };
    });
  } catch (error) {
    console.error("Ошибка загрузки вариации:", error);
    setChessState(prevState => ({
      ...prevState,
      errorMessage: "Ошибка загрузки вариации"
    }));
  }
};

function announceGameState(game, speak) {
  if (game.isCheckmate()) {
    speak("Мат! Игра окончена");
  } else if (game.isCheck()) {
    speak("Шах! Король под ударом");
  } else if (game.isStalemate()) {
    speak("Пат! Ничья");
  }
}

const handleCastling = (type, game, setChessState, speak) => {
  const chess = new Chess(game.fen());
  const rank = chess.turn() === 'w' ? '1' : '8'; 

  const moveNotation = type === 'short' 
    ? { from: `e${rank}`, to: `g${rank}`, promotion: 'k' }  
    : { from: `e${rank}`, to: `c${rank}`, promotion: 'k' };

  try {
    const result = chess.move(moveNotation);

    announceGameState(chess, speak);
    setChessState(prevState => ({
        ...prevState,
        game: chess, 
        moveHistory: [...prevState.moveHistory, result.san],
        currentMoveIndex: prevState.currentMoveIndex + 1, 
        errorMessage: ""
    }));
    
    let move = "рокировка";
    if (type === "short"){
      move = "короткая " + move;
    }else{
      move = "длинная" + move;
    }
    speak("Ход " + move + " выполнен");
    
  } catch (error) {
    speak("Невозможный ход");
  }
};


export {
  setupGame,
  loadPgnGame,
  goToMove,
  makePlayerMove,
  handleOnDrop,
  resetGame,
  handleOpeningSelect,
  handleVariationSelect,
  handleCastling
};