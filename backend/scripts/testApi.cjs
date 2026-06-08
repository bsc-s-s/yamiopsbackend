const https = require('https');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjJkMjUwY2M2LWEyNjItNGZlYy1iNzdmLTg5MzdiNjA3NmYzOSIsImVtYWlsIjoieWFtaXZpdmFyZXMyMDE5QGdtYWlsLmNvbSIsInJvbGUiOiJhZG1pbiIsInRlbmFudF9pZCI6ImMwMzQxNTJmLTExMzYtNDExMy04MzRjLTgzMWY5Y2JlNzc5YSIsIm5hbWUiOiJBZG1pbiBZQU1JIiwiaWF0IjoxNzgwOTUyMjcyLCJleHAiOjE3ODEwMzg2NzJ9.RCbONO9S7sIlbzlxhkRIpsQISJ_SXSrJuv5-BCoM9a4';
const tenantId = 'c034152f-1136-4113-834c-831f9cbe779a';
const paths = ['/api/v1/dashboard/resume', '/api/v1/properties', '/api/v1/reservations', '/api/v1/incidents', '/api/v1/finance', '/api/v1/tenants', '/api/v1/auth/profile', '/api/v1/notifications'];

function request(method, path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'yami-ops-backend.onrender.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant-id': tenantId,
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: body.substring(0, 200) }));
    });
    req.on('error', (e) => resolve({ status: 'ERROR', body: e.message }));
    req.end();
  });
}

async function main() {
  for (const path of paths) {
    const result = await request('GET', path);
    console.log(`${result.status} ${path}`);
    if (result.status !== 200) console.log(`  ${result.body}`);
  }
}
main();
