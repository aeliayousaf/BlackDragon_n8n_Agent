# CRITICAL FIX: Airtable Update Node Still Has Hardcoded Values

## The Problem
Line 556 in `main-workflow.json` shows:
```json
"MonthlyGuestCount": 0,
```

This is **hardcoded to 0**, which means every booking resets the count to 0 instead of updating it!

## The Fix - Step by Step

### Step 1: Open "Airtable: Update Member" Node in n8n

1. In your n8n workflow, find the node named **"Airtable: Update Member"**
2. Click on it to open the configuration

### Step 2: Find the "Columns" Section

Look for a section called **"Columns"** or **"Fields to Update"**. You should see fields like:
- `AutoRenew`
- `id`
- `MembershipPrice`
- `MonthlyGuestCount` ← **THIS ONE IS WRONG**
- `TotalLifetimeGuests` ← **THIS ONE IS ALSO WRONG**
- `PendingGuests`
- `PendingTime`
- `PendingAlcohol`

### Step 3: Fix MonthlyGuestCount

Find the `MonthlyGuestCount` field and change:

**FROM:**
```
MonthlyGuestCount: 0
```

**TO:**
```
MonthlyGuestCount: ={{$json.newMonthlyGuestCount}}
```

**OR** if it's in a dropdown/field editor, type:
```
={{$json.newMonthlyGuestCount}}
```

### Step 4: Fix TotalLifetimeGuests

Find the `TotalLifetimeGuests` field and change:

**FROM:**
```
TotalLifetimeGuests: 0
```

**TO:**
```
TotalLifetimeGuests: ={{$json.newTotalLifetimeGuests || $json.totalLifetimeGuests || 0}}
```

### Step 5: Save

Click **"Save"** or **"Execute Node"** to save your changes.

## Visual Guide

The node configuration should look like this:

```
Columns:
├── AutoRenew: false
├── id: ={{$json.memberId}}
├── MembershipPrice: 0
├── MonthlyGuestCount: ={{$json.newMonthlyGuestCount}}  ← CHANGED FROM 0
├── TotalLifetimeGuests: ={{$json.newTotalLifetimeGuests || $json.totalLifetimeGuests || 0}}  ← CHANGED FROM 0
├── PendingGuests: ={{$json.savePendingGuests}}
├── PendingTime: ={{$json.savePendingTime}}
└── PendingAlcohol: ={{$json.savePendingAlcohol}}
```

## Important Notes

1. **Only update when `action === 'confirm_visit'`**: Make sure the "Needs Database Update?" node only routes to this update when a visit is confirmed, not for other actions.

2. **The `newMonthlyGuestCount` comes from**: The "Process Visit Booking" node calculates this and passes it in the return object.

3. **If the field doesn't exist**: Make sure `newMonthlyGuestCount` is being returned from "Process Visit Booking" node (it should be if you're using `FIX-Process-Visit-Booking-Monthly.js`).

## Testing After Fix

1. **First booking:** "i want to come with 3 guests"
   - Check Airtable → `MonthlyGuestCount` should be **3** (not 0)

2. **Second booking:** "i want to come tomorrow with 2 guests"
   - Check "Process Member Data" → Should read `MonthlyGuestCount = 3` from Airtable
   - Should calculate `freeGuestsRemaining = 3 - 3 = 0`
   - Should show "You have 0 free guests remaining" (not 3)

## If Still Not Working

Check:
1. Is `newMonthlyGuestCount` being returned from "Process Visit Booking"?
2. Is the "Needs Database Update?" node routing correctly?
3. Is the update happening before the next message is processed?
