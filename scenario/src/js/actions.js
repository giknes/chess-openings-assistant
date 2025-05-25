function makeChessMove(from, to, promotion, context) {
    addAction({
        type: "make_move",
        from: from,
        to: to,
        promotion: promotion || "q"
    }, context);
}

function resetChessGame(context) {
    addAction({ type: "reset_game" }, context);
}

function shortChessCastle(context) {
    addAction({ type: "short_castle" }, context);
}

function longChessCastle(context) {
    addAction({ type: "long_castle" }, context);
}


function nextChessMove(context) {
    addAction({ type: "next_move" }, context);
}

function prevChessMove(context) {
    addAction({ type: "prev_move" }, context);
}

function changeChessMode(mode, context) {
    addAction({
        type: "change_mode",
        mode: mode
    }, context);
}
function flipChessBoard(context) {
    addAction({ type: "flip_board" }, context);
}

function openChessOpenings(context) {
    addAction({ type: "open_openings" }, context);
}

function selectChessOpening(opening, context) {
    addAction({
        type: "select_opening",
        name: opening
    }, context);
}

// Простые конвертеры без сложных функций
function convertLetter(letter) {
    var map = {ку:"a", ка:"a", кью:"a", эр:"b", ар:"b", эн:"c", ен:"c", 
               би:"d", бэ:"d", кей:"e", це:"f", сэ:"f", эф:"g", фе:"g",
               джи:"h", ге:"h", эйч:"h", аш:"h"};
    return map[letter] || letter.charAt(0); // Берем первый символ, если не нашли в мапе
}

function convertNumber(number) {
    var map = {один:"1", два:"2", три:"3", четыре:"4", пять:"5", 
               шесть:"6", семь:"7", восемь:"8"};
    return map[number] || number.charAt(0);
}