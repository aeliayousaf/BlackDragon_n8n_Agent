# 🚀 Going Live Checklist - WhatsApp Concierge Service

## Overview
This guide walks you through moving from Twilio **sandbox** to **production** WhatsApp Business API.

---

## ✅ STEP 1: Get Your Production WhatsApp Number (1-3 days)

### 1.1 Request WhatsApp Business API Access

1. **Log into Twilio Console**: https://console.twilio.com/
2. **Navigate to**: Messaging → Try it out → WhatsApp
3. **Click**: "Request WhatsApp Business API Access" (or "Get Started" if you see it)
4. **Fill out the form**:
   - Business name
   - Business type
   - Website URL
   - Business description
   - Use case description (e.g., "Customer concierge service for lounge members")
5. **Submit** and wait for approval (usually 1-3 business days)

### 1.2 Complete Business Verification

Twilio will review your application. You may need to provide:
- Business registration documents
- Proof of business address
- Website verification
- Use case details

**Status check**: Go to Messaging → WhatsApp → Senders to see approval status.

### 1.3 Get Your Production Number

Once approved:
1. Go to **Messaging → WhatsApp → Senders**
2. You'll see your approved WhatsApp Business number (format: `+1XXXXXXXXXX`)
3. **Copy this number** - you'll need it for the workflow

**Example**: If your number is `+16472032776`, you'll use `whatsapp:+16472032776` in n8n.

---

## ✅ STEP 2: Update n8n Workflow (5 minutes)

### 2.1 Update WhatsApp Send Nodes

You need to update **2 nodes** in your workflow:

#### Node 1: "WhatsApp: Send Response"
- **Current**: `from: "whatsapp:+14155238886"` (sandbox)
- **Change to**: `from: "whatsapp:+YOUR_PRODUCTION_NUMBER"`

#### Node 2: "Admin SMS: Send"
- **Current**: `from: "whatsapp:+14155238886"` (sandbox)
- **Change to**: `from: "whatsapp:+YOUR_PRODUCTION_NUMBER"`

**How to update**:
1. Open your workflow in n8n
2. Click on "WhatsApp: Send Response" node
3. In the "From" field, replace `+14155238886` with your production number
4. Repeat for "Admin SMS: Send" node
5. **Save** the workflow

---

## ✅ STEP 3: Update Twilio Webhook Configuration (5 minutes)

### 3.1 Get Your n8n Webhook URL

1. In n8n, open your workflow
2. Click on the **"WhatsApp Webhook"** node
3. Copy the webhook URL (looks like: `https://your-n8n.com/webhook/whatsapp-webhook`)

### 3.2 Configure Twilio Production Webhook

1. Go to **Twilio Console → Messaging → WhatsApp → Senders**
2. Click on your **production WhatsApp number**
3. Scroll to **"WHEN A MESSAGE COMES IN"** section
4. Paste your n8n webhook URL
5. **Set HTTP method to POST** (⚠️ **Must be POST, not GET**)
   - Twilio sends message data in the request body (phone number, message text, etc.)
   - POST is required to receive this data
   - Your n8n webhook is already configured for POST
6. Click **Save**

**Important**: 
- This is different from the sandbox settings. Make sure you're configuring the **production sender**, not the sandbox.
- **Always use POST** - Twilio webhooks require POST because they send data in the request body, not URL parameters.

---

## ✅ STEP 4: Test Production Setup (15 minutes)

### 4.1 Test Incoming Messages

1. **Send a WhatsApp message** to your production number from a real phone
2. **Check n8n executions**:
   - Go to Executions tab in n8n
   - You should see a new execution triggered
   - Verify it completes successfully

### 4.2 Test Outgoing Messages

Send test messages that trigger responses:
- `"Hi"` → Should get a greeting
- `"What are your hours?"` → Should get hours info
- `"Coming tonight"` → Should trigger booking flow

### 4.3 Test Admin Notifications

1. Trigger a booking that sends admin notifications
2. Verify admins receive messages on your production number

