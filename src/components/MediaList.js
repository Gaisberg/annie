import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { TextField, List, ListItemText, IconButton, InputAdornment, CircularProgress } from '@mui/material';
import { BackendContext } from '../App';
import { useAlert } from './AlertContext';
import ListItemButton from '@mui/material/ListItemButton';
import { useNavigate } from 'react-router-dom';
import TraktLogo from '../assets/trakt-icon-red.svg';
import axios from 'axios';

const MediaList = ({ type }) => {
  const { backendUrl, backendStatus } = useContext(BackendContext);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [traktResults, setTraktResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { addAlert } = useAlert();
  const navigate = useNavigate();
  const observer = useRef();

  useEffect(() => {
    if (!backendStatus) return;
    setLoading(true);
    axios.get(`${backendUrl}/items?type=${type}&page=${page}&limit=10`)
      .then(response => {
        setItems(prevItems => {
          const newItems = response.data.items.filter(item => 
            !prevItems.some(prevItem => prevItem.id === item.id)
          );
          return [...prevItems, ...newItems];
        });
        setHasMore(response.data.items.length > 0);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        addAlert(`Failed to fetch ${type}s`, 'error');
        setLoading(false);
      });
  }, [type, backendUrl, addAlert, backendStatus, page]);

  useEffect(() => {
    setSearch('');
    setTraktResults([]);
    setItems([]); 
    setPage(1); 
  }, [type]);

  useEffect(() => {
    setTraktResults([]);
  }, [search]);

  const handleItemClick = (item) => {
    navigate(`/library/${item.imdb_id}`);
  };

  const handleTraktItemClick = (item) => {
    axios.post(`${backendUrl}/items/add?imdb_ids=${item.ids.imdb}`)
      .then(response => {
        addAlert('Item added successfully', 'success');
      })
      .catch(error => {
        console.error(error);
        addAlert('Failed to add item', 'error');
      });
  };

  const handleTraktSearch = () => {
    setLoading(true);
    const searchQuery = search.split(',').map(term => term.trim()).join('+');
    axios.get(`https://api.trakt.tv/search/${type}?query=${searchQuery}`, {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': '0183a05ad97098d87287fe46da4ae286f434f32e8e951caad4cc147c947d79a3'
      }
    })
      .then(response => {
        if (response.data) {
          console.log(response.data);
          // Filter out items that are already in the items list by imdb_id
          const filteredResults = response.data.filter(result => {
            const traktItem = result[type];
            return traktItem.ids.imdb && !items.some(item => item.imdb_id === traktItem.ids.imdb);
          });
          setTraktResults(filteredResults);
        } else {
          setTraktResults([]);
        }
      })
      .catch(error => {
        console.error(error);
        addAlert('Failed to fetch Trakt results', 'error');
      })
      .finally(() => setLoading(false));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleTraktSearch();
    }
  };

  useEffect(() => {
    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [search]);

  const handleLinkClick = (event, url) => {
    event.stopPropagation();
    window.open(url, '_blank');
    setTraktResults([]); // Clear results
  };

  const lastItemRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);


  const filteredItems = search
    ? items.filter(item => {
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
    <>

      <TextField
        variant="outlined"
        placeholder={`Search ${type.charAt(0).toUpperCase() + type.slice(1)}s (e.g., title, ID, state)`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              {loading ? <CircularProgress size={24} /> : 'Press enter for Trakt results'}
            </InputAdornment>
          ),
        }}
      />
      <div className="custom-scrollbar">
      <List>
        {filteredItems.map((item, index) => {
          if (items.length === index + 1) {
            return (
              <ListItemButton ref={lastItemRef} key={item.id} onClick={() => handleItemClick(item)}>
                <ListItemText primary={item.title} secondary={item.state} />
              </ListItemButton>
            );
          } else {
            return (
              <ListItemButton key={item.id} onClick={() => handleItemClick(item)}>
                <ListItemText primary={item.title} secondary={item.state} />
              </ListItemButton>
            );
          }
        })}
        {traktResults
          .filter(result => result.type === type)
          .map(result => (
            <ListItemButton key={result[type].ids.trakt} onClick={() => handleTraktItemClick(result[type])}>
              <ListItemText 
                primary={`${result[type].title}`} 
                secondary={`${result[type].year} | IMDb: ${result[type].ids.imdb}`} 
              />
              <IconButton
              edge="end"
              aria-label="open in new"
              onClick={(e) => handleLinkClick(e, `https://trakt.tv/${type === 'movie' ? 'movies' : 'shows'}/${result[type].ids.trakt}`)}
              >
                           <img src={TraktLogo} alt="Trakt" style={{ width: 24, height: 24 }} />
            </IconButton>
            </ListItemButton>
          ))}
      </List>
      </div>
      </>
  );
};

export default MediaList;