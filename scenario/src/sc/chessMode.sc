theme: /

  state: ChangeMode
    q!: * (режим|включи|поставь) $AnyText::anyText
    
    script:
        // Проверяем, что mode извлечён
        if (!$parseTree._anyText) {
            $reactions.answer("Укажите режим: обучение, практика или свободная");
            return;
        }
        
        var mode = $parseTree._anyText.toLowerCase();
        var modeMap = {
            "обучение": "learn",
            "практика": "practice",
            "свободная": "free"
        };
        
        var finalMode = modeMap[mode] || mode; // Если mode уже на английском
        
        changeChessMode(finalMode, $context);
        $reactions.answer("✅ Режим изменён на: " + finalMode);