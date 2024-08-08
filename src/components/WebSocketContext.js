import createWebSocket from '../utils/webSocketHandler';
import isValidUrl from '../utils/isValidUrl';
import { useAlert } from '../components/AlertContext';
import { BackendContext } from '../App';
import { useState, useEffect, useContext, createContext, useRef } from 'react';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const { backendUrl, setBackendStatus } = useContext(BackendContext);
    const { addAlert } = useAlert();
    const [logMessages, setLogMessages] = useState([]);
    const [items, setItems] = useState([]);
    const webSocketRef = useRef(null);
    const retryIntervalRef = useRef(null);
    const [alertShown, setAlertShown] = useState(false);

    const handleWebSocketMessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(message)
        if (!message) return;
        if (message.type === 'health') {
            setBackendStatus(message.status === 'running');
        } else if (message.type === 'item_update') {
            let data = JSON.parse(message.item);
            addAlert('Item "' + data.title + '" updated to state "' + data.state + '"');
            if (items) {
                setItems(items.map(item => item.id === data.id ? data : item));
            }
        } else if (message.type === 'log') {
            setLogMessages(prevLogs => [...prevLogs, message.status]);
        }
    };

    const isWebSocketConnected = () => {
        return webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN;
    };

    useEffect(() => {
        const establishWebSocket = () => {
            if (isValidUrl(backendUrl)) {
                const { closeWebSocket, webSocket } = createWebSocket(
                    `${backendUrl.replace(/^http/, 'ws')}/ws`,
                    () => {
                        addAlert('WebSocket connection established');
                        setBackendStatus(true);
                        clearInterval(retryIntervalRef.current); // Clear retry interval on successful connection
                        retryIntervalRef.current = null;
                        setAlertShown(false); // Reset alert shown state on successful connection
                    },
                    handleWebSocketMessage,
                    (message) => {
                        if (isWebSocketConnected()) {
                            addAlert(message, 'error');
                        }
                        setBackendStatus(false);
                    },
                    () => {
                        if (!alertShown) {
                            addAlert('Lost websocket connection, retrying...', "error");
                            setAlertShown(true); // Set alert shown state to true
                        }
                        setBackendStatus(false);
                        retryConnection(); // Retry connection on close
                    }
                );

                webSocketRef.current = webSocket;
                return closeWebSocket;
            }
        };

        const retryConnection = () => {
            if (!retryIntervalRef.current) {
                retryIntervalRef.current = setInterval(() => {
                    if (!isWebSocketConnected()) {
                        establishWebSocket();
                    }
                }, 2000);
            }
        };

        const closeWebSocket = establishWebSocket();
        retryConnection();

        return () => {
            clearInterval(retryIntervalRef.current);
            if (closeWebSocket) closeWebSocket();
        };
    }, [backendUrl]);

    return (
        <WebSocketContext.Provider value={{ logMessages, items }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};