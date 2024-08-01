import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BackendContext } from '../App';
import { useAlert } from '../components/AlertContext';
import { Typography, Table, Grid, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Accordion, AccordionSummary, AccordionDetails, Box } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import ScrapeResultsModal from '../components/ScrapeResults';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useWebSocket } from '../components/WebSocketContext';

const LibraryPage = () => {
  const { imdb_id } = useParams();
  const { backendUrl } = useContext(BackendContext);
  const { items } = useWebSocket();
  const [item, setItem] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const { addAlert } = useAlert();
  const addAlertRef = useRef(addAlert); // Store addAlert in a ref
  const [scrapeResults, setScrapeResults] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState({ reset: false, scrape: false, retry: false });
  const [currentItem, setCurrentItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${backendUrl}/items?search=${imdb_id}&extended=true`)
      .then(response => {
        setItem(response.data.items[0]);
      })
      .catch(error => {
        console.error('Failed to fetch extended item information', error);
        addAlertRef.current('Failed to fetch item information', 'error'); // Use the ref to access addAlert
      });
  }, [imdb_id, backendUrl, resetTrigger]); // Remove addAlert from dependency array

  useEffect(() => {
    if (items.length > 0 && item) {
      const updatedItem = items.find(i => i.id === item.id);
      if (updatedItem) {
        setItem(updatedItem);
      }
    }
  }, [items, item]);

  if (!item) return null;

  const imageUrl = `https://images.metahub.space/poster/small/${item.imdb_id}/img`;

  const handleReset = (item) => {
    setLoading(prev => ({ ...prev, reset: true }));
    axios.post(`${backendUrl}/items/reset?ids=${item.id}`)
      .then(() => {
        addAlert(`${item.id} reset successfully`, 'success');
        setResetTrigger(prev => !prev)
      })
      .catch(error => {
        console.error(error);
        addAlert(`Failed to reset ${item.id}`, 'error');
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, reset: false }));
      });
  };

  const handleScrape = (item) => {
    setLoading(prev => ({ ...prev, scrape: true }));
    setCurrentItem(item);
    axios.get(`${backendUrl}/items/cached?ids=${item.id}`)
      .then(response => {
        setScrapeResults(response.data.data); // Assuming the response contains a 'results' array
        setIsModalOpen(true);
      })
      .catch(error => {
        console.error(error);
        addAlert('Failed to initiate scrape', 'error');
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, scrape: false }));
      });
  };

  const handleRetry = (item) => {
    setLoading(prev => ({ ...prev, retry: true }));
    axios.post(`${backendUrl}/items/retry?ids=${item.id}`)
      .then(() => {
        addAlert('Retry initiated successfully', 'success');
      })
      .catch(error => {
        console.error(error);
        addAlert('Failed to initiate retry', 'error');
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, retry: false }));
      });
  };

  const handleDownload = (item, hash) => {
    setIsModalOpen(false);
    axios.post(`${backendUrl}/items/download?id=${item.id}&hash=${hash}`)
      .then(() => {
        addAlert('Download initiated successfully', 'success');
      })
      .catch(error => {
        console.error(error);
        addAlert('Failed to initiate download', 'error');
      })
  };

  const ButtonRow = ({ item }) => {
    return (
      <div>
        <LoadingButton color="error" variant="outlined" loading={loading.reset} onClick={() => handleReset(item)}>Reset</LoadingButton>
        <LoadingButton variant="outlined" loading={loading.scrape} onClick={() => handleScrape(item)}>Scrape</LoadingButton>
        <LoadingButton variant="outlined" loading={loading.retry} onClick={() => handleRetry(item)}>Retry</LoadingButton>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <IconButton variant="outlined" onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
      </div>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        minHeight="100vh"
        minWidth="100vw"
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <img src={imageUrl} alt={item.title} style={{ width: '200px', height: 'auto' }} />
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box display="flex" flexDirection="column" justifyContent="center" height="100%">
              <Typography variant="h5" component="div">
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {item.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                File: {item.file}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Requested At: {item.requested_at}
              </Typography>
              <ButtonRow item={item} />
            </Box>
          </Grid>
          <Grid item xs={12}>
            {item.type === 'Show' && (
              <div>
                {item.seasons.map((season, seasonIndex) => (
                  <Accordion key={seasonIndex}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={4}>
                          <Typography>{season.title}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography color="text.secondary">{season.state}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <ButtonRow item={season} />
                        </Grid>
                      </Grid>
                    </AccordionSummary>
                    <AccordionDetails>
                      {season.episodes.map((episode, episodeIndex) => (
                        <Accordion key={episodeIndex}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={4}>
                                <Typography>{episode.number}</Typography>
                                <Typography color="text.secondary">{episode.title}</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <Typography color="text.secondary">{episode.state}</Typography>
                              </Grid>
                              <Grid item xs={4}>
                                <ButtonRow item={episode} />
                              </Grid>
                            </Grid>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography>ID: {episode.id}</Typography>
                            <Typography>File: {episode.file}</Typography>
                            <Typography>Requested At: {episode.requested_at}</Typography>

                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </div>
            )}
          </Grid>
        </Grid>
      </Box>
      <ScrapeResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={currentItem}
        results={scrapeResults}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default LibraryPage;