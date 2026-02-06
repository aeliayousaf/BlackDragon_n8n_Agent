// Enhanced FAQ Handler with Dynamic Question Support
const data = $json;
const intent = data.intent || 'other';
const messageText = (data.originalMessage || data.originalMessageText || '').toLowerCase();

let message = '';
let clearPendingData = false;

// CRITICAL FIX: Handle guest_count_query directly (don't rely on AI)
if (intent === 'guest_count_query') {
  const freeGuestsRemaining = data.freeGuestsRemaining || 0;
  const currentGuestCount = data.currentGuestCount || 0;
  const memberName = data.memberName || 'Member';
  
  let guestMessage = 'Hi ' + memberName + '! 👋\n\n';
  
  if (freeGuestsRemaining > 0) {
    guestMessage += 'You have ' + freeGuestsRemaining + ' free guest' + (freeGuestsRemaining !== 1 ? 's' : '') + ' remaining this month.\n\n';
    guestMessage += 'You\'ve used ' + currentGuestCount + ' of your 3 free guests.\n\n';
    guestMessage += 'After you use all 3 free guests, additional guests are $50 each.';
  } else {
    guestMessage += 'You have used all 3 of your free guests this month.\n\n';
    guestMessage += 'Additional guests are $50 each.';
  }
  
  return {
    responseMessage: guestMessage,
    memberId: data.memberId,
    intent: intent,
    needsAI: false  // Don't use AI - we have the answer
  };
}

// Helper function to check if lounge is open today
function getLoungeStatus() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute; // minutes since midnight
  
  let openingTime, closingTime, dayName;
  
  if (dayOfWeek === 0) { // Sunday
    dayName = 'Sunday';
    openingTime = 16 * 60; // 4 PM = 960 minutes
    closingTime = 23 * 60; // 11 PM = 1380 minutes
  } else if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday-Thursday
    dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'][dayOfWeek - 1];
    openingTime = 17 * 60; // 5 PM = 1020 minutes
    closingTime = 23 * 60; // 11 PM = 1380 minutes
  } else if (dayOfWeek === 5) { // Friday
    dayName = 'Friday';
    openingTime = 17 * 60; // 5 PM = 1020 minutes
    closingTime = 24 * 60; // 12 AM = 1440 minutes
  } else { // Saturday
    dayName = 'Saturday';
    openingTime = 17 * 60; // 5 PM = 1020 minutes
    closingTime = 24 * 60; // 12 AM = 1440 minutes
  }
  
  const isOpen = currentTime >= openingTime && currentTime < closingTime;
  return { isOpen, dayName, openingTime, closingTime };
}

// Handle hours query
if (intent === 'hours_query') {
  const status = getLoungeStatus();
  const memberName = data.memberName || 'Member';
  
  message = 'Hi ' + memberName + '! 👋\n\n';
  message += 'Our hours are:\n';
  message += '• Monday - Thursday: 5 PM - 11 PM\n';
  message += '• Friday - Saturday: 5 PM - 12 AM\n';
  message += '• Sunday: 5 PM - 10 PM\n\n';
  
  if (status.isOpen) {
    message += 'We\'re currently open! 🥂';
  } else {
    message += 'We\'re currently closed. See you soon!';
  }
  
  return {
    responseMessage: message,
    memberId: data.memberId,
    intent: intent,
    needsAI: false
  };
}

// Handle policy questions
if (intent === 'policy') {
  const memberName = data.memberName || 'Member';
  message = 'Hi ' + memberName + '! 👋\n\n';
  message += 'Here\'s our guest policy:\n\n';
  message += '• 3 free guests per month\n';
  message += '• Additional guests: $50 each\n';
  message += '• Corkage fee: $30 if bringing your own alcohol\n';
  message += '• No corkage fee if purchasing from us\n\n';
  message += 'Questions? Reply anytime!';
  
  return {
    responseMessage: message,
    memberId: data.memberId,
    intent: intent,
    needsAI: false
  };
}

// Handle amenities questions
if (intent === 'amenities') {
  const memberName = data.memberName || 'Member';
  message = 'Hi ' + memberName + '! 👋\n\n';
  message += 'Our amenities include:\n';
  message += '• Private lounge seating\n';
  message += '• Premium bar service\n';
  message += '• Complimentary appetizers\n';
  message += '• WiFi\n';
  message += '• Music system\n';
  message += '• Outdoor patio\n\n';
  message += 'Come enjoy! 🥂';
  
  return {
    responseMessage: message,
    memberId: data.memberId,
    intent: intent,
    needsAI: false
  };
}

// Handle contact questions
if (intent === 'contact') {
  const memberName = data.memberName || 'Member';
  message = 'Hi ' + memberName + '! 👋\n\n';
  message += 'Contact Information:\n';
  message += '• Address: 123 Main Street, Suite 500\n';
  message += '• Phone: (555) 123-4567\n';
  message += '• Hours: Mon-Thu 5PM-11PM, Fri-Sat 5PM-12AM, Sun 5PM-10PM\n\n';
  message += 'See you soon!';
  
  return {
    responseMessage: message,
    memberId: data.memberId,
    intent: intent,
    needsAI: false
  };
}

// For other intents or if no specific handler, use AI
return {
  ...data,
  needsAI: true  // Use AI for other questions
};
