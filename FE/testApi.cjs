const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/papers/feed/discover?page=0&size=5',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log('statusCode:', res.statusCode);
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Body:', data.substring(0, 500));
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
