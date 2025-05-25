require: slotfilling/slotFilling.sc
  module = sys.zb-common
  
require: js/actions.js
require: js/reply.js

require: sc/chessMove.sc
require: sc/chessReset.sc
require: sc/chessMode.sc
require: sc/chessBoard.sc
require: sc/chessOpenings.sc
require: sc/speak.sc
require: sc/castling.sc

patterns:
    $AnyText = $nonEmptyGarbage
    $ChessLetterFrom = (a|b|c|d|e|f|g|h|а|би|б|бэ|бе|це|ц|цэ|сэ|эс|д|де|дэ|е|эф|фе|фэ|ф|джи|ге|гэ|же|ж|жэ|эйч|аш)
    $ChessNumberFrom = (1|2|3|4|5|6|7|8|один|два|три|четыре|пять|шесть|семь|восемь)
    $ChessLetterTo = (a|b|c|d|e|f|g|h|а|би|б|бэ|бе|це|ц|цэ|сэ|эс|д|де|дэ|е|эф|фе|фэ|ф|джи|ге|гэ|же|ж|жэ|эйч|аш)
    $ChessNumberTo = (1|2|3|4|5|6|7|8|один|два|три|четыре|пять|шесть|семь|восемь)

theme: /
    state: Start
        q!: $regex</start>
        q!: (запусти | открой | вруби) шахматный тренер
        a: Начнём.
    state: Fallback
        event!: noMatch
        a: Вы сказали: {{$parseTree.text}}