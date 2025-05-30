theme: /

    state: FlipBoard
        q!: * (переверни|разверни|поверни) [доску] *
        script:
            flipChessBoard($context);
            $reactions.answer("Доска перевернута");

    state: ShowOpenings
        q!: * (покажи|открой|ищи) (дебюты|открытия) *
        script:
            openChessOpenings($context);
            $reactions.answer("Поиск дебютов открыт");