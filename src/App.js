import React, { useState, useEffect, createContext } from 'react';
import theme from './Theme';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AlertProvider } from './components/AlertContext';
import Content from './Content';

// Create a context
export const BackendContext = createContext();

function App() {
  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem('backendUrl') || '';
  });

  const [backendStatus, setBackendStatus] = useState(false);


  useEffect(() => {
    localStorage.setItem('backendUrl', backendUrl);
  }, [backendUrl]);
  
  return (
    <ThemeProvider theme={theme}>
      <BackendContext.Provider value={{ backendUrl, setBackendUrl, backendStatus, setBackendStatus }}>
        <AlertProvider>
            <Router>
              <Content />
            </Router>
        </AlertProvider>
      </BackendContext.Provider>
    </ThemeProvider>
  );
}

export default App;