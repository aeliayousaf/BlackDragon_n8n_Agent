# Checklist: Fix pendingGuests Not Being Saved

## Quick Checklist (Do These in Order)

### ✅ Step 1: Verify First Message Saves pendingGuests

**Test:** Send "I would like to come in tomorrow and bring 2 more guests with me"

1. **Check "Process Visit Booking" OUTPUT:**
   - [ ] Open "Process Visit Booking" node in execution
   - [ ] Check OUTPUT tab
   - [ ] Verify: `savePendingGuests: 2`
   - [ ] Verify: `action: "request_info"`

2. **Check "Save Pending Visit Data" Node:**
   - [ ] Is the node **green** (executed)?
   - [ ] Check INPUT tab → Does it have `savePendingGuests: 2`?
   - [ ] Check node configuration:
     - Field: `PendingGuests`
     - Value: `={{$json.savePendingGuests}}`
   - [ ] Check OUTPUT tab → Did it save successfully?

3. **Check Airtable Directly:**
   - [ ] Open your Airtable base
   - [ ] Find member "Aelia Yousaf"
   - [ ] Check `PendingGuests` field
   - [ ] **Expected:** `2`
   - [ ] **If empty/null:** "Save Pending Visit Data" isn't working!

### ✅ Step 2: Verify Second Message Reads pendingGuests

**Test:** Send "yes i will bring my own"

1. **Check "Process Member Data" OUTPUT:**
   - [ ] Open "Process Member Data" node in execution
   - [ ] Check OUTPUT tab
   - [ ] Verify: `pendingGuests: 2` (from Airtable)
   - [ ] **If null:** Airtable field is empty OR not being read

2. **Check "Classify Intent" OUTPUT:**
   - [ ] Open "Classify Intent" node in execution
   - [ ] Check OUTPUT tab
   - [ ] Verify: `pendingGuests: 2` OR `guests: 2`
   - [ ] **If both null:** "Classify Intent" isn't using `pendingGuests`

3. **Check "Process Visit Booking" INPUT:**
   - [ ] Open "Process Visit Booking" node in execution
   - [ ] Check INPUT tab
   - [ ] Verify: `guests: 2` OR `pendingGuests: 2`
   - [ ] **If both null:** Data isn't being passed correctly

## Common Fixes

### Fix 1: "Save Pending Visit Data" Not Executing

**Problem:** Node is grey (not executed)

**Solution:** Check workflow connections:
- "Process Visit Booking" should connect to "Save Pending Visit Data"
- This should happen for `action: 'request_info'` cases

**Current flow might be:**
```
Process Visit Booking → Needs Database Update? (FALSE) → WhatsApp
```

**Should also have:**
```
Process Visit Booking → Save Pending Visit Data (for request_info)
```

**OR merge into one update:**
```
Process Visit Booking → Needs Database Update?
  ├─ TRUE → Airtable: Update Member (updates MonthlyGuestCount AND pending fields)
  └─ FALSE → Save Pending Visit Data → WhatsApp
```

### Fix 2: "Save Pending Visit Data" Field Mapping Wrong

**Problem:** Node executes but Airtable field stays empty

**Solution:** Update node configuration:
- Field: `PendingGuests`
- Value: `={{$json.savePendingGuests}}`
- **NOT:** `={{$json.guests}}` or `={{$json.pendingGuests}}`

### Fix 3: "Process Member Data" Not Reading Correctly

**Problem:** `pendingGuests: null` even though Airtable has value

**Solution:** Verify code reads from correct field:
```javascript
const pendingGuests = data.fields && data.fields.PendingGuests;
```

Make sure field name matches exactly (case-sensitive).

### Fix 4: "Classify Intent" Not Using pendingGuests

**Problem:** `guests: null` even though `pendingGuests: 2`

**Solution:** Ensure code uses `pendingGuests`:
- When alcohol is detected, `extractGuestAndTimeFromMessage()` should use `pendingGuests`
- Make sure `hasPendingVisit` is true when `pendingGuests` exists

### Fix 5: Workflow Connections Wrong

**Problem:** "Save Pending Visit Data" isn't in the flow

**Solution:** Ensure "Process Visit Booking" connects to "Save Pending Visit Data" for `request_info` actions.

**Option A: Separate Branch**
```
Process Visit Booking
  ├─→ Needs Database Update? (for confirm_visit)
  └─→ Save Pending Visit Data (for request_info) → WhatsApp
```

**Option B: Merge into Airtable Update**
- Update "Airtable: Update Member" to also save pending fields:
  - `PendingGuests` = `={{$json.savePendingGuests}}`
  - `PendingTime` = `={{$json.savePendingTime}}`
  - `PendingAlcohol` = `={{$json.savePendingAlcohol}}`

## Most Likely Issue

Based on the conversation, **"Save Pending Visit Data" is probably not executing** or **not saving correctly**.

**Priority Check:**
1. ✅ Is "Save Pending Visit Data" node green after first message?
2. ✅ Does Airtable `PendingGuests` field have value `2`?
3. ✅ Does "Process Member Data" read `pendingGuests: 2`?

If any answer is NO, that's your problem!

## Quick Test

Add this debug code to "Process Visit Booking" at the start:

```javascript
const data = $json;
console.log('=== DEBUG ===');
console.log('guests:', data.guests);
console.log('pendingGuests:', data.pendingGuests);
console.log('savePendingGuests will be:', (data.guests !== null && data.guests !== undefined && !isNaN(data.guests)) ? data.guests : null);
```

This shows what will be saved.
