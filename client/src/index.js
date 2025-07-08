import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 创建一个自定义主题 (可选, 但推荐)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // 一个经典的蓝色
    },
    secondary: {
      main: '#dc004e', // 一个醒目的粉色
    },
    background: {
      default: '#f4f6f8', // 一个柔和的灰色背景
    },
  },
  typography: {
    fontFamily: 'Roboto, Inter, sans-serif',
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);