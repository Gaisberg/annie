import React from 'react';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper'; // Import the Paper component from Material-UI

const ScrapeResultsModal = ({ isOpen, onClose, item, results, onDownload }) => {
  // Sort the results so that cached ones appear on top
  if (!results) return null;
  const sortedResults = Object.entries(results).sort(([, { cached: cachedA }], [, { cached: cachedB }]) => cachedB - cachedA);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Paper style={{ margin: 'auto', padding: '20px', maxWidth: '80%', maxHeight: '80%', overflowY: 'auto', top: '10%', position: 'absolute', left: '10%', right: '10%' }}>
        <h2>Scrape Results</h2>
        {results && Object.keys(results).length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Hash</th>
                <th>Name</th>
                <th>Is Cached</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map(([hash, { cached, name }]) => (
                <tr key={hash}>
                  <td>{hash}</td>
                  <td>{name}</td>
                  <td>{cached ? 'Yes' : 'No'}</td>
                  <td>
                    <button 
                      disabled={!cached} 
                      onClick={() => onDownload(item, hash)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No results found</p>
        )}
      </Paper>
    </Modal>
  );
};

export default ScrapeResultsModal;