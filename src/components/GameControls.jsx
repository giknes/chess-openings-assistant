import { Button} from '@salutejs/plasma-ui';
import './GameControls.css';

export default function GameControls({
  mode,
  onChangeMode,
  resetGame,
  hasPgn,
  isGameLoaded,
  freeButtonRef
}) {
  return (
    <div className="game-controls-container">
      {/* Строка с кнопками режимов */}
      <div className="mode-buttons-row">
        <Button
          data-edge="left"
          view={mode === "learn" ? "primary" : "secondary"}
          size="s"
          onClick={() => onChangeMode("learn")}
          disabled={!isGameLoaded && mode !== "free"}
          className="mode-button"
        >
          Обучение
        </Button>
        
        <Button
          view={mode === "practice" ? "primary" : "secondary"}
          size="s"
          onClick={() => onChangeMode("practice")}
          disabled={!isGameLoaded && mode !== "free"}
          className="mode-button"
        >
          Практика
        </Button>
        
        <Button
          ref={freeButtonRef}
          view={mode === "free" ? "primary" : "secondary"}
          size="s"
          onClick={() => onChangeMode("free")}
          className="mode-button"
        >
          Свободная
        </Button>
      </div>

      {/* Кнопка сброса */}
      <Button
        data-edge="left"
        view="warning"
        size="s"
        onClick={resetGame}
        className="reset-button"
      >
        {hasPgn && mode !== "free" ? "Перезагрузить партию" : "Новая игра"}
      </Button>
    </div>
  );
}