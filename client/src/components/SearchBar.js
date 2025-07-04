import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <div className="search-input-group">
          <input
            type="text"
            placeholder="搜索灵感、知识、任务、目标..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">搜索</button>
          {searchTerm && (
            <button type="button" onClick={handleClear} className="clear-btn">清除</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchBar;