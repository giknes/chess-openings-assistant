import { useEffect, useRef } from "react";
import { Card, Button, Cell, Row, Col } from '@salutejs/plasma-ui';
import { SECTION_ITEM_CLASS_NAME } from '@salutejs/spatial';
import './MoveHistory.css';

function MoveHistory({ moveHistory = [], currentMoveIndex = -1, goToMove = () => {}, searchButtonRef = null }) {
  const buttonNextRef = useRef(null);
  const buttonPrevRef = useRef(null);

  useEffect(() => {
    if (currentMoveIndex < 0 && buttonNextRef.current && document.activeElement === document.body) {
      buttonNextRef.current.focus();
    } else if (currentMoveIndex >= moveHistory.length - 1 && buttonPrevRef.current && document.activeElement === document.body) {
      console.log('Focus on previous button');
      buttonPrevRef.current.focus();
    }
  }, [currentMoveIndex, moveHistory.length]);

  if (!Array.isArray(moveHistory) || moveHistory.length === 0) {
    searchButtonRef?.current?.focus(); 
    return null;
  } 

  return (
    <Card className="history-card">
      <Cell header="История ходов" />
      
      <div className="moves-container">
        {moveHistory.map((move, index) => (
          <div
            key={`${index}-${move}`}
            tabIndex={0}
            className={`move-item ${index === currentMoveIndex ? 'active' : ''} ${SECTION_ITEM_CLASS_NAME}`}
            onClick={() => goToMove(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                goToMove(index);
              }
            }}
          >
            {index % 2 === 0 ? `${Math.floor(index/2) + 1}.` : ''} {move}
          </div>
        ))}
      </div>

      <Row className="navigation-buttons">
        <Col className="nav-col">
          <Button
            ref={buttonPrevRef}
            view="secondary"
            size="s"
            tabIndex={0}
            className={`nav-button ${SECTION_ITEM_CLASS_NAME}`}
            onClick={() => goToMove(currentMoveIndex - 1)}
            disabled={currentMoveIndex < 0}
          >
            ← Назад
          </Button>
        </Col>
        <Col className="nav-col">
          <Button
            ref={buttonNextRef}
            view="secondary"
            size="s"
            tabIndex={0}
            className={`nav-button ${SECTION_ITEM_CLASS_NAME}`}
            onClick={() => goToMove(currentMoveIndex + 1)}
            disabled={currentMoveIndex >= moveHistory.length - 1}
          >
            Вперед →
          </Button>
        </Col>
      </Row>
    </Card>
  );
}

export default MoveHistory;