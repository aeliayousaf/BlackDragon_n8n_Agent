const fs = require('fs');
const code = fs.readFileSync('FIX-Process-Visit-Booking-Monthly.js', 'utf8');
const escaped = JSON.stringify(code);
fs.writeFileSync('process-visit-escaped.txt', escaped);
console.log('Escaped code saved to process-visit-escaped.txt');
