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
import {FastAverageColor} from 'fast-average-color';

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
  const [textColor, setTextColor] = useState('#000'); // Default text color


  useEffect(() => {
    axios.get(`${backendUrl}/items?search=${imdb_id}&extended=true`)
      .then(response => {
        console.log(response.data.items[0]);
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

  const backgroundUrl = `https://images.metahub.space/background/large/${imdb_id}/img`;

  // useEffect(() => {
  //   if (backgroundUrl) {
  //     const fac = new FastAverageColor();
  //     fac.getColorAsync(backgroundUrl)
  //       .then(color => {
  //         const [r, g, b] = color.value;
  //         const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  //         const textColor = brightness > 125 ? '#000' : '#fff'; // Choose black or white text based on brightness
  //         setTextColor(textColor);
  //       })
  //       .catch(e => {
  //       });
  //   }
  // }, [backgroundUrl]);

  if (!item) return null;


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
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            padding: 2,
          }}
        >

          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            height="100%"
            sx={{
              backgroundColor: 'rgba(128, 128, 128, 0.5)', // 50% gray overlay
              backdropFilter: 'blur(10px)', // Blur effect
              padding: 2,
              borderRadius: '16px', // Rounded corners
              position: 'relative',
              zIndex: 2, // Ensure content is above the overlay
            }}
          >
          <IconButton
            onClick={() => navigate(`/${item.type}s`)}
            sx={{
              zIndex: 3, // Ensure the button is above other elements
            }}
          >
            <ArrowBackIcon />
          </IconButton>

            <Typography variant="h5" component="div" color={textColor}>
              {item.title}
            </Typography>
            <Typography variant="body2" color={textColor}>
              ID: {item.id}
            </Typography>
            <Typography variant="body2" color={textColor}>
              File: {item.file}
            </Typography>
            <Typography variant="body2" color={textColor}>
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
                          style={item.active_stream && stream.infohash === item.active_stream.hash ? { backgroundColor: 'gray', fontWeight: "bold" } : {}}
                        >
                          <TableCell>{stream._id} </TableCell>
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