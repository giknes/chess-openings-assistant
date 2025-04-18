import ChessBoardComponent from '../components/ChessBoard'

export default function ChessGamePage(){
  return (
    <ChessBoardComponent
      pgn="1. e4 e5 2. Nf3 Nc6 3. Bb5 a6" 
      mode="learn"
    />
  );
}