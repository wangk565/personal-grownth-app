import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

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
    <Box 
      component="form" 
      onSubmit={handleSearch} 
      sx={{ 
        display: 'flex', 
        alignItems: 'center',
        // We can give it a bit of style to blend in
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
        },
        borderRadius: 1,
        p: '2px 4px',
      }}
    >
      <TextField
        variant="standard" // Use standard variant for a cleaner look in the AppBar
        placeholder="搜索..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        fullWidth
        sx={{ 
            color: 'inherit',
            '& .MuiInput-underline:before': { borderBottomColor: 'rgba(255, 255, 255, 0.42)' },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#fff' },
            '& .MuiInputBase-input': { color: '#fff', padding: '8px' },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: '#fff' }} />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} size="small" sx={{ color: '#fff' }}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
    </Box>
  );
};

export default SearchBar;
