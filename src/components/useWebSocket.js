import { useEffect, useContext, useState } from 'react';
import { BackendContext } from '../App';
import createWebSocket from '../utils/webSocketHandler';
import isValidUrl from '../utils/isValidUrl';
import { useAlert } from '../components/AlertContext';

const useWebSocket = () => {
  const { backendUrl, setBackendStatus } = useContext(BackendContext);
  const { addAlert } = useAlert();
  const [logMessages, setLogMessages] = useState([]);

  const handleWebSocketMessage = (event) => {
    const message = JSON.parse(event.data);
    if (!message) return;
    if (message.type === 'health') {
      setBackendStatus(message.status === 'running');
    } else if (message.type === 'item_update') {
      let data = JSON.parse(message.item);
      addAlert('Item "' + data.title + '" updated to state "' + data.state + '"');
    } else if (message.type === 'log') {
        console.log(message)
      setLogMessages(prevLogs => [...prevLogs, message.status]);
    }
  };

  useEffect(() => {
    const establishWebSocket = () => {
      if (isValidUrl(backendUrl)) {
        const { closeWebSocket } = createWebSocket(
          `${backendUrl.replace(/^http/, 'ws')}/ws`,
          () => {
            addAlert('WebSocket connection established');
            setBackendStatus(true);
          },
          handleWebSocketMessage,
          (message) => {
            addAlert(message, 'error');
            setBackendStatus(false);
          },
          () => {
            setBackendStatus(false);
          },
          () => {
            addAlert('WebSocket connection closed');
            setBackendStatus(false);
          }
        );

        return closeWebSocket;
      }
    };

    const closeWebSocket = establishWebSocket();

    return () => {
      if (closeWebSocket) closeWebSocket();
    };
  }, [backendUrl]);

  return { logMessages };
};

export default useWebSocket;