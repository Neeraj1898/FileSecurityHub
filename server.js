const express = require('express');
const path = require('path');
const fs = require('fs');

// Initialize express app
const app = express();
const PORT = 5004;

// Serve static files from the current directory
app.use(express.static('.'));

// Serve static files from the js directory
app.use('/js', express.static('js'));

// Serve static files from the css directory
app.use('/css', express.static('css'));

// Handle root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback route - serve index.html for any unmatched paths
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`CryptoSteg app running at http://0.0.0.0:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
});