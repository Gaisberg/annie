import React, { createContext, useContext, useEffect, useState } from 'react';
import createWebSocket from '../utils/webSocketHandler';
import isValidUrl from '../utils/isValidUrl';
import { useAlert } from '../components/AlertContext';
import { BackendContext } from '../App';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const { backendUrl, setBackendStatus } = useContext(BackendContext);
    const { addAlert } = useAlert();
    const [logMessages, setLogMessages] = useState([]);
    const [items, setItems] = useState([]);

    const handleWebSocketMessage = (event) => {
        const message = JSON.parse(event.data);
        if (!message) return;
        if (message.type === 'health') {
            setBackendStatus(message.status === 'running');
        } else if (message.type === 'item_update') {
            let data = JSON.parse(message.item);
            addAlert('Item "' + data.title + '" updated to state "' + data.state + '"');
            setItems(prevItems => {
                const newItems = [...prevItems, data];
                if (newItems.length > 10) {
                    newItems.shift(); // Remove the oldest item if the length exceeds 10
                }
                return newItems;
            });
        } else if (message.type === 'log') {
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

    return (
        <WebSocketContext.Provider value={{ items, logMessages }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};