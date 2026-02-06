// SIMPLE: Add this RIGHT BEFORE "WhatsApp: Send Response" on ALL branches
// This ensures responseMessage always exists

const data = $json;

// Get responseMessage from anywhere it might be
let msg = data.responseMessage || data.message || '';

// If missing and it's guest_count_query, generate it
if (!msg && data.intent === 'guest_count_query') {
  const free = data.freeGuestsRemaining || 0;
  const used = data.currentGuestCount || 0;
  msg = `Hi ${data.memberName || 'Member'}! 👋\n\nYou have ${free} free guest${free !== 1 ? 's' : ''} remaining this month.\n\nYou've used ${used} of your 3 free guests.`;
}

// If still missing, get from Handle FAQ
if (!msg) {
  try {
    const faq = $('Handle FAQ').first().json;
    msg = faq.responseMessage || '';
  } catch (e) {}
}

// Final fallback
if (!msg) {
  msg = 'I apologize, but I had trouble processing your request.';
}

return {
  ...data,
  responseMessage: msg,
  message: msg
};
