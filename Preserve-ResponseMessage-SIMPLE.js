// Simple solution: Get original data from Process Visit Booking node
// This preserves responseMessage after Airtable update

const originalData = $('Process Visit Booking').first().json;

// Return the original data which has responseMessage
return originalData;
