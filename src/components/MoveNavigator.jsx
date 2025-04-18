export default function MoveNavigator({ 
  moves, 
  currentMoveIndex, 
  onMoveSelect 
}) {
  return (
    <div className="move-navigator">
      <div className="navigation-buttons">
        <button
          onClick={() => onMoveSelect(currentMoveIndex - 1)}
          disabled={currentMoveIndex < 0}
          className="nav-button prev-button"
        >
          ◄ Назад
        </button>
        <button
          onClick={() => onMoveSelect(currentMoveIndex + 1)}
          disabled={currentMoveIndex >= moves.length - 1}
          className="nav-button next-button"
        >
          Вперед ►
        </button>
      </div>
      <div className="moves-container">
        {moves.map((move, index) => (
          <div
            key={index}
            className={`move ${index === currentMoveIndex ? 'active' : ''}`}
            onClick={() => onMoveSelect(index)}
          >
            {index % 2 === 0 ? `${Math.floor(index/2) + 1}.` : ''} {move}
          </div>
        ))}
      </div>
    </div>
  );
}