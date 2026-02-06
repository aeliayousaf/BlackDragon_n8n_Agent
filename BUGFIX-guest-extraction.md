# Bug Fix: Guest Count Extraction Issue

## Problem
When a user says "i want to come this evening with 2 guests and i will bring my own alcohol", the system was recording 0 guests instead of 2.

## Root Cause
The guest extraction regex patterns in the "Classify Intent" function were being checked in the wrong order. The pattern for "with X guests" was checked after a more generic pattern that didn't match this common phrasing.

## Solution

### Fix 1: Reorder Regex Patterns (Priority Fix)

In the **"Classify Intent"** function node, reorder the guest extraction patterns to check "with X guests" FIRST:

**Current order (WRONG):**
```javascript
// Pattern 1: Generic pattern (doesn't match "with 2 guests")
let guestMatch = messageText.match(/(\d+)\s*(guest|friend|people|person|of us)/i);

// Pattern 2: "with X guests" (checked second - too late!)
if (!guestMatch) {
  guestMatch = messageText.match(/with\s+(\d+)\s*(guest|friend|people|person)?s?/i);
}
```

**Fixed order (CORRECT):**
```javascript
// Pattern 1: "with X guests" - MOST COMMON pattern (check FIRST!)
let guestMatch = messageText.match(/with\s+(\d+)\s*(guest|friend|people|person)?s?/i);

// Pattern 2: "bringing X guests"
if (!guestMatch) {
  guestMatch = messageText.match(/bringing\s+(\d+)\s*(guest|friend|people|person)?s?/i);
}

// Pattern 3: Generic "X guests" anywhere
if (!guestMatch) {
  guestMatch = messageText.match(/(\d+)\s*(guest|friend|people|person|of us)s?/i);
}
```

### Fix 2: Add Validation in Process Visit Booking

In the **"Process Visit Booking"** function, add validation to prevent defaulting to 0:

```javascript
// Calculate fees
// Ensure guests is a valid number (not null/undefined)
let numberOfGuests = data.guests;
if (numberOfGuests === null || numberOfGuests === undefined || isNaN(numberOfGuests)) {
  // If guests is missing but we have alcohol info, ask for guest count
  if (data.alcohol) {
    return {
      action: 'request_info',
      responseMessage: 'Hi ' + data.memberName + '! 👋\n\n' +
        'I see you want to ' + (data.alcohol === 'own' ? 'bring your own alcohol' : 'purchase from us') + '.\n\n' +
        'How many guests will you be bringing?\n' +
        (data.freeGuestsRemaining > 0 ? '_(You have ' + data.freeGuestsRemaining + ' free guest' + (data.freeGuestsRemaining !== 1 ? 's' : '') + ' remaining this month)_' : ''),
      memberId: data.memberId,
      savePendingGuests: null,
      savePendingTime: data.timeReference || null,
      savePendingAlcohol: data.alcohol,
      needsPendingUpdate: true
    };
  }
  numberOfGuests = 0; // Default to 0 only if we truly don't have guest info
}
```

## Implementation Steps

1. **Open n8n workflow editor**
2. **Find "Classify Intent" function node**
3. **Locate the guest extraction section** (around line with "Extract guest count")
4. **Reorder the patterns** to check "with X guests" first
5. **Update "Process Visit Booking" function** with validation logic
6. **Test** with message: "i want to come this evening with 2 guests and i will bring my own alcohol"

## Expected Result After Fix

**Input:** "i want to come this evening with 2 guests and i will bring my own alcohol"

**Output:**
```
✅ Booking Confirmed!

👤 Member: Aelia Yousaf
👥 Guests: 2
   • Free guests: 2

🍾 Alcohol: Bringing own
   • Corkage fee: $30

💰 Total Charges: $30

📊 Free guests remaining this month: 1

See you soon! 🥂
```

## Testing Checklist

- [ ] "with 2 guests" extracts correctly
- [ ] "bringing 3 people" extracts correctly  
- [ ] "2 guests" extracts correctly
- [ ] "alone" sets guests to 0
- [ ] Missing guest count asks for clarification
- [ ] Database updates with correct guest count

## Additional Improvements Made

1. Added validation to ensure guest count is between 0-50
2. Improved error handling when guest extraction fails
3. Better fallback logic for edge cases
