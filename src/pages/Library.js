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
  const prevItemsRef = useRef(items);
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
  }, [prevItemsRef, imdb_id, backendUrl, resetTrigger]); // Remove addAlert from dependency array

  useEffect(() => {
    if (items.length > 0 && item) {
      const updatedItem = items.find(i => i.id === item.id);
      if (updatedItem) {
        setItem(updatedItem);
      }
    }
    prevItemsRef.current = items; // Update the ref to the current items
  }, [items, item]);

  if (!item) return null;

  const backgroundUrl = `https://images.metahub.space/background/large/${item.imdb_id}/img`;

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
        <Box sx={{ display: 'inline-block', marginRight: 2 }}>
          <LoadingButton color="error" variant="outlined" loading={loading.reset} onClick={() => handleReset(item)}>Reset</LoadingButton>
        </Box>
        <Box sx={{ display: 'inline-block', marginRight: 2 }}>
          <LoadingButton variant="outlined" loading={loading.retry} onClick={() => handleRetry(item)}>Retry</LoadingButton>
        </Box>
      </div>
    );
  };

  return (
    <div className="custom-scrollbar">

      <Box sx={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
        {/* Header Section */}
        
        <Box
          sx={{
            width: '100%',
            height: '30vh',
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: 2,
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            height="100%"
            sx={{
              // backgroundColor: 'rgba(128, 128, 128, 0.5)', // 50% gray overlay
              backdropFilter: 'blur(10px)', // Blur effect
              padding: 2,
              borderRadius: '16px', // Rounded corners
              position: 'relative',
              zIndex: 2, // Ensure content is above the overlay
            }}
            
          >

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
            <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
              <LoadingButton color="error" variant="outlined" loading={loading.reset} onClick={() => handleReset(item)}>Reset</LoadingButton>
              <LoadingButton variant="outlined" loading={loading.retry} onClick={() => handleRetry(item)}>Retry</LoadingButton>
            </Box>
          </Box>
        </Box>
        <Box sx={{ padding: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Accordion key="streams">
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Streams
                </AccordionSummary>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Stream ID</TableCell>
                        <TableCell>Stream Title</TableCell>
                        <TableCell>Stream Hash</TableCell>
                        <TableCell>Stream Blacklisted</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {item.streams && item.streams.length > 0 && item.streams.map((stream, streamIndex) => (
                        <TableRow
                          key={streamIndex}
                          style={item.active_stream && {
                            fontWeight: stream._id === item.active_stream.id ? 'bold' : 'normal'
                          }}
                        >
                          <TableCell>{stream._id}</TableCell>
                          <TableCell>{stream.raw_title}</TableCell>
                          <TableCell>{stream.infohash}</TableCell>
                          <TableCell>{stream.blacklisted ? 'Yes' : 'No'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Accordion>
            </Grid>
            <Grid item xs={12}>
              {item.type === 'Show' && (
                <div>
                  {item.seasons && item.seasons.map((season, seasonIndex) => (
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
      </Box>
    </div>
  );
};

export default LibraryPage;