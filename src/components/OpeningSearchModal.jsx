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

export default function OpeningSearchModal({ 
  isOpen, 
  onClose, 
  onSelectOpening 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openings, setOpenings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Загрузка дебютов при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      loadOpenings();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      // Очищаем результаты при закрытии
      setOpenings([]);
      setSearchTerm('');
    }
  }, [isOpen]);

  const loadOpenings = async (search = '') => {
    setIsLoading(true);
    try {
      const API_BASE = 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/openings?search=${encodeURIComponent(search)}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      setOpenings(data.data || []);
    } catch (error) {
      console.error('Ошибка при загрузке дебютов:', error);
      setOpenings([]); // Покажем пустой список
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

  if (!isOpen) return null;

  const filteredOpenings = openings.filter(op =>
    op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    op.eco.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="search-modal">
      <Card className="search-modal-content">
        <Headline4 style={{ marginBottom: '16px' }}>Поиск дебюта</Headline4>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <TextField
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите название дебюта"
            style={{ flexGrow: 1 }}
            ref={inputRef}
          />
          <Button 
            view="primary" 
            onClick={handleSearch} 
            disabled={!searchTerm.trim()}
          >
            Искать
          </Button>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
            <Spinner />
          </div>
        ) : (
          <div className="openings-list">
            {filteredOpenings.length > 0 ? (
              filteredOpenings.map(opening => (
                <Cell
                  key={opening.id}
                  content={<Body1>{opening.name}</Body1>}
                  onClick={() => {
                    onSelectOpening(opening);
                    onClose();
                  }}
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
                color: 'var(--plasma-colors-secondary)',
                padding: '12px'
              }}>
                {searchTerm && !isLoading 
                  ? 'Ничего не найдено. Попробуйте другой запрос' 
                  : 'Загрузка дебютов...'}
              </Body1>
            )}
          </div>
        )}

        <div style={{ 
          marginTop: '16px', 
          display: 'flex', 
          justifyContent: 'flex-end'
        }}>
          <Button view="secondary" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </Card>
    </div>
  );
}