---

## ✅ STEP 5: Production Considerations

### 5.1 Twilio Pricing

**Sandbox**: Free (limited to joined numbers)
**Production**: Pay-per-message pricing
- **Inbound**: ~$0.005 per message
- **Outbound**: ~$0.005 per message (varies by country)

**Monitor usage**: Twilio Console → Usage → Messaging

### 5.2 Rate Limits

- **Sandbox**: Very limited
- **Production**: Higher limits, but still rate-limited
- **Best practice**: Add error handling for rate limit errors (429)

### 5.3 Message Templates (24-Hour Window)

**Important**: After a user sends you a message, you have **24 hours** to send template-free messages. After 24 hours, you must use **approved message templates**.

**Current workflow**: Uses conversational messages (no templates needed within 24h window)

**If you need to message users after 24h**:
- Create message templates in Twilio Console → Messaging → Content → Templates
- Get template approval (can take hours/days)
- Update workflow to use template SID instead of free-form text

### 5.4 Error Monitoring

Set up monitoring for:
- Failed Twilio API calls
- n8n execution errors
- Airtable connection issues
- OpenAI API failures

**Recommended**: Check n8n Executions tab daily for failed runs.

### 5.5 Backup & Recovery

- **Export workflow**: Regularly export `main-workflow.json` as backup
- **Test restore**: Know how to re-import if needed
- **Documentation**: Keep notes on any custom configurations

---

## ✅ STEP 6: Deactivate Sandbox (Optional)

Once production is working:

1. Go to **Twilio Console → Messaging → WhatsApp → Sandbox**
2. You can leave sandbox active for testing, or deactivate it
3. **Recommendation**: Keep sandbox active for testing new features before deploying to production

---

## 🔧 Troubleshooting

### Issue: "Invalid From and To pair"
**Solution**: 
- Verify `from` field uses `whatsapp:+E164` format
- Ensure production number is correct
- Check Twilio Console → Messaging → WhatsApp → Senders to confirm number status

### Issue: Messages not received
**Solution**:
- Verify webhook URL is correct in Twilio
- Check n8n workflow is **ACTIVE**
- Check Twilio logs: Console → Monitor → Logs → Messaging

### Issue: "Message template required"
**Solution**:
- User hasn't messaged you in 24+ hours
- Create and use approved message templates for outbound messages
- Or wait for user to message you first (resets 24h window)

### Issue: High costs
**Solution**:
- Monitor Twilio usage dashboard
- Set up billing alerts in Twilio Console
- Review message volume and optimize workflow to reduce unnecessary messages

---

## 📋 Pre-Launch Checklist

- [ ] Production WhatsApp Business API number approved
- [ ] Updated `from` field in "WhatsApp: Send Response" node
- [ ] Updated `from` field in "Admin SMS: Send" node
- [ ] Twilio webhook configured for production number
- [ ] Tested incoming messages
- [ ] Tested outgoing messages
- [ ] Tested admin notifications
- [ ] Verified Airtable connections work
- [ ] Verified OpenAI API has credits
- [ ] Set up Twilio billing alerts
- [ ] Documented production number and webhook URL
- [ ] Exported workflow backup

---

## 🎯 Next Steps After Going Live

1. **Monitor for 24-48 hours**: Watch for errors, check message delivery
2. **Gather feedback**: Ask members about response quality
3. **Optimize**: Adjust AI prompts, improve FAQ responses based on real usage
4. **Scale**: If volume increases, consider:
   - Upgrading n8n plan (if cloud)
   - Adding more OpenAI credits
   - Implementing message templates for 24h+ scenarios

---

## 📞 Support Resources

- **Twilio Support**: https://support.twilio.com/
- **Twilio WhatsApp Docs**: https://www.twilio.com/docs/whatsapp
- **n8n Docs**: https://docs.n8n.io/
- **n8n Community**: https://community.n8n.io/

---

**Ready to go live?** Follow steps 1-4, then monitor closely for the first few days!
