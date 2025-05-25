theme: /
    state: Speak
        event!: speak

        script:
            log("speak")
            var eventData = $context && $context.request && $context.request.data && $context.request.data.eventData || {}
            $reactions.answer(eventData.value);