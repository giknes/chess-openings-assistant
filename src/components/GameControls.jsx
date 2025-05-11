import './GameControls.css';

export default function GameControls({
  mode,
  setMode,
  resetGame,
  hasPgn,
  isGameLoaded
}) {
  return (
    <div className="controls">
      <div className="mode-selector">
        <button
          className={mode === "learn" ? "active" : ""}
          onClick={() => setMode("learn")}
          disabled={!isGameLoaded && mode !== "free"}
        >
          Обучение
        </button>
        <button
          className={mode === "practice" ? "active" : ""}
          onClick={() => setMode("practice")}
          disabled={!isGameLoaded && mode !== "free"}
        >
          Проверка
        </button>
        <button
          className={mode === "free" ? "active" : ""}
          onClick={() => setMode("free")}
        >
          Свободная игра
        </button>
      </div>

      <button className="reset-button" onClick={resetGame}>
        {hasPgn && mode !== "free" ? "Перезагрузить партию" : "Новая игра"}
      </button>
    </div>
  );
}