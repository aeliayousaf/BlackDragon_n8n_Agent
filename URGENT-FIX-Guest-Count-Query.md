# URGENT FIX: Guest Count Query responseMessage Missing

## The Problem
When user asks "how many guests do i have left", the `responseMessage` is missing when it reaches "WhatsApp: Send Response".

## Root Cause
The data flows: "Handle FAQ" → "Needs AI Response?" (FALSE) → "WhatsApp: Send Response", but `responseMessage` isn't being preserved.

## The Fix (2 Options)

### Option 1: Add Preserve Node (Recommended)

Add a Function node between "Needs AI Response?" (FALSE branch) and "WhatsApp: Send Response":

1. **Add Function Node:**
   - Name: "Preserve FAQ Response"
   - Place it: Between "Needs AI Response?" (FALSE) and "WhatsApp: Send Response"

2. **Add This Code:**
   ```javascript
   // Ensure responseMessage is preserved
   const data = $json;
   
   // Ensure responseMessage exists
   const responseMessage = data.responseMessage || data.message || '';
   
   return {
     ...data,
     responseMessage: responseMessage,
     message: responseMessage  // Also set for Twilio compatibility
   };
   ```

3. **Update Connections:**
   - Disconnect: "Needs AI Response?" (FALSE) → "WhatsApp: Send Response"
   - Connect: "Needs AI Response?" (FALSE) → "Preserve FAQ Response" → "WhatsApp: Send Response"

### Option 2: Update "Handle FAQ" Return Statement

Make sure "Handle FAQ" returns `responseMessage` AND preserves all data:

```javascript
// In guest_count_query handler:
return {
  ...data,  // CRITICAL: Preserve all fields
  responseMessage: guestMessage,
  message: guestMessage,  // ADD THIS - for Twilio compatibility
  memberId: data.memberId,
  intent: intent,
  needsAI: false
};
```

Do this for ALL handlers (hours_query, policy, amenities, contact).

## Quick Test

After applying fix:
1. Send: "how many guests do i have left for this month"
2. Check "Handle FAQ" OUTPUT → Should have `responseMessage`
3. Check "Needs AI Response?" INPUT → Should have `responseMessage`
4. Check "Preserve FAQ Response" OUTPUT (if added) → Should have `responseMessage`
5. WhatsApp should send successfully ✅

## Debugging

If still not working, add this debug code to "Handle FAQ" at the end (before final return):

```javascript
// Debug: Log what we're returning
console.log('=== Handle FAQ Return ===');
console.log('intent:', intent);
console.log('responseMessage:', message || guestMessage || '');
console.log('needsAI:', needsAI);
console.log('========================');
```

Then check the execution logs to see what's being returned.
