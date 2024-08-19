import React, { useState, useEffect, useContext, useRef } from 'react';
import { TextField } from '@mui/material';
import { BackendContext } from '../App';
import { WebSocketContext } from '../components/WebSocketContext';

const DebugPage = () => {
  const { logMessages } = useContext(WebSocketContext);
  const { backendUrl } = useContext(BackendContext);
  const [logs, setLogs] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const logContainerRef = useRef(null);

  useEffect(() => {
    setLogs([]);
    // Fetch initial logs from /logs endpoint
    fetch(`${backendUrl}/logs`)
      .then(response => response.json())
      .then(data => {
        const splitLogs = data.logs.split('\n');
        setLogs(splitLogs);
      })
      .catch(error => console.error('Error fetching logs:', error));
  }, [backendUrl]);

  useEffect(() => {
    // Append new log messages from WebSocket to the logs state
    setLogs(prevLogs => [...prevLogs, ...logMessages]);
  }, [logMessages]);

  const handleSearchChange = (event) => {
    setSearchKeyword(event.target.value);
  };
  

  const filteredLogs = logs.filter(log => log.toLowerCase().includes(searchKeyword.toLowerCase()));

  return (
    <div className="custom-scrollbar">
      <TextField
        variant="outlined"
        placeholder="Search logs..."
        value={searchKeyword}
        onChange={(e) => handleSearchChange(e)}
        fullWidth
      />
      <div ref={logContainerRef} >
        <div>
          {filteredLogs.length === 0 ? (
            <p>No log messages</p>
          ) : (
            <ul>
              {filteredLogs.map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPage;