// SIMPLE Handle FAQ - Just handle guest_count_query and pass everything else through
const data = $json;
const intent = data.intent || 'other';

// ONLY handle guest_count_query - everything else goes to AI
if (intent === 'guest_count_query') {
  const freeGuests = data.freeGuestsRemaining || 0;
  const used = data.currentGuestCount || 0;
  const name = data.memberName || 'Member';
  
  let msg = `Hi ${name}! 👋\n\nYou have ${freeGuests} free guest${freeGuests !== 1 ? 's' : ''} remaining this month.\n\nYou've used ${used} of your 3 free guests.\n\nAfter you use all 3 free guests, additional guests are $50 each.`;
  
  return {
    ...data,
    responseMessage: msg,
    needsAI: false
  };
}

// Everything else goes to AI
return {
  ...data,
  needsAI: true
};
