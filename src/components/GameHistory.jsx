import MoveNavigator from "./MoveNavigator";

export default function GameHistory({ moves, currentMoveIndex, onMoveSelect, mode }) {
  if (mode === "practice") return null;

  return (
    <div className={`history-content ${mode}-mode`}>
      <h3>История ходов</h3>
      <MoveNavigator
        moves={moves}
        currentMoveIndex={currentMoveIndex}
        onMoveSelect={onMoveSelect}
      />
    </div>
  );
}