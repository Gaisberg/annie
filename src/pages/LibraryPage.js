import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { BackendContext } from '../App';
import { useAlert } from '../components/AlertContext';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';



const LibraryPage = () => {
  const { imdb_id } = useParams();
  const { backendUrl } = useContext(BackendContext);
  const [item, setItem] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const { addAlert } = useAlert();
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
    console.log(item);
    axios.post(`${backendUrl}/items/reset?ids=${item.id}`)
      .then(() => {
        addAlert(`${item.id} reset successfully`, 'success');
        setResetTrigger(prev => !prev)
      })
      .catch(error => {
        console.error(error);
        addAlert(`Failed to reset ${item.id}`, 'error');
      });
  };

  const handleScrape = (item) => {
    addAlert('Not yet implemented', 'error');
    // axios.post(`${backendUrl}/items/scrape?type=${type}&id=${id}`)
    //   .then(() => {
    //     addAlert('Scrape initiated successfully', 'success');
    //   })
    //   .catch(error => {
    //     console.error(error);
    //     addAlert('Failed to initiate scrape', 'error');
    //   });
  };

  const handleRetry = (item) => {
    axios.post(`${backendUrl}/items/retry?ids=${item.id}`)
      .then(() => {
        addAlert('Retry initiated successfully', 'success');
      })
      .catch(error => {
        console.error(error);
        addAlert('Failed to initiate retry', 'error');
      });
  };

  const ButtonRow = ({ item }) => {
    return (
      <div>
        <Button color="error" variant="outlined" onClick={() => handleReset(item)}>Reset</Button>
        <Button variant="outlined" onClick={() => handleScrape(item)}>Scrape</Button>
        <Button variant="outlined" onClick={() => handleRetry(item)}>Retry</Button>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5" component="div">
          {item.title}
        </Typography>
        <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
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
    </div>
  );
};

export default LibraryPage;