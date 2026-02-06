# Where to Add totalLifetimeGuests

## Location: "Process Member Data" Node

### Step 1: Find the Node
1. Open your n8n workflow
2. Look for the node named **"Process Member Data"** (ID: `c7632c10-719a-4d09-9c2b-b3fedee92e8b`)
3. Click on it to open the Function node editor

### Step 2: Find the Return Statement
Scroll down in the Function Code editor until you see the `return {` statement. It should look like this:

```javascript
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
```

### Step 3: Add totalLifetimeGuests
Add this line **right after** `freeGuestsRemaining: freeGuestsRemaining,`:

```javascript
  freeGuestsRemaining: freeGuestsRemaining,
  totalLifetimeGuests: (data.fields && data.fields.TotalLifetimeGuests) || 0,  // ADD THIS LINE
  needsReset: needsReset,
```

### Complete Example
Here's what the return statement should look like after adding it:

```javascript
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
  totalLifetimeGuests: (data.fields && data.fields.TotalLifetimeGuests) || 0,  // ← ADDED HERE
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
```

### Step 4: Save
1. Click **"Save"** or **"Execute Node"** to save the changes
2. The node should now pass `totalLifetimeGuests` to the next nodes

## What This Does
This reads the `TotalLifetimeGuests` field from Airtable and passes it to the "Process Visit Booking" node, which can then calculate the new total lifetime guests count.
