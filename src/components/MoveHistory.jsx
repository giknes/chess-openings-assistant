import React from 'react';
import './MoveHistory.css'

function MoveHistory({ moveHistory, currentMoveIndex, goToMove }) {
  return (
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
  );
}

export default MoveHistory;