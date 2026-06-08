const https = require('https');

const data = JSON.stringify({ email: 'yamivivares2019@gmail.com', password: 'yami2019#' });
const options = {
  hostname: 'yami-ops-backend.onrender.com',
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log(body));
});
req.on('error', (e) => console.error(e));
req.write(data);
req.end();
