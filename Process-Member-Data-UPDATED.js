// Get member record and original message
const data = $input.first().json;

// Get original message from the data
const originalMessageText = data._originalMessage || '';
const quickCommand = data._quickCommand || null;

// Check and reset guest count if new month
const today = new Date();
const lastReset = data.fields && data.fields.LastResetDate ? new Date(data.fields.LastResetDate) : new Date(0);

let currentGuestCount = (data.fields && data.fields.MonthlyGuestCount) || 0;
let needsReset = false;

if (today.getMonth() !== lastReset.getMonth() || today.getFullYear() !== lastReset.getFullYear()) {
  currentGuestCount = 0;
  needsReset = true;
}

const freeGuestsRemaining = Math.max(0, 3 - currentGuestCount);

// Calculate membership status
const membershipEndDate = data.fields && data.fields.MembershipEndDate ? new Date(data.fields.MembershipEndDate) : new Date();
const daysUntilExpiry = Math.ceil((membershipEndDate - today) / (1000 * 60 * 60 * 24));
const isExpired = daysUntilExpiry <= 0;
const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;

// Pricing based on membership type
const membershipType = (data.fields && data.fields.MembershipType) || 'Monthly';
let renewalPrice, renewalBasePrice, renewalTax;

if (membershipType === '3-Month') {
  renewalBasePrice = 1250;
  renewalTax = 162.50;
  renewalPrice = 1412.50;
} else {
  renewalBasePrice = 350;
  renewalTax = 45.50;
  renewalPrice = 395.50;
}

// Get pending visit data from Airtable (for conversation continuity)
const pendingGuests = data.fields && data.fields.PendingGuests;
const pendingTime = data.fields && data.fields.PendingTime;
const pendingAlcohol = data.fields && data.fields.PendingAlcohol;

return {
  memberId: data.id,
  memberName: (data.fields && data.fields.FullName) || 'Member',
  phoneNumber: data.fields && data.fields.PhoneNumber,
  email: data.fields && data.fields.Email,
  membershipStatus: (data.fields && data.fields.MembershipStatus) || 'Active',
  membershipType: membershipType,
  membershipEndDate: data.fields && data.fields.MembershipEndDate,
  daysUntilExpiry: daysUntilExpiry,
  isExpired: isExpired,
  isExpiringSoon: isExpiringSoon,
  currentGuestCount: currentGuestCount,
  freeGuestsRemaining: freeGuestsRemaining,
  totalLifetimeGuests: (data.fields && data.fields.TotalLifetimeGuests) || 0,  // ← ADDED THIS LINE
  needsReset: needsReset,
  quickCommand: quickCommand,
  originalMessageText: originalMessageText,
  renewalPrice: renewalPrice,
  renewalBasePrice: renewalBasePrice,
  renewalTax: renewalTax,
  pendingGuests: pendingGuests,
  pendingTime: pendingTime,
  pendingAlcohol: pendingAlcohol
};
