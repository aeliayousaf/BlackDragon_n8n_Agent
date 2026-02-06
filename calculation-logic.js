// ============================================
// WHATSAPP LOUNGE AGENT - CALCULATION LOGIC
// ============================================
// This code is used in n8n Function nodes

// --------------------------------------------
// MEMBERSHIP PRICING CONSTANTS
// --------------------------------------------

const MEMBERSHIP_PRICING = {
  'Monthly': {
    basePrice: 350,
    taxRate: 0.13,
    taxAmount: 45.50,
    totalPrice: 395.50,
    durationMonths: 1
  },
  '3-Month': {
    basePrice: 1250,
    taxRate: 0.13,
    taxAmount: 162.50,
    totalPrice: 1412.50,
    durationMonths: 3
  }
};

const GUEST_PRICING = {
  FREE_GUEST_LIMIT: 3,
  ADDITIONAL_GUEST_FEE: 50,
  CORKAGE_FEE: 30
};

// --------------------------------------------
// 1. MEMBER LOOKUP AND VALIDATION
// --------------------------------------------

/**
 * Look up member by phone number from incoming WhatsApp message
 * Use this in n8n Function node after WhatsApp Trigger
 */
function lookupMember(incomingPhone, airtableMembers) {
  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhone = incomingPhone.replace(/[\s\-\(\)]/g, '');

  // Find member in Airtable records
  const member = airtableMembers.find(m => {
    const memberPhone = m.fields.PhoneNumber.replace(/[\s\-\(\)]/g, '');
    return memberPhone === cleanPhone;
  });

  if (!member) {
    return {
      found: false,
      message: "I don't have you registered as a member. Please contact us at (555) 123-4567 to set up your membership.\n\n💰 Membership Options:\n• Monthly: $395.50/month\n• 3-Month: $1,412.50 (save $226!)"
    };
  }

  if (member.fields.MembershipStatus !== 'Active') {
    return {
      found: true,
      active: false,
      status: member.fields.MembershipStatus,
      message: `Hi ${member.fields.FullName}, your membership status is ${member.fields.MembershipStatus}. Reply RENEW to reactivate or contact us at (555) 123-4567.`
    };
  }

  return {
    found: true,
    active: true,
    member: member
  };
}


// --------------------------------------------
// 2. MEMBERSHIP EXPIRY CALCULATIONS
// --------------------------------------------

/**
 * Calculate days until membership expires
 */
function calculateMembershipExpiry(memberRecord) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(memberRecord.fields.MembershipEndDate);
  endDate.setHours(0, 0, 0, 0);

  const timeDiff = endDate.getTime() - today.getTime();
  const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return {
    endDate: memberRecord.fields.MembershipEndDate,
    daysUntilExpiry: daysUntilExpiry,
    isExpired: daysUntilExpiry <= 0,
    isExpiringSoon: daysUntilExpiry <= 7 && daysUntilExpiry > 0,
    needsReminder: daysUntilExpiry === 7 || daysUntilExpiry === 3 || daysUntilExpiry === 1
  };
}

/**
 * Calculate new membership end date for renewal
 */
function calculateNewEndDate(membershipType, startFromDate = new Date()) {
  const pricing = MEMBERSHIP_PRICING[membershipType] || MEMBERSHIP_PRICING['Monthly'];
  const newEndDate = new Date(startFromDate);
  newEndDate.setMonth(newEndDate.getMonth() + pricing.durationMonths);

  return {
    newEndDate: newEndDate.toISOString().split('T')[0],
    formattedEndDate: newEndDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    pricing: pricing
  };
}


// --------------------------------------------
// 3. MONTHLY GUEST COUNT RESET
// --------------------------------------------

/**
 * Check if guest count needs to be reset (new month)
 * Returns updated member data
 */
function checkAndResetGuestCount(memberRecord) {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const lastReset = new Date(memberRecord.fields.LastResetDate);
  const lastResetMonth = lastReset.getMonth();
  const lastResetYear = lastReset.getFullYear();

  // Check if we're in a new month
  if (currentYear > lastResetYear ||
     (currentYear === lastResetYear && currentMonth > lastResetMonth)) {

    return {
      needsReset: true,
      updatedData: {
        MonthlyGuestCount: 0,
        LastResetDate: today.toISOString().split('T')[0]
      },
      currentGuestCount: 0
    };
  }

  return {
    needsReset: false,
    currentGuestCount: memberRecord.fields.MonthlyGuestCount || 0
  };
}


