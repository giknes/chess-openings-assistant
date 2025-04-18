export default function MoveHistory({ moves, currentMoveIndex, onMoveSelect }) {
  return (
    <div className="move-history">
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
  );
}