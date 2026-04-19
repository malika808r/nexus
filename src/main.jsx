import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from 'next-themes';

// ВОТ ЗДЕСЬ ПРАВИЛЬНЫЙ ПУТЬ К ТВОЕЙ ПАПКЕ:
import './i18n/config'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);