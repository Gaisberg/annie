import React, { useContext } from 'react';
import { BackendContext } from './App';
import AppBar from './components/AppBar';
import { useAlert } from './components/AlertContext';
import { Route, Routes } from 'react-router-dom';
import MediaList from './components/MediaList';
import LibraryPage from './pages/Library';
import SettingsPage from './pages/Settings';
import useWebSocket from './components/useWebSocket';
import DebugPage from './pages/Debug';

const Content = () => {
    useWebSocket();

  // const handleWebSocketMessage = (event) => {
  //   const message = JSON.parse(event.data);
  //   if (!message) return;
  //   if (message.type === 'health') {
  //     setBackendStatus(message.status === 'running');
  //   } else if (message.type === 'item_update') {
  //       let data = JSON.parse(message.status)
  //       addAlert('Item "' + data.title + '" updated to state "' + data.state + '"');
  //   }
  // };

  // useEffect(() => {
  //   const establishWebSocket = () => {
  //     if (isValidUrl(backendUrl)) {
  //       const { closeWebSocket } = createWebSocket(
  //         `${backendUrl.replace(/^http/, 'ws')}/ws`,
  //         () => {
  //           addAlert('WebSocket connection established');
  //           setBackendStatus(true);
  //         },
  //         handleWebSocketMessage,
  //         (message) => {
  //           addAlert(message, 'error');
  //           setBackendStatus(false);
  //         },
  //         () => {
  //           setBackendStatus(false);
  //         },
  //         () => {
  //           addAlert('WebSocket connection closed');
  //           setBackendStatus(false);
  //         }
  //       );

  //       return closeWebSocket;
  //     }
  //   };

  //   const closeWebSocket = establishWebSocket();

  //   return () => {
  //     if (closeWebSocket) closeWebSocket();
  //   };
  // }, [backendUrl]);

  return (
    <div>
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