# URGENT: Airtable Node Still Has MonthlyGuestCount: 0

## The Problem
The JSON file shows `"MonthlyGuestCount": 0` on line 556, which means the Airtable node is still hardcoded to 0. Even though the node executes, it's updating Airtable with 0 instead of the calculated value.

## The Fix - Do This NOW:

### Step 1: Open "Airtable: Update Member" Node
1. In n8n, click on **"Airtable: Update Member"** node
2. Make sure you're on the **"Parameters"** tab

### Step 2: Find MonthlyGuestCount Field
Look for the **"Fields"** or **"Columns"** section. You should see a list of fields.

### Step 3: Check MonthlyGuestCount Value
Find the `MonthlyGuestCount` field and check what value it has:

**If it shows:**
```
MonthlyGuestCount: 0
```
**OR**
```
MonthlyGuestCount: [empty or just "0"]
```

**Change it to:**
```
MonthlyGuestCount: ={{$json.newMonthlyGuestCount}}
```

### Step 4: How to Change It
1. Click on the `MonthlyGuestCount` field value
2. Delete the `0`
3. Type: `={{$json.newMonthlyGuestCount}}`
4. Make sure it's an expression (should show as blue/purple text, not plain text)

### Step 5: Also Fix TotalLifetimeGuests
While you're there, change `TotalLifetimeGuests` from `0` to:
```
={{$json.newTotalLifetimeGuests || $json.totalLifetimeGuests || 0}}
```

### Step 6: SAVE!
Click **"Save"** or **"Execute Node"** to save your changes.

## Visual Check:

The field should look like this:
```
MonthlyGuestCount: ={{$json.newMonthlyGuestCount}}
```

NOT like this:
```
MonthlyGuestCount: 0
```

## Why This Matters:

- **Current:** Node executes → Updates Airtable with `MonthlyGuestCount: 0` → Table shows 0 ❌
- **After Fix:** Node executes → Updates Airtable with `MonthlyGuestCount: 3` → Table shows 3 ✅

## Testing:

1. **After fixing**, test with: "i want to come with 3 guests"
2. **Check Airtable** → `MonthlyGuestCount` should be **3** (not 0)
3. **Next message** → Should show "0 free guests remaining" (not 3)

## If It Still Doesn't Work:

Check the execution logs:
1. Click on "Airtable: Update Member" node in the execution
2. Check the **INPUT** tab - does it show `newMonthlyGuestCount: 3`?
3. Check the **OUTPUT** tab - does it show the updated record?
4. If INPUT doesn't have `newMonthlyGuestCount`, the data isn't being passed correctly from "Process Visit Booking"
