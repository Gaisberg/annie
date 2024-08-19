import React from 'react';
import AppBar from './components/AppBar';
import { Route, Routes } from 'react-router-dom';
import MediaList from './components/MediaList';
import LibraryPage from './pages/Library';
import SettingsPage from './pages/Settings';
import DebugPage from './pages/Debug';
import { BackendContext } from './App';
import { Typography, Box } from '@mui/material';

const Content = () => {
  const { backendStatus } = React.useContext(BackendContext);

  return (
    <div className="parent-container">
      <AppBar position="static" />
      {backendStatus === "running"  && (
        <Routes>
          <Route path="/" element={<MediaList type="movie" />} />
          <Route path="/movies" element={<MediaList type="movie" />} />
          <Route path="/shows" element={<MediaList type="show" />} />
          <Route path="/library/:imdb_id" element={<LibraryPage />} />
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      )}
      {backendStatus === "paused" && (
        <Routes>
          <Route path="/" element={<SettingsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/debug" element={<DebugPage />} />
        </Routes>
      )}
      {backendStatus === "stopped" && (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Typography variant="h4">Cant connect to backend</Typography>
        </Box>
      )}
    </div>
  );
};

export default Content;