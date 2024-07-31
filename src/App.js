import React, { useState, useEffect, createContext } from 'react';
import axios from 'axios';
import theme from './Theme';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider} from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SettingsPage from './pages/Settings';
import { AlertProvider } from './components/AlertContext';
import MediaList from './components/MediaList';
import LibraryPage from './pages/LibraryPage';

// Create a context
export const BackendContext = createContext();

function App() {
  const [backendUrl, setBackendUrl] = useState(() => localStorage.getItem('backendUrl') || '');
  const [backendStatus, setBackendStatus] = useState(false);

  useEffect(() => {
    if (backendUrl) {
      axios.get(`${backendUrl}/health`)
        .then(() => setBackendStatus(true))
        .catch(() => setBackendStatus(false));
    }
  }, [backendUrl]);

  useEffect(() => {
    localStorage.setItem('backendUrl', backendUrl);
  }, [backendUrl]);

  return (
    <ThemeProvider theme={theme}>
      <BackendContext.Provider value={{ backendUrl, backendStatus, setBackendUrl }}>
        <AlertProvider>
        <Router>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Annie
              </Typography>
              <Button color="inherit" component={Link} to="/movies">Movies</Button>
              <Button color="inherit" component={Link} to="/shows">Shows</Button>
              <Button color="inherit" component={Link} to="/settings">Settings</Button>
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Typography variant="outlined" sx={{ mr: 1 }}>
                Backend Status:
                <span style={{ color: backendStatus ? '#00FF00' : 'red' }}>
                  {backendStatus ? 'Running' : 'Not Running'}
                </span>
              </Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Backend URL"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                />
              </Box>
            </Toolbar>
          </AppBar>
          <Routes>
            <Route path="/" element={<MediaList type="movie" />} />
            <Route path="/movies" element={<MediaList type="movie" />} />
            <Route path="/shows" element={<MediaList type="show" />} />
            <Route path="/library/:imdb_id" element={<LibraryPage/>} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Router>
        </AlertProvider>
      </BackendContext.Provider>
    </ThemeProvider>
  );
}

export default App;