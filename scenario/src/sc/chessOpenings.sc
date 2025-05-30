theme: /

    state: SelectOpening
        q!: * 
            (
                (выбери|загрузи|установи) 
                (дебют|открытие) 
                $AnyText::opening
            |
                $AnyText::opening (дебют|открытие)
            ) *
        
        script:
            if ($parseTree.opening) {
                selectChessOpening($parseTree.opening, $context);
                $reactions.answer("Загружаю дебют: " + $parseTree.opening);
            }