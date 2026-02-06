# CRITICAL FIX: Alcohol Detection Not Working

## Problem
"I will purchase at the bar" is still routing to AI (`needsAI: true`) instead of being detected as alcohol preference.

## Root Cause Analysis
The patterns ARE matching correctly (verified with test), but the detection logic might not be executing properly. Possible issues:
1. Code not updated in n8n
2. Logic condition not being met
3. Intent being overridden after detection

## The Fix Applied

### Changes Made:
1. **Simplified detection logic** - Removed complex nested conditions
2. **Added explicit pattern variables** - `hasPurchasePattern` and `hasBringOwnPattern` for clarity
3. **Expanded condition** - Now checks for alcohol patterns even without pending data
4. **Added "at the bar" explicitly** - Ensures "i will purchase at the bar" is caught
5. **Made all other intents conditional** - They only run if `intent === 'other'` to prevent override

### Key Changes:
```javascript
// OLD: Only checked if hasPendingVisit OR isAlcoholResponse
if ((hasPendingVisit && pendingAlcohol === null) || (!hasPendingVisit && isAlcoholResponse))

// NEW: Checks if message is clearly about alcohol (with or without pending data)
if ((hasPendingVisit && pendingAlcohol === null) || hasPurchasePattern || hasBringOwnPattern)
```

## Testing Instructions

1. **Copy the ENTIRE code from `FIX-ClassifyIntent-Code.js`**
2. **Paste into n8n "Classify Intent" node**
3. **Test with:** "i will purchase at the bar"
4. **Expected result:**
   - `intent: "visit"`
   - `alcohol: "purchase"`
   - `needsAI: false`
   - Should ask for guest count (not alcohol)

## Debugging if Still Not Working

Add this debug code at the END of the function (before `return`):

```javascript
// DEBUG - Remove after testing
if (messageText.includes('purchase') || messageText.includes('buy')) {
  console.log('DEBUG Alcohol Detection:', {
    messageText: messageText,
    hasPendingVisit: hasPendingVisit,
    pendingAlcohol: pendingAlcohol,
    hasPurchasePattern: typeof hasPurchasePattern !== 'undefined' ? !!hasPurchasePattern : 'NOT CALCULATED',
    hasBringOwnPattern: typeof hasBringOwnPattern !== 'undefined' ? !!hasBringOwnPattern : 'NOT CALCULATED',
    finalIntent: intent,
    finalAlcohol: alcohol
  });
}
```

Check n8n execution logs to see what values are being set.

## Expected Flow

**Message:** "i will purchase at the bar"

1. **Pattern Detection:**
   - `hasPurchasePattern` = true (matches `/will.*purchase/i` and `/purchase.*bar/i`)
   - `hasBringOwnPattern` = false

2. **Condition Check:**
   - `hasPendingVisit` = ? (probably false)
   - `hasPurchasePattern` = true
   - Condition: `false || true || false` = **true** ✓

3. **Alcohol Detection:**
   - Enters the block
   - Checks "bring own" → false
   - Checks "purchase" → **true** ✓
   - Sets: `intent = 'visit'`, `alcohol = 'purchase'`

4. **Other Intent Checks:**
   - All check `if (intent === 'other')` → false
   - Skip all other intents ✓

5. **Return:**
   - `intent: "visit"`
   - `alcohol: "purchase"`
   - `needsAI: false` ✓

If this doesn't work, check the n8n execution logs to see where it's failing.