// --------------------------------------------
// 4. GUEST FEE CALCULATION
// --------------------------------------------

/**
 * Calculate guest fees based on monthly limit
 */
function calculateGuestFees(currentGuestCount, newGuestCount) {
  const { FREE_GUEST_LIMIT, ADDITIONAL_GUEST_FEE } = GUEST_PRICING;

  // Calculate how many free guests the member has left
  const freeGuestsRemaining = Math.max(0, FREE_GUEST_LIMIT - currentGuestCount);

  // Calculate how many of the new guests are free vs paid
  const freeGuestsUsed = Math.min(newGuestCount, freeGuestsRemaining);
  const paidGuestsCount = Math.max(0, newGuestCount - freeGuestsRemaining);

  // Calculate total guest fee
  const guestFee = paidGuestsCount * ADDITIONAL_GUEST_FEE;

  // Calculate new total guest count
  const newTotalGuestCount = currentGuestCount + newGuestCount;

  return {
    freeGuestsUsed: freeGuestsUsed,
    paidGuestsCount: paidGuestsCount,
    guestFee: guestFee,
    newTotalGuestCount: newTotalGuestCount,
    freeGuestsRemainingAfter: Math.max(0, FREE_GUEST_LIMIT - newTotalGuestCount)
  };
}


// --------------------------------------------
// 5. CORKAGE FEE CALCULATION
// --------------------------------------------

/**
 * Determine corkage fee based on alcohol source
 */
function calculateCorkageFee(alcoholSource) {
  const { CORKAGE_FEE } = GUEST_PRICING;

  const normalizedSource = (alcoholSource || '').toLowerCase().trim();

  if (normalizedSource.includes('own') ||
      normalizedSource.includes('bring') ||
      normalizedSource.includes('my') ||
      normalizedSource === 'yes') {
    return {
      hasCorkageFee: true,
      corkageFee: CORKAGE_FEE,
      alcoholSource: 'Own'
    };
  }

  return {
    hasCorkageFee: false,
    corkageFee: 0,
    alcoholSource: 'Purchase'
  };
}


// --------------------------------------------
// 6. COMPLETE VISIT CALCULATION
// --------------------------------------------

/**
 * Complete calculation for a visit
 * This is the main function you'll use in n8n
 */
function calculateVisitCharges(memberRecord, numberOfGuests, alcoholChoice) {
  // Step 1: Check and reset guest count if needed
  const resetInfo = checkAndResetGuestCount(memberRecord);
  const currentGuestCount = resetInfo.currentGuestCount;

  // Step 2: Calculate guest fees
  const guestFees = calculateGuestFees(currentGuestCount, numberOfGuests);

  // Step 3: Calculate corkage fee
  const corkageInfo = calculateCorkageFee(alcoholChoice);

  // Step 4: Calculate total
  const totalFees = guestFees.guestFee + corkageInfo.corkageFee;

  // Step 5: Get membership expiry info
  const expiryInfo = calculateMembershipExpiry(memberRecord);

  // Return complete calculation
  return {
    memberName: memberRecord.fields.FullName,
    memberId: memberRecord.id,
    membershipType: memberRecord.fields.MembershipType || 'Monthly',

    // Guest information
    numberOfGuests: numberOfGuests,
    freeGuestsUsed: guestFees.freeGuestsUsed,
    paidGuestsCount: guestFees.paidGuestsCount,
    guestFee: guestFees.guestFee,

    // Alcohol information
    alcoholSource: corkageInfo.alcoholSource,
    corkageFee: corkageInfo.corkageFee,

    // Totals
    totalFees: totalFees,

    // Updated guest count
    newMonthlyGuestCount: guestFees.newTotalGuestCount,
    freeGuestsRemaining: guestFees.freeGuestsRemainingAfter,

    // Membership expiry
    membershipExpiry: expiryInfo,

    // Reset information
    needsReset: resetInfo.needsReset,
    resetData: resetInfo.needsReset ? resetInfo.updatedData : null
  };
}


// --------------------------------------------
// 7. RENEWAL CALCULATION
// --------------------------------------------

/**
 * Calculate renewal pricing and new dates
 */
