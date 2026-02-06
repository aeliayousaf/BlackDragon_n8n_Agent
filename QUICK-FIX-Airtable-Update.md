# Quick Fix: Airtable Update Node

## The Problem
After booking 3 guests, the system shows "You have 3 free guests remaining" on the next message because `MonthlyGuestCount` is hardcoded to `0` in Airtable.

## The Fix (2 Steps)

### Step 1: Update "Process Member Data" Node

Add `totalLifetimeGuests` to the return object (around line 164):

```javascript
// ... existing code ...

return {
  memberId: data.id,
  memberName: (data.fields && data.fields.FullName) || 'Member',
  // ... existing fields ...
  currentGuestCount: currentGuestCount,
  freeGuestsRemaining: freeGuestsRemaining,
  totalLifetimeGuests: (data.fields && data.fields.TotalLifetimeGuests) || 0, // ADD THIS LINE
  // ... rest of existing fields ...
};
```

### Step 2: Update "Airtable: Update Member" Node

In n8n, find the "Airtable: Update Member" node and change:

**Current (WRONG):**
```
MonthlyGuestCount: 0
TotalLifetimeGuests: 0
```

**To (CORRECT):**
```
MonthlyGuestCount: ={{$json.newMonthlyGuestCount}}
TotalLifetimeGuests: ={{$json.newTotalLifetimeGuests || $json.totalLifetimeGuests || 0}}
```

## How to Update in n8n:

1. Click on "Airtable: Update Member" node
2. Find the "Columns" section
3. Look for `MonthlyGuestCount` field
4. Change the value from `0` to `={{$json.newMonthlyGuestCount}}`
5. Change `TotalLifetimeGuests` from `0` to `={{$json.newTotalLifetimeGuests || $json.totalLifetimeGuests || 0}}`
6. Save the node

## Testing

1. Book 3 guests → Should update `MonthlyGuestCount` to 3
2. Book again → Should read 3 from Airtable, show 0 free guests remaining
