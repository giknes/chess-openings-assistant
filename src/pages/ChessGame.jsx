import ChessBoardComponent from '../components/ChessBoard';

const ChessGamePage = ({
  chessState,
  onPieceDrop,
  onMoveSelect,
  onChangeMode,
  onFlipBoard,
  onToggleSearch,
  onSelectOpening,
  onReset
}) => {
  return (
      <ChessBoardComponent
        chessState={chessState}
        onPieceDrop={onPieceDrop}
        onMoveSelect={onMoveSelect}
        onChangeMode={onChangeMode}
        onFlipBoard={onFlipBoard}
        onToggleSearch={onToggleSearch}
        onSelectOpening={onSelectOpening}
        onReset={onReset}
      />
  );
};

export default ChessGamePage;