function calculateRenewal(memberRecord) {
  const membershipType = memberRecord.fields.MembershipType || 'Monthly';
  const pricing = MEMBERSHIP_PRICING[membershipType];
  const endDateInfo = calculateNewEndDate(membershipType);

  return {
    memberName: memberRecord.fields.FullName,
    memberId: memberRecord.id,
    membershipType: membershipType,
    currentEndDate: memberRecord.fields.MembershipEndDate,
    newEndDate: endDateInfo.newEndDate,
    formattedNewEndDate: endDateInfo.formattedEndDate,
    basePrice: pricing.basePrice,
    taxRate: pricing.taxRate,
    taxAmount: pricing.taxAmount,
    totalPrice: pricing.totalPrice
  };
}


// --------------------------------------------
// 8. FORMAT CONFIRMATION MESSAGE
// --------------------------------------------

/**
 * Generate formatted WhatsApp confirmation message
 */
function formatConfirmationMessage(calculation) {
  let message = `✅ *Booking Confirmed!*\n\n`;
  message += `👤 Member: ${calculation.memberName}\n`;
  message += `👥 Guests: ${calculation.numberOfGuests}\n\n`;

  // Guest fee breakdown
  if (calculation.freeGuestsUsed > 0) {
    message += `   • Free guests: ${calculation.freeGuestsUsed}\n`;
  }
  if (calculation.paidGuestsCount > 0) {
    message += `   • Additional guests: ${calculation.paidGuestsCount} × $50 = $${calculation.guestFee}\n`;
  }

  // Alcohol info
  message += `\n🍾 Alcohol: ${calculation.alcoholSource === 'Own' ? 'Bringing own' : 'Purchasing from us'}\n`;
  if (calculation.corkageFee > 0) {
    message += `   • Corkage fee: $${calculation.corkageFee}\n`;
  }

  // Total
  message += `\n💰 *Total Charges: $${calculation.totalFees}*\n`;

  // Remaining guests info
  if (calculation.freeGuestsRemaining > 0) {
    message += `\n📊 Free guests remaining this month: ${calculation.freeGuestsRemaining}\n`;
  } else {
    message += `\n⚠️ You've used all free guests this month. Additional guests are $50 each.\n`;
  }

  // Add membership expiry warning if relevant
  if (calculation.membershipExpiry && calculation.membershipExpiry.isExpiringSoon) {
    message += `\n⏰ _Your membership expires in ${calculation.membershipExpiry.daysUntilExpiry} days. Reply RENEW to extend!_\n`;
  }

  message += `\nSee you soon! 🥂`;

  return message;
}


// --------------------------------------------
// 9. FORMAT RENEWAL MESSAGE
// --------------------------------------------

/**
 * Generate renewal request message
 */
function formatRenewalMessage(renewalInfo) {
  let message = `🎉 *Membership Renewal Request*\n\n`;
  message += `Hi ${renewalInfo.memberName}!\n\n`;
  message += `You're renewing your *${renewalInfo.membershipType}* membership.\n\n`;
  message += `💰 *Total: $${renewalInfo.totalPrice.toFixed(2)}*\n`;
  message += `   Base: $${renewalInfo.basePrice.toFixed(2)}\n`;
  message += `   Tax (13%): $${renewalInfo.taxAmount.toFixed(2)}\n\n`;
  message += `📅 New expiry: ${renewalInfo.formattedNewEndDate}\n\n`;
  message += `To complete your renewal:\n`;
  message += `• Pay via e-transfer to: payments@yourlounge.com\n`;
  message += `• Or call us at (555) 123-4567\n\n`;
  message += `Reply *CONFIRM* once payment is sent!`;

  return message;
}


// --------------------------------------------
// 10. FORMAT REMINDER MESSAGES
// --------------------------------------------

/**
 * Generate reminder message based on days until expiry
 */
