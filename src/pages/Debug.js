import React from 'react';
import { useWebSocket } from '../components/WebSocketContext';

const DebugPage = () => {
  const { logMessages } = useWebSocket();

  return (
    <div>
      <div>
        {logMessages.length === 0 ? (
          <p>No log messages</p>
        ) : (
          <ul>
            {logMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DebugPage;