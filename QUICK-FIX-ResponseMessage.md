# Quick Fix: Missing responseMessage After Airtable Update

## The Problem
"Airtable: Update Member" returns the updated Airtable record, which doesn't have `responseMessage`, causing the WhatsApp node to fail.

## The Fix (2 Steps):

### Step 1: Add Function Node
1. In n8n, add a new **Function** node
2. Name it: **"Preserve Response Message"**
3. Place it **between** "Airtable: Update Member" and "WhatsApp: Send Response"

### Step 2: Add This Code
Copy this simple code into the Function node:

```javascript
// Get original data from Process Visit Booking node
const originalData = $('Process Visit Booking').first().json;

// Return the original data which has responseMessage
return originalData;
```

### Step 3: Update Connections
1. **Disconnect:** "Airtable: Update Member" → "WhatsApp: Send Response"
2. **Connect:** "Airtable: Update Member" → "Preserve Response Message" → "WhatsApp: Send Response"

## Visual:

```
Airtable: Update Member
  └─→ Preserve Response Message (NEW)
       └─→ WhatsApp: Send Response
```

## Why This Works:

- `$('Process Visit Booking')` gets the data from the "Process Visit Booking" node
- This data includes `responseMessage` and all other fields
- We return it unchanged, so WhatsApp receives the message

## Testing:

After adding this node, test a booking:
1. Should go: Process Visit → Needs Update? → Airtable Update → **Preserve Response** → WhatsApp
2. WhatsApp should receive `responseMessage` and send successfully
