import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { v4 as uuidv4 } from 'uuid'; // Import UUID library

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = (message, severity = 'info', customComponent = null, sticky = false) => {
    const id = uuidv4();
    setAlerts((prevAlerts) => [
      ...prevAlerts,
      { id, message, severity, customComponent, sticky }, // Add sticky property to alert object
    ]);
    return id; // Return the ID of the newly created alert
  };

  const updateAlert = (id, message, severity = 'info', customComponent = null, sticky = false) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === id ? { ...alert, message, severity, customComponent, sticky } : alert
      )
    );
  };

  const removeAlert = (id) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ addAlert, updateAlert }}>
      {children}
      {alerts.map((alert, index) => (
        <Snackbar
          key={alert.id}
          open={true}
          autoHideDuration={alert.sticky ? null : 3000} // Use sticky property to control autoHideDuration
          onClose={() => removeAlert(alert.id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          style={{ bottom: `${index * 60}px` }} // Adjust the offset based on the index
        >
          {alert.customComponent ? (
            React.cloneElement(alert.customComponent, { onClose: () => removeAlert(alert.id) })
          ) : (
            <Alert onClose={() => removeAlert(alert.id)} severity={alert.severity}>
              {alert.message}
            </Alert>
          )}
        </Snackbar>
      ))}
    </AlertContext.Provider>
  );
};