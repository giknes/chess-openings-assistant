import React from 'react';
import { Card, Button, TextBox } from '@salutejs/plasma-ui';
import styled from 'styled-components';

import {SECTION_ROOT_CLASS_NAME, SECTION_ITEM_CLASS_NAME } from '@salutejs/spatial';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(Card)`
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  padding: 2rem;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  font-size: 1.8rem;
  color: var(--plasma-colors-primary);
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
`;

const HelpButton = styled(Button)`
  margin-top: 1.5rem;
  width: 100%;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 0 0 2px var(--plasma-colors-button-focused);
  }
`;

const CommandGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const CommandTitle = styled.h3`
  color: var(--plasma-colors-primary);
  margin-bottom: 0.5rem;
`;

const CommandList = styled.ul`
  list-style-type: none;
  padding-left: 1rem;
`;

const CommandItem = styled.li`
  margin-bottom: 0.5rem;
  position: relative;
  padding-left: 1.5rem;

  &:before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--plasma-colors-secondary);
  }
`;

export default function HelpModal({ isOpen, onClose, helpContainerRef }) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContent
        ref={helpContainerRef}
        onClick={(e) => e.stopPropagation()}
        className={`${SECTION_ROOT_CLASS_NAME} ${SECTION_ITEM_CLASS_NAME}`}
        id="helpModal">
        <ModalTitle>Шахматный помощник — Руководство</ModalTitle>

        <TextBox size="l" title="О дебютах и режимах">
          <p><strong>Дебют</strong> — это начальная последовательность ходов в шахматной партии, направленная на развитие фигур и контроль центра.</p>
          <p><strong>Режим обучение</strong>: вы можете пошагово просматривать дебют.</p>
          <p><strong>Режим практика</strong>: вам нужно делать ходы согласно дебюту. Если ход неверный, будет показан правильный.</p>
          <p><strong>Режим свободная игра</strong>: можно свободно перемещать фигуры без ограничений.</p>
        </TextBox>

        <Description>
          Ниже перечислены голосовые команды и функции, доступные в приложении:
        </Description>

        <CommandGroup>
          <CommandTitle>Основные команды:</CommandTitle>
          <CommandList>
            <CommandItem><strong>"помощь" | "помоги"</strong> — открывает это окно с инструкциями</CommandItem>
            <CommandItem><strong>"сброс" | "новая игра" | "начни заново" | "рестарт" | "перезагрузить"</strong> — сбрасывает игру в начальное положение</CommandItem>
            <CommandItem><strong>"переверни доску" | "разверни доску" | "поверни доску" | "cмени цвет" | "поменяй цвет" | "смена цвета"</strong> — меняет ориентацию шахматной доски</CommandItem>
          </CommandList>
        </CommandGroup>

        <CommandGroup>
          <CommandTitle>Работа с дебютами:</CommandTitle>
          <CommandList>
            <CommandItem><strong>"покажи дебюты" | "открой варианты" | "ищи дебюты"</strong> — открывает окно поиска дебютов</CommandItem>
            <CommandItem><strong>"закрой дебюты"</strong> — закрывает окно поиска дебютов</CommandItem>
          </CommandList>
        </CommandGroup>

        <CommandGroup>
          <CommandTitle>Режимы игры:</CommandTitle>
          <CommandList>
            <CommandItem><strong>"режим обучение" | "поставь обучение"</strong> — включает режим изучения дебютов</CommandItem>
            <CommandItem><strong>"режим практика" | "поставь проверка"</strong> — включает режим проверки знаний</CommandItem>
            <CommandItem><strong>"режим свободная" | "выбери свободная"</strong> — включает свободную игру</CommandItem>
          </CommandList>
        </CommandGroup>

        <CommandGroup>
          <CommandTitle>Управление ходами:</CommandTitle>
          <CommandList>
            <CommandItem><strong>"следующий ход"</strong> — в режиме обучения переходит к следующему ходу</CommandItem>
            <CommandItem><strong>"предыдущий ход"</strong> — в режиме обучения возвращает предыдущий ход</CommandItem>
            <CommandItem><strong>"ход g1-f3" | "походи e2-e4" | "сделай ход a7-a5"</strong> — делает указанный ход</CommandItem>
            <CommandItem><strong>"короткая рокировка" | "рокируй вправо" | "O-O"</strong> — делает короткую рокировку</CommandItem>
            <CommandItem><strong>"длинная рокировка" | "рокируй влево" | "O-O-O"</strong> — делает длинную рокировку</CommandItem>
          </CommandList>
        </CommandGroup>

        <HelpButton 
          view="primary" 
          onClick={onClose}
          focused={isOpen}
        >
          Понятно
        </HelpButton>
      </ModalContent>
    </Overlay>
  );
}
