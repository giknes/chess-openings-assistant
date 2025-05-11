import './GameStatus.css'

export default function GameStatus({ game, errorMessage }) {
  const getStatus = () => {
    if (errorMessage) return { 
      text: errorMessage,
      type: 'error'
    };
    
    if (game.isGameOver()) {
      if (game.isCheckmate()) return {
        text: `Мат! Победа ${game.turn() === 'w' ? 'чёрных' : 'белых'}`,
        type: 'info'
      };
      if (game.isDraw()) return {
        text: 'Ничья!',
        type: 'info'
      };
      return {
        text: 'Игра окончена',
        type: 'info'
      };
    }
    
    if (game.isCheck()) return {
      text: 'Шах!',
      type: 'warning'
    };
    
    return {
      text: `Ход: ${game.turn() === 'w' ? 'белых' : 'чёрных'}`,
      type: 'success'
    };
  };

  const status = getStatus();

  return (
    <div className={`game-status ${status.type}`}>
      {status.text}
    </div>
  );
}