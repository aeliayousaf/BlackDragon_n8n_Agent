# Debugging Guide: "i will purchase fro the bar" Not Working

## Test Results
✅ The regex patterns ARE matching correctly:
- `/will.*purchase/i` matches "will purchase" ✓
- `/purchase.*fro/i` matches "purchase fro" ✓
- `isAlcoholResponse` = true ✓

## Possible Issues

### Issue 1: Code Not Updated in n8n
**Solution:** Make sure you copied the LATEST version from `FIX-ClassifyIntent-Code.js` into n8n

### Issue 2: Pending Data Not Retrieved
The code checks `hasPendingVisit` which depends on:
- `pendingGuests` (from Airtable)
- `pendingTime` (from Airtable)  
- `pendingAlcohol` (from Airtable)

**Check in n8n execution logs:**
1. Go to "Process Member Data" node output
2. Look for `pendingGuests`, `pendingTime`, `pendingAlcohol`
3. If all are `null`/`undefined`, `hasPendingVisit` will be `false`

**If `hasPendingVisit` is false:**
- The code should still work because `isAlcoholResponse` is true
- It should set `intent = 'visit'` and `alcohol = 'purchase'`
- But `guests` will be `null`, so it will ask for guest count

### Issue 3: Intent Being Overridden
After setting `intent = 'visit'` and `alcohol = 'purchase'`, check if:
- The code continues and sets `intent` to something else
- Another node is overriding the values

## Debugging Steps in n8n

1. **Check "Classify Intent" node output:**
   - `intent` should be `"visit"`
   - `alcohol` should be `"purchase"`
   - `guests` might be `null` (that's OK if no pending data)

2. **Check "Process Visit Booking" node:**
   - `hasGuests` = false (because guests is null)
   - `hasAlcohol` = true (because alcohol is 'purchase')
   - Should only ask for guest count, NOT alcohol

3. **If it's asking for both:**
   - Check if `alcohol` is being set correctly
   - Check if `hasAlcohol` check is working

## Quick Test

Add this debug code temporarily to "Classify Intent" node (at the end, before return):

```javascript
// DEBUG: Log what we detected
console.log('DEBUG:', {
  messageText: messageText,
  hasPendingVisit: hasPendingVisit,
  pendingAlcohol: pendingAlcohol,
  isAlcoholResponse: isAlcoholResponse,
  intent: intent,
  alcohol: alcohol,
  guests: guests
});
```

Then check n8n execution logs to see what values are being set.

## Expected Flow

**Message:** "i will purchase fro the bar"

**After Classify Intent:**
- `intent: "visit"`
- `alcohol: "purchase"`
- `guests: null` (or from pending data)

**After Process Visit Booking:**
- `hasGuests: false` (guests is null)
- `hasAlcohol: true` (alcohol is 'purchase')
- Should ask: "How many guests will you be bringing?"
- Should NOT ask about alcohol

If it's asking about alcohol, the `alcohol` value isn't being passed correctly.