function formatReminderMessage(memberRecord, daysUntilExpiry) {
  const memberName = memberRecord.fields.FullName;
  const membershipType = memberRecord.fields.MembershipType || 'Monthly';
  const endDate = new Date(memberRecord.fields.MembershipEndDate);
  const pricing = MEMBERSHIP_PRICING[membershipType];

  const formattedDate = endDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let message = '';

  if (daysUntilExpiry === 7) {
    message = `Hi ${memberName}! 👋\n\n`;
    message += `Your ${membershipType} membership expires on *${formattedDate}* (7 days).\n\n`;
    message += `💰 Renewal: $${pricing.totalPrice.toFixed(2)} (includes 13% tax)\n\n`;
    message += `Reply *RENEW* to continue your membership\n`;
    message += `Reply *CANCEL* if you'd like to end your membership\n\n`;
    message += `Questions? Just message us! 🥂`;
  } else if (daysUntilExpiry === 3) {
    message = `Hi ${memberName}! ⏰\n\n`;
    message += `Reminder: Your membership expires in *3 days* (${formattedDate}).\n\n`;
    message += `Don't lose access to your exclusive member benefits!\n\n`;
    message += `💰 Renewal: $${pricing.totalPrice.toFixed(2)}\n\n`;
    message += `Reply *RENEW* to stay active\n`;
    message += `Reply *CANCEL* to end membership`;
  } else if (daysUntilExpiry === 1) {
    message = `🚨 *Last Chance* ${memberName}!\n\n`;
    message += `Your membership expires *TOMORROW* (${formattedDate}).\n\n`;
    message += `Reply *RENEW* now to avoid interruption\n\n`;
    message += `💰 $${pricing.totalPrice.toFixed(2)} for ${membershipType}`;
  } else if (daysUntilExpiry <= 0) {
    message = `Hi ${memberName},\n\n`;
    message += `Your membership has expired as of ${formattedDate}. 😢\n\n`;
    message += `We'd love to have you back!\n\n`;
    message += `💰 *Rejoin Options:*\n`;
    message += `• Monthly: $395.50/month\n`;
    message += `• 3-Month: $1,412.50 (save $226!)\n\n`;
    message += `Reply *RENEW* anytime to reactivate\n\n`;
    message += `We hope to see you again soon! 🥂`;
  }

  return message;
}


// --------------------------------------------
// 11. FORMAT REQUEST FOR INFORMATION
// --------------------------------------------

/**
 * Generate message asking for missing information
 */
function formatInfoRequest(memberName, missingInfo, currentGuestCount, membershipExpiry) {
  const freeGuestsRemaining = Math.max(0, 3 - currentGuestCount);

  let message = `Hi ${memberName}! 👋\n\n`;

  if (missingInfo.includes('guests')) {
    message += `How many guests will you be bringing?\n`;
    if (freeGuestsRemaining > 0) {
      message += `_(You have ${freeGuestsRemaining} free guest${freeGuestsRemaining !== 1 ? 's' : ''} remaining this month)_\n`;
    } else {
      message += `_(Additional guests are $50 each)_\n`;
    }
    message += `\n`;
  }

  if (missingInfo.includes('alcohol')) {
    message += `Will you be:\n`;
    message += `• Bringing your own alcohol ($30 corkage fee)\n`;
    message += `• Purchasing from us (no fee)\n`;
  }

  // Add expiry warning if relevant
  if (membershipExpiry && membershipExpiry.isExpiringSoon) {
    message += `\n⏰ _Note: Your membership expires in ${membershipExpiry.daysUntilExpiry} days. Reply RENEW to extend!_`;
  }

  return message;
}


// --------------------------------------------
// 12. EXTRACT INFORMATION FROM MESSAGE
// --------------------------------------------

/**
 * Parse message to extract structured information
 */
