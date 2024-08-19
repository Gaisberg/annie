// ThemeContext.js
import React, { createContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export const ThemeContext = createContext();

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
});

export const ThemeContextProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('isDarkTheme');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  const theme = useMemo(() => (isDarkTheme ? darkTheme : lightTheme), [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => {
      const newTheme = !prevTheme;
      localStorage.setItem('isDarkTheme', JSON.stringify(newTheme));
      return newTheme;
    });
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('isDarkTheme');
    if (savedTheme !== null) {
      setIsDarkTheme(JSON.parse(savedTheme));
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};