import { useState, useRef, useEffect } from 'react';
import {
  Button,
  Card,
  TextField,
  Cell,
  Spinner,
  Body1,
  Headline4
} from '@salutejs/plasma-ui';
import './OpeningSearchModal.css';
import styled from 'styled-components';

import { SECTION_ROOT_CLASS_NAME, SECTION_ITEM_CLASS_NAME } from '@salutejs/spatial';

const CloseButton = styled(Button)`
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1100; 
  min-width: auto;
  padding: 0.25rem 0.75rem;
`;

export default function OpeningSearchModal({
  isOpen,
  onClose,
  onSelectOpening,
  onSelectVariation,
  searchContainerRef
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openings, setOpenings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOpening, setSelectedOpening] = useState(null);
  const [variations, setVariations] = useState([]);
  const [isLoadingVariations, setIsLoadingVariations] = useState(false);
  const [variationSearch, setVariationSearch] = useState('');
  const inputRef = useRef(null);
  const backButtonRef = useRef(null);

  // Загрузка списка дебютов при открытии окна
  useEffect(() => {
    if (isOpen) {
      loadOpenings();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      setOpenings([]);
      setSearchTerm('');
      setSelectedOpening(null);
      setVariations([]);
      setVariationSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedOpening !== null) {
      backButtonRef.current?.focus();
    }else{
      inputRef.current?.focus();
    }
  }, [selectedOpening]);

  // Загрузка дебютов по строке поиска
  const loadOpenings = async (search = '') => {
    setIsLoading(true);
    try {
      const API_BASE = process.env.REACT_APP_API_BASE;
      const response = await fetch(`${API_BASE}/api/openings?search=${encodeURIComponent(search)}`);
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setOpenings(data.data || []);
    } catch (error) {
      console.error('Ошибка при загрузке дебютов:', error);
      setOpenings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    await loadOpenings(searchTerm.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchVariations = async (opening) => {
    setSelectedOpening(opening);
    setIsLoadingVariations(true);
    setVariationSearch('');
    try {
      const API_BASE = process.env.REACT_APP_API_BASE;
      const response = await fetch(`${API_BASE}/api/openings/${opening.id}`);
      const data = await response.json();
      setVariations(data.data.variations || []);
    } catch (e) {
      console.error('Ошибка загрузки вариантов:', e);
      setVariations([]);
    } finally {
      setIsLoadingVariations(false);
    }
  };

  const loadVariationById = async (openingId, variationId) => {
    const API_BASE = process.env.REACT_APP_API_BASE;
    const response = await fetch(`${API_BASE}/api/openings/${encodeURIComponent(openingId)}/variations/${variationId}`);
    if (!response.ok) throw new Error('Ошибка загрузки вариантов');
    return await response.json();
  };

  const renderVariations = () => {
    if (!selectedOpening) return null;

    const filteredVariations = variations.filter(v =>
      v.name.toLowerCase().includes(variationSearch.toLowerCase())
    );

    return (
      <div className="variations-list">
        <Button
          ref={backButtonRef}
          view="secondary"
          className={SECTION_ITEM_CLASS_NAME}
          tabIndex={selectedOpening ? 0 : -1}
          onClick={() =>{
            setSelectedOpening(null);
            }
          }
          style={{ alignSelf: 'flex-start' }}
        >
          ← Назад
        </Button>
        <Headline4 style={{ marginBottom: '12px' }}>
          {selectedOpening.name}: выберите вариант
        </Headline4>

        
        <TextField
          value={variationSearch}
          onChange={(e) => setVariationSearch(e.target.value)}
          placeholder="Поиск вариантов"
          style={{ marginBottom: '12px' }}
        />

        {isLoadingVariations ? (
          <Spinner />
        ) : (
          <>
            {filteredVariations.length > 0 ? (
              <>
                {filteredVariations.map(variation => (
                  <Cell
                    key={variation.id}
                    className={`${SECTION_ITEM_CLASS_NAME} variation-cell`}
                    tabIndex={selectedOpening ? 0 : -1}
                    content={<Body1>{variation.name}</Body1>}
                    onClick={async () => {
                      const loaded = await loadVariationById(selectedOpening.id, variation.id);
                      onSelectVariation({
                        variation: loaded,
                        opening: selectedOpening
                      }); 
                      onClose();
                    }}
                    hoverable
                  />
                ))}
                <Cell
                  tabIndex={selectedOpening ? 0 : -1}
                  className={`${SECTION_ITEM_CLASS_NAME} variation-cell main-variation-cell`}
                  content={<Body1>Основной вариант</Body1>}
                  onClick={() => {
                    onSelectOpening(selectedOpening);
                    onClose();
                  }}
                  hoverable
                />
              </>
            ) : (
              <Body1 style={{ color: 'gray' }}>
                Варианты не найдены. Используется основной дебют.
              </Body1>
            )}
          </>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  const filteredOpenings = openings.filter(op =>
    op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.eco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`search-modal ${SECTION_ROOT_CLASS_NAME}`} id="searchModal">
      <CloseButton view="secondary" onClick={onClose} className={SECTION_ITEM_CLASS_NAME} >
        Закрыть
      </CloseButton>
      <Card ref={searchContainerRef} className="search-modal-content">
        <Headline4 style={{ marginBottom: '16px' }}>Поиск дебюта</Headline4>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <TextField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Введите название дебюта"
          ref={inputRef}
          onKeyDown={handleKeyDown}
          style={{ flexGrow: 1 }}
        />
          <Button
            tabIndex={0} 
            className={SECTION_ITEM_CLASS_NAME}
            view="primary"
            onClick={handleSearch}
            disabled={!searchTerm.trim()}
          >
            Искать
          </Button>
        </div>

        {!selectedOpening && (
          isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Spinner />
            </div>
          ) : (
            <div className="openings-list">
              {filteredOpenings.length > 0 ? (
                filteredOpenings.map(opening => (
                  <Cell
                    tabIndex={0}
                    key={opening.id}
                    className={`${SECTION_ITEM_CLASS_NAME} variation-cell main-variation-cell`}
                    content={<Body1>{opening.name}</Body1>}
                    onClick={() =>{
                       fetchVariations(opening)
                      }
                    }
                    style={{
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background 0.2s ease'
                    }}
                    hoverable
                  />
                ))
              ) : (
                <Body1 style={{
                  textAlign: 'center',
                  color: 'var(--plasma-colors-text-secondary)',
                  padding: '12px'
                }}>
                  {searchTerm && !isLoading
                    ? 'Ничего не найдено. Попробуйте другой запрос'
                    : 'Загрузка дебютов...'}
                </Body1>
              )}
            </div>
          )
        )}

        {renderVariations()}

        <div style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>

        </div>
      </Card>
    </div>
  );
}
