import { useContext, useEffect, useState, useRef } from 'react';
import { TextField, List, ListItem, Grid, Card, Typography, IconButton, InputAdornment, CircularProgress, Box } from '@mui/material';
import { BackendContext } from '../App';
import { useAlert } from './AlertContext';
import ListItemButton from '@mui/material/ListItemButton';
import { useNavigate } from 'react-router-dom';
import TraktLogo from '../assets/trakt-icon-red.svg';
import ListIcon from '@mui/icons-material/List';
import GridViewIcon from '@mui/icons-material/GridView';
import axios from 'axios';
import debounce from 'lodash';

const MediaList = ({ type }) => {
  const { backendUrl } = useContext(BackendContext);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsLoading, setItemsLoading] = useState(false);
  const [filteredItems, setFilteredItems] = useState(items);
  const [searchloading, setSearchLoading] = useState(false);
  const { addAlert } = useAlert();
  const navigate = useNavigate();
  const [viewType, setViewType] = useState('list'); // 'list' or 'grid'
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const fetching = useRef(false); // To track if a fetch is in progress

  const getItems = async (type, page, query, limit = 30) => {
    try {
      const response = await axios.get(`${backendUrl}/items?type=${type}&page=${page}&limit=${limit}&search=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching items:', error);
      addAlert(`Failed to fetch ${type}s`, 'error');
    }
  };

  const fetchItems = async (type, page) => {
    if (fetching.current) return; // Prevent multiple fetches
    setItemsLoading(true);
    fetching.current = true;
    try {
      const data = await getItems(type, page, searchTerm);
      const { items: newItems, total_pages } = data;
      setItems(prevItems => [...prevItems, ...newItems]);
      setTotalPages(total_pages);
    } catch (error) {
      console.error('Error fetching items:', error);
      addAlert(`Failed to fetch ${type}s`, 'error');
    }
    setItemsLoading(false);
    fetching.current = false;
  };

  const addItem = async (imdb_id) => {
    try {
      await axios.post(`${backendUrl}/items/add?imdb_ids=${imdb_id}`);
      addAlert('Item added successfully', 'success');
    } catch (error) {
      console.error('Error adding item:', error);
      addAlert('Failed to add item', 'error');
    }
  };

  // Fetch items when type changes
  useEffect(() => {
    setItems([]);
    setFilteredItems([]);
    fetchItems(type, 1);
  }, [type]);

  // Fetch items when page changes
  useEffect(() => {
    fetchItems(type, page);
  }, [page]);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom) {
      if (page < totalPages) {
        setPage(page + 1);
      }
    }
  }

  const handleItemClick = async (item) => {
    if (item.trakt) {
      await addItem(item.imdb_id);
      setFilteredItems([]);
      setSearchTerm('');
    }
    else {
      navigate(`/library/${item.imdb_id}`);
    }
  };

  const handleTraktSearch = (search) => {
    setSearchLoading(true);
    axios.get(`https://api.trakt.tv/search/${type}?query=${searchTerm}`, {
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': '0183a05ad97098d87287fe46da4ae286f434f32e8e951caad4cc147c947d79a3'
      }
    })
      .then(response => {
        if (response.data) {

          // Filter out items that are already in the items list by imdb_id
          const filteredResults = response.data.filter(result => {
            const traktItem = result[type];
            return traktItem.ids.imdb && !items.some(item => item.imdb_id === traktItem.ids.imdb);
          });
          const results = filteredResults.map(item => ({
            title: item[type].title,
            imdb_id: item[type].ids.imdb,
            trakt: item[type].ids.trakt,
            year: item[type].year
          }));
          setFilteredItems(results);
        }
      })
      .catch(error => {
        console.error(error);
        addAlert('Failed to fetch Trakt results', 'error');
      }).finally(() => {
        setSearchLoading(false);
      });
  };

  const handleChange = async (event) => {
    setSearchLoading(true);
    setFilteredItems([]);
    setSearchTerm(event.target.value);
    if (event.target.value !== "") {
      try {
        const data = await getItems(type, 1, event.target.value, 10);
        setFilteredItems(data.items);
      } catch (error) {
        console.error('Error fetching filtered items:', error);
        addAlert('Failed to fetch filtered items', 'error');
      }
    }
    setSearchLoading(false);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      // handleTraktSearch(searchTerm);
    }
  }

  const handleLinkClick = (event, url) => {
    event.stopPropagation();
    window.open(url, '_blank');
  };

  return (
    <>
      <Box display="flex" alignItems="center" width="100%">
        <TextField
          variant="outlined"
          placeholder={`Search ${type.charAt(0).toUpperCase() + type.slice(1)}s (e.g., title, ID, state)`}
          onChange={(e) => { debounce(handleChange(e), 500) }}
          onKeyDown={(e) => { handleKeyPress(e) }}
          // onBlur={(e) => { e.target.value = ''; handleChange(e)}}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setViewType(viewType === 'list' ? 'grid' : 'list')}>
                  {viewType === 'list' ? <GridViewIcon /> : <ListIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          style={{ flexGrow: 1 }}
        />

      </Box>
      {searchTerm && (
        <List style={{ backgroundColor: 'gray', border: '1px solid white', width: '100%' }}>
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <ListItem key={item.id} onClick={() => handleItemClick(item)}>
                <ListItemButton>
                  <div>
                    <Typography variant="body1">
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {(item.year || new Date(item.aired_at).getFullYear())} - {item.imdb_id} - {item.state || 'Not in library'}
                    </Typography>
                  </div>
                  {item.trakt && (
                    <IconButton
                      edge="end"
                      aria-label="open in new"
                      onClick={(e) => handleLinkClick(e, `https://trakt.tv/${type === 'movie' ? 'movies' : 'shows'}/${item.trakt}`)}
                    >
                      <img src={TraktLogo
                      } alt="Trakt" style={{ width: 24, height: 24 }} />
                    </IconButton>
                  )}
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            ( searchloading ? (
              <ListItem>
                <CircularProgress />
              </ListItem>
            ) : (
              <ListItem>
              <ListItemButton onClick={() => handleTraktSearch()}>
                <Typography variant="body1">
                  Search from Trakt
                </Typography>
              </ListItemButton>
            </ListItem>
            ))
          )}
        </List>
      )}


      <div className="custom-scrollbar" onScroll={handleScroll}>
        <Box sx={{ marginLeft: '1vw', marginRight: '1vw', marginTop: '1vh' }}>
          {viewType === 'list' ? (
            <List>
              {items.map(item => (
                <ListItem key={item.id} onClick={() => handleItemClick(item)}>
                  <ListItemButton>
                    <div>
                      <Typography variant="h6">
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {new Date(item.aired_at).getFullYear()} - {item.imdb_id} - {item.state || 'Not in library'}
                      </Typography>
                    </div>
                  </ListItemButton>
                  {item.trakt && (
                    <IconButton
                      edge="end"
                      aria-label="open in new"
                      onClick={(e) => handleLinkClick(e, `https://trakt.tv/${type === 'movie' ? 'movies' : 'shows'}/${item.trakt}`)}
                    >
                      <img src={TraktLogo} alt="Trakt" style={{ width: 24, height: 24 }} />
                    </IconButton>
                  )}
                </ListItem>

              ))}
              {itemsLoading && (
                <ListItem>
                  <CircularProgress />
                </ListItem>
              )}
            </List>
          ) : (
            <Grid container spacing={2} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {items.map(item => {
                const backgroundUrl = `https://images.metahub.space/poster/small/${item.imdb_id}/img`;
                return (
                  <Grid item key={item.id} sx={{ display: 'flex' }}>
                    <Card
                      onClick={() => handleItemClick(item)}
                      sx={{
                        borderRadius: '16px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        backgroundImage: `url(${backgroundUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '30vh',
                        width: '100%', // Make the card take full width of the grid item
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                        },
                      }}
                    >
                      {/* <CardContent
                        sx={{
                          bottom: 0,
                          width: '100%',
                          height: '20%',
                          background: 'rgba(0, 0, 0, 0.5)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          borderBottomLeftRadius: '16px',
                          borderBottomRightRadius: '16px',
                        }}
                      > */}
                      {/* <Typography variant="h5" component="div">
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.imdb_id}
                        </Typography> */}
                      {/* </CardContent> */}
                    </Card>
                  </Grid>
                );
              })}
              {itemsLoading && (
                <Card>
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </Box>
                </Card>
              )}
            </Grid>
          )
          }
        </Box>

      </div>
    </>
  );
};

export default MediaList;