const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5004;

// MIME types for serving different file types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  console.log(`Received request for ${req.url}`);
  
  // Parse the URL and get the pathname
  let filePath = '.' + req.url;
  
  // Default to index.html for the root path
  if (filePath === './') {
    filePath = './index.html';
  }
  
  // Get the file extension
  const extname = path.extname(filePath);
  
  // Set the content type based on the file extension
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // Read the file from the file system
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // File not found
        fs.readFile('./index.html', (err, content) => {
          if (err) {
            // Cannot serve index.html either
            res.writeHead(500);
            res.end('Error loading index.html');
          } else {
            // Serve index.html for any path that doesn't exist
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      // Success - serve the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log(`Press Ctrl+C to stop the server`);
});