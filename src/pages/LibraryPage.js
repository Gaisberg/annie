import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BackendContext } from '../App';
import { useAlert } from '../components/AlertContext';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import ScrapeResultsModal from '../components/ScrapeResults';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';



const LibraryPage = () => {
  const { imdb_id } = useParams();
  const { backendUrl } = useContext(BackendContext);
  const [item, setItem] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const { addAlert } = useAlert();
  const [scrapeResults, setScrapeResults] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState({ reset: false, scrape: false, retry: false });
  const [currentItem, setCurrentItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${backendUrl}/items?search=${imdb_id}&extended=true`)
      .then(response => {
        console.log(response.data);
        setItem(response.data.items[0]);
      })
      .catch(error => {
        console.error('Failed to fetch extended item information', error);
        addAlert('Failed to fetch item information', 'error');
      });
  }, [imdb_id, backendUrl, addAlert, resetTrigger]);

  if (!item) return null;

  const imageUrl = `https://images.metahub.space/poster/small/${item.imdb_id}/img`;

  const handleReset = (item) => {
    setLoading(prev => ({ ...prev, reset: true }));
    console.log(item);
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
      <IconButton variant="outlined" onClick={() => navigate(-1)}><ArrowBackIcon/></IconButton>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <Typography variant="h5" component="div">
          {item.title}
        </Typography>
        <img src={imageUrl} alt={item.title} style={{ width: '200px', height: 'auto' }} />
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
        {item.type === 'Show' && (
          <div>
            {item.seasons.map((season, seasonIndex) => (
              <Accordion key={seasonIndex}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ width: '33%', flexShrink: 0 }}>{season.title}</Typography>
                  <Typography color="text.secondary">{season.state}</Typography>
                  <ButtonRow item={season} />
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Episode</TableCell>
                          <TableCell>State</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {season.episodes.map((episode, episodeIndex) => (
                          <TableRow key={`${seasonIndex}-${episodeIndex}`}>
                            <TableCell>{episode.number}</TableCell>
                            <TableCell>{episode.state}</TableCell>
                            <TableCell>
                              <ButtonRow item={episode} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        )}
      </div>
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