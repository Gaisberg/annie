import React from 'react';
import AppBar from './components/AppBar';
import { Route, Routes } from 'react-router-dom';
import MediaList from './components/MediaList';
import LibraryPage from './pages/Library';
import SettingsPage from './pages/Settings';
import DebugPage from './pages/Debug';

const Content = () => {

  return (
    <div className="parent-container">
      <AppBar position="static">
      </AppBar>
        <Routes>
          <Route path="/" element={<MediaList type="movie" />} />
          <Route path="/movies" element={<MediaList type="movie" />} />
          <Route path="/shows" element={<MediaList type="show" />} />
          <Route path="/library/:imdb_id" element={<LibraryPage />} />
          <Route path="/debug" element={<DebugPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
    </div>

  );
};

export default Content;