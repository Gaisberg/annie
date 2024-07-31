import React, { useState, useEffect, useContext } from 'react';
import { TextField, Button, Box } from '@mui/material';
import { BackendContext } from '../App';
import axios from 'axios';
import { useAlert } from '../components/AlertContext';

function SettingsPage() {
  const { backendUrl, backendStatus } = useContext(BackendContext);
  const [settings, setSettings] = useState('');
  const { addAlert } = useAlert();

  useEffect(() => {
    if (backendStatus) {
      axios.get(`${backendUrl}/settings/get/all`)
        .then(response => setSettings(JSON.stringify(response.data, null, 2)))
        .catch(error => {
          console.error(error);
          addAlert('Failed to fetch settings', 'error');
        });
    }
  }, [backendUrl, addAlert, backendStatus]);

  const saveSettings = () => {
    try {
      const parsedSettings = JSON.parse(settings);
      if (backendUrl) {
        axios.post(`${backendUrl}/settings/set/all`, parsedSettings)
          .then(response => {
            addAlert('Settings saved!', 'success');
            return axios.post(`${backendUrl}/settings/save`);
          })
          .catch(error => {
            console.error(error);
            addAlert('Failed to save settings', 'error');
          });
      }
    } catch (error) {
      addAlert('Invalid JSON format. Please correct the settings.', 'error');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        variant="outlined"
        multiline
        rows={20}
        fullWidth
        value={settings}
        onChange={(e) => setSettings(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={saveSettings} sx={{ mt: 2 }}>
        Save Settings
      </Button>
    </Box>
  );
}

export default SettingsPage;