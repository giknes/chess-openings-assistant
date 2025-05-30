theme: /
    state: ShortCastle
        q!: * (~короткая ~рокировка|рокируй вправо|O-O) *
        script:
            shortChessCastle($context);

    state: LongCastle
        q!: * (~длинная ~рокировка|рокируй влево|O-O-O) *
        script:
            longChessCastle($context);
   