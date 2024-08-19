// import { useAlert } from '../components/AlertContext';
import { BackendContext } from '../App';
import useWebSocket, { ReadyState} from 'react-use-websocket';
import { useState, useEffect, useContext, createContext} from 'react';

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({children}) => {
    const { backendUrl, setBackendStatus } = useContext(BackendContext);
    const [items, setItems] = useState([]);
    const [logMessages, setLogMessages] = useState([]);
    const [events, setEvents] = useState({running: [], queued: []});
    const { readyState } = useWebSocket(backendUrl + '/ws',
        {
            onMessage: (event) => handleWebSocketMessage(event),
            shouldReconnect: (closeEvent) => true,
            reconnectAttempts: 10,
            reconnectInterval: (attemptNumber) =>
              Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
        }
    );

    const handleWebSocketMessage = (event) => {
        const message = JSON.parse(event.data);
        // console.log(message);
        if (!message) return;
        if (message.type === 'health') {
            setBackendStatus(message.status);
        } else if (message.type === 'item_update') {
            let data = JSON.parse(message.item);
            if (items) {
                setItems(items.map(item => item.id === data.id ? data : item));
            }
        } else if (message.type === 'log') {
            setLogMessages(prevLogs => [...prevLogs, message.message]);
        } else if (message.type === 'event_update') {
            // setEvents({running: message.message.running, queued: message.message.queued});
        }
    };

    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
            setBackendStatus('running');
        } else {
            setBackendStatus('stopped');
        }
    }, [readyState, setBackendStatus]);

    return (
        <WebSocketContext.Provider value={{ items, logMessages, events }}>
            {children}
        </WebSocketContext.Provider>
    );
};