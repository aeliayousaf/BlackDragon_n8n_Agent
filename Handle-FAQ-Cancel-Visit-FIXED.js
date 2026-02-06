// Enhanced FAQ Handler with Dynamic Question Support
const data = $json;
const intent = data.intent;
const messageText = (data.originalMessage || '').toLowerCase();

let message = '';
let clearPendingData = false;
let cancelledGuests = 0;
let newMonthlyGuestCount = null;

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
    closingTime = 24 * 60; // 12 AM = 1440 minutes
  } else if (dayOfWeek === 5) { // Friday
    dayName = 'Friday';
    openingTime = 16 * 60; // 4 PM = 960 minutes
    closingTime = 26 * 60; // 2 AM next day = 1560 minutes
  } else { // Saturday
    dayName = 'Saturday';
    openingTime = 16 * 60; // 4 PM = 960 minutes
    closingTime = 26 * 60; // 2 AM next day = 1560 minutes
  }
  
  const isOpen = currentTime >= openingTime && (dayOfWeek < 5 ? currentTime < closingTime : currentTime < closingTime || currentTime < (2 * 60));
  
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${displayHour}:${mins.toString().padStart(2, '0')} ${period}`;
  };
  
  return {
    isOpen: isOpen,
    dayName: dayName,
    openingTime: formatTime(openingTime),
    closingTime: formatTime(closingTime),
    currentTime: formatTime(currentTime)
  };
}

switch (intent) {
  case 'greeting':
    message = 'Hi ' + data.memberName + '! 👋 Welcome back!\n\n';
    message += 'How can I help you today?\n\n';
    message += '• To book a visit, tell me when you are coming and how many guests\n';
    message += '• Ask me about hours, amenities, or policies\n';
    message += '• Reply *RENEW* to renew your membership';
    break;
  
  case 'cancel_visit':
    // Extract number of cancelled guests from message
    // Patterns: "my 2 guests have cancelled", "2 guests cancelled", "guests cancelled" (assume all pending guests)
    let cancelledMatch = messageText.match(/(\d+)\s+guests?\s+(have\s+)?(cancelled|canceled)/i);
    if (cancelledMatch && cancelledMatch[1]) {
      cancelledGuests = parseInt(cancelledMatch[1], 10);
    } else {
      // If no number specified, check pending guests or assume all guests
      cancelledGuests = data.pendingGuests || data.currentGuestCount || 0;
    }
    
    // Calculate new guest count (reduce by cancelled guests, but not below 0)
    const currentGuestCount = data.currentGuestCount || 0;
    newMonthlyGuestCount = Math.max(0, currentGuestCount - cancelledGuests);
    
    // Build response message
    message = 'No problem, ' + data.memberName + '! 👍\n\n';
    if (cancelledGuests > 0) {
      message += 'I have cancelled ' + cancelledGuests + ' guest' + (cancelledGuests !== 1 ? 's' : '') + ' from your booking.\n\n';
      message += 'Your guest count has been updated. ';
      const newFreeGuests = Math.max(0, 3 - newMonthlyGuestCount);
      message += 'You now have ' + newFreeGuests + ' free guest' + (newFreeGuests !== 1 ? 's' : '') + ' remaining this month.\n\n';
    } else {
      message += 'I have cancelled your visit booking.\n\n';
    }
    message += 'Feel free to book again anytime by telling me when you would like to come!\n\n';
    message += 'Just say something like:\n';
    message += '• "I want to come tonight with 2 guests"\n';
    message += '• "Book a table for tomorrow"';
    clearPendingData = true;
    break;
    
  case 'hours':
  case 'hours_query':
    const status = getLoungeStatus();
    const isAskingAboutToday = messageText.includes('today') || messageText.includes('now') || messageText.includes('right now') || messageText.match(/are you open|is.*open/i);
    const isAskingClosingTime = messageText.includes('close') || messageText.includes('closing') || messageText.includes('what time do you close');
    
    if (isAskingAboutToday) {
      if (status.isOpen) {
        message = 'Yes! We are open right now! 🎉\n\n';
        message += 'We are open until ' + status.closingTime + ' today (' + status.dayName + ').\n\n';
        message += 'Come on by!';
      } else {
        message = 'We are currently closed. 😔\n\n';
        message += 'Today (' + status.dayName + ') we open at ' + status.openingTime + ' and close at ' + status.closingTime + '.\n\n';
        message += 'We look forward to seeing you later!';
      }
    } else if (isAskingClosingTime) {
      message = 'We close at ' + status.closingTime + ' today (' + status.dayName + ').\n\n';
      message += '🕐 *Our Full Hours:*\n';
      message += 'Monday-Thursday: 5 PM - 12 AM\n';
      message += 'Friday-Saturday: 4 PM - 2 AM\n';
      message += 'Sunday: 4 PM - 11 PM';
    } else {
      message = '🕐 *Our Hours*\n\n';
      message += 'Monday-Thursday: 5 PM - 12 AM\n';
      message += 'Friday-Saturday: 4 PM - 2 AM\n';
      message += 'Sunday: 4 PM - 11 PM\n\n';
      message += 'We look forward to seeing you!';
    }
    break;
    
  case 'guest_count_query':
    const freeGuests = data.freeGuestsRemaining || 0;
    const usedGuests = data.currentGuestCount || 0;
    
    if (freeGuests > 0) {
      message = 'You have ' + freeGuests + ' free guest' + (freeGuests !== 1 ? 's' : '') + ' remaining this month! 🎉\n\n';
      message += 'You have used ' + usedGuests + ' of your 3 free guests.\n\n';
      message += 'After that, additional guests are $50 each.';
    } else {
      message = 'You have used all 3 of your free guests this month. 😊\n\n';
      message += 'Any additional guests will be $50 each.\n\n';
      message += 'Your guest count resets on the 1st of next month!';
    }
    break;
    
  case 'policy':
    message = '📋 *Policies & Fees*\n\n';
    message += '*Guest Policy:*\n';
    message += '• 3 free guests per month\n';
    message += '• Additional guests: $50 each\n\n';
    message += '*Alcohol Policy:*\n';
    message += '• Corkage fee: $30 if bringing your own\n';
    message += '• No fee when purchasing from us\n\n';
    message += 'You have ' + data.freeGuestsRemaining + ' free guest(s) remaining this month.';
    break;
    
  case 'amenities':
    message = '✨ *Our Amenities*\n\n';
    message += '• Private lounge seating\n';
    message += '• Premium bar service\n';
    message += '• Complimentary appetizers\n';
    message += '• WiFi\n';
    message += '• Music system\n';
    message += '• Outdoor patio';
    break;
    
  case 'contact':
    message = '📍 *Contact & Location*\n\n';
    message += '*Address:*\n';
    message += '123 Main Street, Suite 500\n';
    message += 'Your City, ST 12345\n\n';
    message += '*Phone:* (555) 123-4567\n';
    message += '*WhatsApp:* This number!';
    break;
    
  case 'membership':
    message = '💳 *Membership Options*\n\n';
    message += '*Monthly:* $350 + tax = $395.50/month\n';
    message += '*3-Month:* $1,250 + tax = $1,412.50\n';
    message += '   (Save $226 vs monthly!)\n\n';
    message += 'Your current membership: *' + data.membershipType + '*\n';
    if (data.daysUntilExpiry > 0) {
      message += 'Expires in ' + data.daysUntilExpiry + ' days\n\n';
    }
    message += 'Reply *RENEW* to renew your membership!';
    break;
    
  default:
    // For 'other' intent, mark that AI should handle it
    message = null; // Will be handled by AI node
    break;
}

// If we have a message, return it; otherwise mark for AI handling
if (message !== null) {
  if (data.isExpiringSoon && intent !== 'membership') {
    message += '\n\n⏰ _Your membership expires in ' + data.daysUntilExpiry + ' days. Reply RENEW to extend!_';
  }
  
  // For cancel_visit, set action to trigger database update
  const action = (intent === 'cancel_visit') ? 'cancel_visit' : 'faq_response';
  const needsPendingUpdate = (intent === 'cancel_visit');
  
  return {
    ...data,
    action: action,
    responseMessage: message,
    memberId: data.memberId,
    clearPendingData: clearPendingData,
    savePendingGuests: clearPendingData ? null : undefined,
    savePendingTime: clearPendingData ? null : undefined,
    savePendingAlcohol: clearPendingData ? null : undefined,
    // For cancellation, include database update fields
    newMonthlyGuestCount: newMonthlyGuestCount !== null ? newMonthlyGuestCount : undefined,
    cancelledGuests: cancelledGuests > 0 ? cancelledGuests : undefined,
    needsPendingUpdate: needsPendingUpdate,
    needsAI: false
  };
} else {
  // Mark for AI handling
  return {
    action: 'ai_response',
    memberId: data.memberId,
    needsAI: true,
    originalMessage: data.originalMessage || '',
    memberName: data.memberName,
    freeGuestsRemaining: data.freeGuestsRemaining,
    currentGuestCount: data.currentGuestCount,
    membershipType: data.membershipType,
    daysUntilExpiry: data.daysUntilExpiry
  };
}
