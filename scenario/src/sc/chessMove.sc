theme: /


    state: NextMove
        q!: * (следующий ход|вперёд|next) *
        script:
            nextChessMove($context);
            $reactions.answer("Переход к следующему ходу");

    state: PrevMove
        q!: * (предыдущий ход|назад|prev) *
        script:
            prevChessMove($context);
            $reactions.answer("Возврат к предыдущему ходу");


    state: MakeMove
        q!: * [ход|походи|сделай ход] $ChessLetterFrom::chessLetterFrom $ChessNumberFrom::chessNumberFrom $ChessLetterTo::chessLetterTo $ChessNumberTo::chessNumberTo *
        
        script:
            // Проверяем наличие всех компонентов
            if (!$parseTree._chessLetterFrom || !$parseTree._chessNumberFrom || 
                !$parseTree._chessLetterTo || !$parseTree._chessNumberTo) {
                $reactions.answer("Укажите ход, например: 'e2 e4' или 'эй два ё четыре'");
                return;
            }
            
            // Простые объекты для конвертации (без функций)
            var letterMap = {
                "а":"a",  "a":"a", "эй":"a", "b":"b","бэ":"b","бе":"b", "б":"b","би":"b",
                "цэ":"c", "це":"c", "ц":"c", "си":"c", "эс":"c", "c":"c", "дэ":"d","d":"d", "де":"d","д":"d", "ди":"d", "e":"e", "е":"e", "и":"e", "ф":"f",
                "эф":"f","f":"f", "фэ":"f",  "фе":"f", "джи":"g", "g":"g", "же":"g", "жэ":"g","ж":"g", "гэ":"g","ге":"g", "эйч":"h", "аш":"h", "h":"h"
            };
            
            var numberMap = {
                "один":"1", "два":"2", "три":"3", "четыре":"4",
                "пять":"5", "шесть":"6", "семь":"7", "восемь":"8",
                "1":"1", "2":"2", "3":"3", "4":"4",
                "5":"5", "6":"6", "7":"7", "8":"8"
            };
            
            // Конвертируем первую клетку
            var fromLetter = letterMap[$parseTree._chessLetterFrom] || $parseTree._chessLetterFrom;
            var fromNumber = numberMap[$parseTree._chessNumberFrom] || $parseTree._chessNumberFrom;
            var from = fromLetter + fromNumber;
            
            // Конвертируем вторую клетку
            var toLetter = letterMap[$parseTree._chessLetterTo] || $parseTree._chessLetterTo;
            var toNumber = numberMap[$parseTree._chessNumberTo] || $parseTree._chessNumberTo;
            var to = toLetter + toNumber;
            
            makeChessMove(from, to, null, $context);