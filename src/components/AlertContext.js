import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { v4 as uuidv4 } from 'uuid'; // Import UUID library

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, severity = 'info') => {
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      { id: uuidv4(), message, severity }, // Use UUID for unique IDs
    ]);
  };

  const removeAlert = (id) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ addAlert }}>
      {children}
      {alerts.map((alert, index) => (
        <Snackbar
          key={alert.id}
          open={true}
          autoHideDuration={3000}
          onClose={() => removeAlert(alert.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          style={{ bottom: `${index * 60}px` }} // Adjust the offset based on the index
        >
          <Alert onClose={() => removeAlert(alert.id)} severity={alert.severity}>
            {alert.message}
          </Alert>
        </Snackbar>
      ))}
    </AlertContext.Provider>
  );
};