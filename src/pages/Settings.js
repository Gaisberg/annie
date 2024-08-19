import React, { useState, useEffect, useContext, useCallback } from 'react';
import { TextField, Button, Box, Checkbox, FormControlLabel, Typography, Accordion, AccordionSummary, AccordionDetails, IconButton, CircularProgress } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { BackendContext } from '../App';
import axios from 'axios';
import { useAlert } from '../components/AlertContext';
import { debounce } from 'lodash';

function SettingsPage() {
  const { backendUrl} = useContext(BackendContext);
  const [ loading, setLoading ] = useState(true);
  const [settings, setSettings] = useState({});
  const { addAlert } = useAlert();

  useEffect(() => {
    setLoading(true);
      axios.get(`${backendUrl}/settings/get/all`)
        .then(response => {
          setSettings(response.data.data);
          setLoading(false);
        })
        .catch(error => {
          console.error(error);
          addAlert('Failed to fetch settings', 'error');
          setLoading(false);
        });
  }, [backendUrl]);

  const handleInputChange = (keyPath, value) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings };
      const keys = keyPath.split('.');
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      current[lastKey] = value;

      return newSettings;
    });
  };

  const handleArrayChange = (keyPath, index, value) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings };
      const keys = keyPath.split('.');
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      const newArray = [...current[lastKey]];
      newArray[index] = value;
      current[lastKey] = newArray;

      return newSettings;
    });
  };

  const addArrayItem = (keyPath) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings };
      const keys = keyPath.split('.');
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      current[lastKey] = Array.isArray(current[lastKey]) ? [...current[lastKey], ''] : [''];

      return newSettings;
    });
  };

  const removeArrayItem = (keyPath, index) => {
    setSettings(prevSettings => {
      const newSettings = { ...prevSettings };
      const keys = keyPath.split('.');
      let current = newSettings;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      const lastKey = keys[keys.length - 1];
      current[lastKey] = current[lastKey].filter((_, i) => i !== index);

      return newSettings;
    });
  };

  const saveSettings = () => {
    try {
      if (backendUrl) {
        axios.post(`${backendUrl}/settings/set/all`, settings)
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

  const renderInput = (key, value, keyPath = key) => {
    if (key === 'version') {
      return (
        <Typography key={key} variant="body1">
          {key}: {value}
        </Typography>
      );
    }

    if (Array.isArray(value)) {
      return (
        <Box key={key} sx={{ marginBottom: 2 }}>
          <Typography variant="h6">{key}</Typography>
          {value.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
              <TextField
                value={item}
                onChange={(e) => handleArrayChange(keyPath, index, e.target.value)}
                fullWidth
                margin="normal"
              />
              <IconButton onClick={() => removeArrayItem(keyPath, index)}>
                <RemoveIcon />
              </IconButton>
            </Box>
          ))}
          <Button variant="outlined" onClick={() => addArrayItem(keyPath)} startIcon={<AddIcon />}>
            Add Item
          </Button>
        </Box>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <Accordion key={key}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{key}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {Object.entries(value).map(([subKey, subValue]) => renderInput(subKey, subValue, `${keyPath}.${subKey}`))}
          </AccordionDetails>
        </Accordion>
      );
    }

    switch (typeof value) {
      case 'string':
        return (
          <TextField
            key={key}
            label={key}
            value={value}
            onChange={(e) => handleInputChange(keyPath, e.target.value)}
            fullWidth
            margin="normal"
          />
        );
      case 'boolean':
        return (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={value}
                onChange={(e) => handleInputChange(keyPath, e.target.checked)}
              />
            }
            label={key}
          />
        );
      case 'number':
        return (
          <TextField
            key={key}
            label={key}
            type="number"
            value={value}
            onChange={(e) => handleInputChange(keyPath, e.target.value)}
            fullWidth
            margin="normal"
          />
        );
      default:
        return null;
    }
  };

  const generalSettings = Object.entries(settings).filter(([key, value]) => typeof value !== 'object' || value === null);
  const nestedSettings = Object.entries(settings).filter(([key, value]) => typeof value === 'object' && value !== null);

  return (
    <div className="custom-scrollbar">
      <Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {generalSettings.length > 0 && (
              <Box>
                <Typography variant="h6">General Settings</Typography>
                {generalSettings.map(([key, value]) => renderInput(key, value))}
              </Box>
            )}
            {nestedSettings.map(([key, value]) => renderInput(key, value))}
            <Button variant="contained" color="primary" onClick={saveSettings}>
              Save Settings
            </Button>
          </>
        )}
      </Box>
    </div>
  );
}

export default SettingsPage;