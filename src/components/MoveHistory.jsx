import React from 'react';
import { Card, Button, Cell, Row, Col } from '@salutejs/plasma-ui';
import './MoveHistory.css';

function MoveHistory({ moveHistory = [], currentMoveIndex = -1, goToMove = () => {} }) {
  // Защита от undefined
  if (!Array.isArray(moveHistory)) return null;

  return (
    <Card className="history-card" style={{ padding: '1rem', margin: '1rem 0' }}>
      <Cell header="История ходов" />
      
      <div className="moves-container">
        {moveHistory.map((move, index) => (
          <div
            key={`${index}-${move}`}
            className={`move-item ${index === currentMoveIndex ? 'active' : ''}`}
            onClick={() => goToMove(index)}
          >
            {index % 2 === 0 ? `${Math.floor(index/2) + 1}.` : ''} {move}
          </div>
        ))}
      </div>

      <Row className="navigation-buttons">
        <Col>
          <Button
            view="secondary"
            size="s"
            onClick={() => goToMove(currentMoveIndex - 1)}
            disabled={currentMoveIndex < 0}
            stretch
          >
            ← Назад
          </Button>
        </Col>
        <Col>
          <Button
            view="secondary"
            size="s"
            onClick={() => goToMove(currentMoveIndex + 1)}
            disabled={currentMoveIndex >= moveHistory.length - 1}
            stretch
          >
            Вперед →
          </Button>
        </Col>
      </Row>
    </Card>
  );
}

export default MoveHistory;