function extractVisitInfo(messageText) {
  const text = (messageText || '').toLowerCase();

  // Check for quick commands first
  const upperText = (messageText || '').toUpperCase().trim();
  if (upperText === 'RENEW') {
    return { intent: 'renew', isQuickCommand: true };
  }
  if (upperText === 'CANCEL') {
    return { intent: 'cancel', isQuickCommand: true };
  }
  if (upperText === 'CONFIRM CANCEL') {
    return { intent: 'confirm_cancel', isQuickCommand: true };
  }

  // Extract number of guests
  let guestCount = null;
  const guestPatterns = [
    /(\d+)\s*guests?/,
    /bringing\s*(\d+)/,
    /with\s*(\d+)/,
    /(\d+)\s*people/,
    /(\d+)\s*friends?/
  ];

  for (let pattern of guestPatterns) {
    const match = text.match(pattern);
    if (match) {
      guestCount = parseInt(match[1]);
      break;
    }
  }

  // Detect alcohol choice
  let alcoholChoice = null;
  if (text.includes('own') || (text.includes('bringing') && (text.includes('bottle') || text.includes('alcohol')))) {
    alcoholChoice = 'own';
  } else if (text.includes('buy') || text.includes('purchase') || text.includes('from you')) {
    alcoholChoice = 'purchase';
  }

  // Detect intent
  let intent = 'unknown';
  if (text.includes('coming') || text.includes('visit') || text.includes('tonight') || text.includes('tomorrow')) {
    intent = 'visit';
  } else if (text.includes('hour') || text.includes('open') || text.includes('close')) {
    intent = 'hours';
  } else if (text.includes('guest') && text.includes('policy')) {
    intent = 'policy';
  } else if (text.includes('membership') || text.includes('renew') || text.includes('price')) {
    intent = 'membership';
  } else if (text.includes('cancel')) {
    intent = 'cancel';
  }

  return {
    intent: intent,
    guestCount: guestCount,
    alcoholChoice: alcoholChoice,
    hasGuests: guestCount !== null,
    hasAlcoholInfo: alcoholChoice !== null,
    isQuickCommand: false
  };
}


// --------------------------------------------
// 13. VALIDATE INPUTS
// --------------------------------------------

/**
 * Validate extracted information
 */
function validateVisitInfo(guestCount, alcoholChoice) {
  const errors = [];

  if (guestCount !== null) {
    if (guestCount < 0) {
      errors.push("Guest count cannot be negative.");
    }
    if (guestCount > 20) {
      errors.push("For groups over 20 guests, please call us at (555) 123-4567 to make arrangements.");
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}


// --------------------------------------------
// EXPORT FOR N8N
// --------------------------------------------

// In n8n, you can copy the functions you need into Function nodes
// or use this template:

/*
// FULL N8N FUNCTION NODE TEMPLATE:

// Constants
const MEMBERSHIP_PRICING = {
  'Monthly': { basePrice: 350, taxAmount: 45.50, totalPrice: 395.50, durationMonths: 1 },
  '3-Month': { basePrice: 1250, taxAmount: 162.50, totalPrice: 1412.50, durationMonths: 3 }
};

const GUEST_PRICING = {
  FREE_GUEST_LIMIT: 3,
  ADDITIONAL_GUEST_FEE: 50,
  CORKAGE_FEE: 30
};

// Paste the functions you need here (from above)
// Then use this logic:

const incomingMessage = $json.message.text;
const incomingPhone = $json.message.from;

// Get member data from previous Airtable node
const memberRecord = $('Airtable_Get_Member').first().json;

// Extract information from message
const extracted = extractVisitInfo(incomingMessage);

// Handle quick commands
if (extracted.isQuickCommand) {
  if (extracted.intent === 'renew') {
    const renewalInfo = calculateRenewal(memberRecord);
    return {
      json: {
        action: 'renewal_request',
        responseMessage: formatRenewalMessage(renewalInfo),
        ...renewalInfo
      }
    };
  }
  // ... handle other quick commands
}

// If this is a visit notification with all info
if (extracted.intent === 'visit' && extracted.hasGuests && extracted.hasAlcoholInfo) {

  // Calculate charges
  const calculation = calculateVisitCharges(
    memberRecord,
    extracted.guestCount,
    extracted.alcoholChoice
  );

  // Format confirmation
  const message = formatConfirmationMessage(calculation);

  return {
    json: {
      ...calculation,
      responseMessage: message,
      action: 'confirm_visit'
    }
  };
}

// If missing information
else if (extracted.intent === 'visit') {
  const missingInfo = [];
  if (!extracted.hasGuests) missingInfo.push('guests');
  if (!extracted.hasAlcoholInfo) missingInfo.push('alcohol');

  const expiryInfo = calculateMembershipExpiry(memberRecord);

  const message = formatInfoRequest(
    memberRecord.fields.FullName,
    missingInfo,
    memberRecord.fields.MonthlyGuestCount,
    expiryInfo
  );

  return {
    json: {
      responseMessage: message,
      action: 'request_info',
      missingInfo: missingInfo
    }
  };
}

// Otherwise, let AI handle it
else {
  return {
    json: {
      action: 'ai_response',
      extracted: extracted
    }
  };
}
*/
