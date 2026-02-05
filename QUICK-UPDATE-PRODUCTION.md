# ⚡ Quick Production Update Guide

## What to Change (2 Nodes)

Once you have your **production WhatsApp number** from Twilio, update these 2 nodes in your `main-workflow.json` workflow:

---

### 1. Node: "WhatsApp: Send Response"

**Location**: Line ~536 in workflow JSON

**Current**:
```json
"from": "whatsapp:+14155238886"
```

**Change to** (replace with your production number):
```json
"from": "whatsapp:+YOUR_PRODUCTION_NUMBER"
```

**Example**: If your production number is `+16472032776`:
```json
"from": "whatsapp:+16472032776"
```

---

### 2. Node: "Admin SMS: Send"

**Location**: Line ~1024 in workflow JSON

**Current**:
```json
"from": "whatsapp:+14155238886"
```

**Change to** (replace with your production number):
```json
"from": "whatsapp:+YOUR_PRODUCTION_NUMBER"
```

**Example**: If your production number is `+16472032776`:
```json
"from": "whatsapp:+16472032776"
```

---

## How to Update in n8n UI

1. Open your workflow in n8n
2. Click on **"WhatsApp: Send Response"** node
3. Find the **"From"** field
4. Replace `+14155238886` with your production number (keep the `whatsapp:` prefix)
5. Click **Save**
6. Repeat for **"Admin SMS: Send"** node
7. **Activate** the workflow (toggle switch at top right)

---

## Format Requirements

- ✅ **Correct**: `whatsapp:+16472032776`
- ❌ **Wrong**: `+16472032776` (missing `whatsapp:` prefix)
- ❌ **Wrong**: `whatsapp:16472032776` (missing `+` sign)
- ❌ **Wrong**: `whatsapp:(647) 203-2776` (wrong format)

**Rule**: Always use `whatsapp:+E164` format where E164 is your number with country code (e.g., `+1` for US/Canada).

---

## After Updating

1. ✅ Update Twilio webhook (see `GO-LIVE-CHECKLIST.md` Step 3)
2. ✅ Test incoming messages
3. ✅ Test outgoing messages
4. ✅ Monitor for errors

---

**Need the full checklist?** See `GO-LIVE-CHECKLIST.md` for complete production setup guide.
