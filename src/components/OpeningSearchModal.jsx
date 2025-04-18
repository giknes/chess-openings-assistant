import { useState, useEffect } from 'react';

export default function OpeningSearchModal ({ 
  isOpen, 
  onClose, 
  onSelectOpening 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openings, setOpenings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/openings?search=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      setOpenings(data);
    } finally {
      setIsLoading(false);
    }
  };

  return isOpen ? (
    <div className="search-modal">
      <div className="search-modal-content">
        <h3>Поиск дебюта</h3>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Название дебюта"
        />
        <button onClick={handleSearch}>Искать</button>
        <button onClick={onClose}>Закрыть</button>
        
        {isLoading ? (
          <div>Загрузка...</div>
        ) : (
          <div className="openings-list">
            {openings.map(opening => (
              <div 
                key={opening.id}
                onClick={() => onSelectOpening(opening)}
              >
                {opening.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : null;
};