import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { TextField, List, ListItemText } from '@mui/material';
import { BackendContext } from '../App';
import { useAlert } from './AlertContext';
import ListItemButton from '@mui/material/ListItemButton';
import { useNavigate } from 'react-router-dom';

const MediaList = ({ type }) => {
  const { backendUrl, backendStatus } = useContext(BackendContext);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const { addAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    if (!backendStatus) return;
    axios.get(`${backendUrl}/items?type=${type}`)
      .then(response => {
        setItems(response.data.items);
      })
      .catch(error => {
        console.error(error);
        addAlert(`Failed to fetch ${type}s`, 'error');
      });
  }, [type, backendUrl, addAlert, backendStatus]);

  const handleItemClick = (item) => {
    navigate(`/library/${item.imdb_id}`);
  };

  const filteredItems = search
    ? items.filter(item => {
      console.log(item)
        const searchTerms = search.toLowerCase().split(',').map(term => term.trim());
        return searchTerms.every(term =>
          item.title.toLowerCase().includes(term) ||
          item.id.toLowerCase().includes(term) ||
          item.state.toLowerCase().includes(term) ||
          item.imdb_id.toLowerCase().includes(term)
        );
      })
    : items;

  return (
    <div>
      <TextField
        variant="outlined"
        placeholder={`Search ${type.charAt(0).toUpperCase() + type.slice(1)}s (e.g., title, ID, state)`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{
          marginLeft: '-8px',
          marginRight: '-8px',
          width: 'calc(100% + 16px)',
        }}
      />
      <List>
        {filteredItems.map(item => (
          <ListItemButton key={item.imdb_id} onClick={() => handleItemClick(item)}>
            <ListItemText primary={item.title} secondary={item.state}/>
          </ListItemButton>
        ))}
      </List>
    </div>
  );
};

export default MediaList;