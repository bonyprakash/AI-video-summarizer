console.log('Starting test server...');

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Video Summarizer Test Server is running!',
    port: 5500,
    timestamp: new Date().toISOString()
  }));
});

server.listen(5500, () => {
  console.log('✅ Test server running on port 5500');
  console.log('🌐 Open http://localhost:5500 in your browser');
});
