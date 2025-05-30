theme: /

    state: ResetGame
        q!: * (сброс|новая игра|начни заново|рестарт) *
        script:
            resetChessGame($context);
            $reactions.answer("Игра сброшена");