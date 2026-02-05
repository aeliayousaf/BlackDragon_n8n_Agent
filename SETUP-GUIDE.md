# Complete Setup Guide: WhatsApp Lounge Agent with n8n

## 📋 Prerequisites

Before starting, you'll need:

- [ ] n8n instance (cloud or self-hosted)
- [ ] Airtable account (free tier works)
- [ ] WhatsApp Business API access (via Twilio or 360Dialog)
- [ ] OpenAI API key (or Anthropic Claude API)
- [ ] Basic understanding of JSON and workflows

**Estimated Setup Time:** 2-3 hours

---

## 🚀 Step-by-Step Setup

### PART 1: Airtable Database Setup (30 minutes)

#### 1.1 Create Airtable Base

1. Go to https://airtable.com and sign up/login
2. Click "Add a base" → "Start from scratch"
3. Name it: "Lounge Management"

#### 1.2 Create Members Table

Click "+ Add or import" → "Table"

Create these fields IN ORDER:

| Field Name | Type | Settings |
|------------|------|----------|
| MemberID | Autonumber | Primary field |
| FullName | Single line text | - |
| PhoneNumber | Phone number | - |
| MembershipStatus | Single select | Options: Active, Suspended, Expired |
| MonthlyGuestCount | Number | Integer, default: 0 |
| LastResetDate | Date | Use ISO format |
| TotalLifetimeGuests | Number | Integer, default: 0 |
| JoinDate | Date | - |
| Email | Email | - |
| Notes | Long text | - |

#### 1.3 Add Sample Members

Add at least 2 test members:

**Member 1 (You):**
- FullName: Your Name
- PhoneNumber: Your WhatsApp number with country code (e.g., +12125551234)
- MembershipStatus: Active
- MonthlyGuestCount: 1
- LastResetDate: Today's date
- TotalLifetimeGuests: 5
- JoinDate: One month ago

**Member 2 (Test):**
- FullName: Test User
- PhoneNumber: A test number
- MembershipStatus: Active
- MonthlyGuestCount: 3
- LastResetDate: Today's date
- TotalLifetimeGuests: 15
- JoinDate: Six months ago

#### 1.4 Create Visits Table

Add new table: "Visits"

| Field Name | Type | Settings |
|------------|------|----------|
| VisitID | Autonumber | Primary field |
| Member | Link to another record | Link to Members table |
| VisitDate | Date | - |
| VisitTime | Single line text | - |
| NumberOfGuests | Number | Integer |
| FreeGuests | Number | Integer |
| PaidGuests | Number | Integer |
| GuestFee | Currency | USD, 2 decimals |
| AlcoholSource | Single select | Options: Own, Purchase |
| CorkageFee | Currency | USD, 2 decimals |
| TotalFees | Formula | `{GuestFee} + {CorkageFee}` |
| Status | Single select | Options: Confirmed, Cancelled, Completed |
| ConfirmationSent | Checkbox | - |
| CreatedAt | Created time | - |
| Notes | Long text | - |

#### 1.5 Create LoungeInfo Table

Add new table: "LoungeInfo"

| Field Name | Type |
|------------|------|
| InfoID | Autonumber |
| Category | Single select: Hours, Policies, Amenities, Contact |
| Question | Single line text |
| Answer | Long text |
| IsActive | Checkbox |
| LastUpdated | Last modified time |

#### 1.6 Add Lounge Information

Add these records to LoungeInfo:

**Record 1:**
- Category: Hours
- Question: What are your hours?
- Answer: Monday-Thursday: 5 PM - 12 AM, Friday-Saturday: 4 PM - 2 AM, Sunday: 4 PM - 11 PM
- IsActive: ✓

**Record 2:**
- Category: Policies
- Question: What's the guest policy?
- Answer: Each member can bring up to 3 guests per month at no charge. Additional guests are $50 per person.
- IsActive: ✓

**Record 3:**
- Category: Policies
- Question: What about bringing my own alcohol?
- Answer: You're welcome to bring your own bottles! There's a $30 corkage fee per visit when you bring your own alcohol.
- IsActive: ✓

**Record 4:**
- Category: Amenities
- Question: What amenities do you offer?
- Answer: Private lounge seating, premium bar service, complimentary appetizers, WiFi, music system, and outdoor patio.
- IsActive: ✓

**Record 5:**
- Category: Contact
- Question: What's your address?
- Answer: 123 Main Street, Suite 500, Your City, ST 12345
- IsActive: ✓

#### 1.7 Get Airtable API Credentials

1. Go to https://airtable.com/create/tokens
2. Click "Create new token"
3. Name it: "n8n Lounge Agent"
4. Add these scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
5. Click "Add a base" and select your "Lounge Management" base
6. Click "Create token"
7. **COPY THE TOKEN** (starts with `pat...`) - save it somewhere safe!

8. Get your Base ID:
   - Go to https://airtable.com/api
   - Click on "Lounge Management"
   - The Base ID is in the URL: `https://airtable.com/appXXXXXXXXXXXXXX/api/docs`
   - Copy the `appXXXXXXXXXXXXXX` part

---

### PART 2: WhatsApp Business API Setup (30 minutes)

#### Option A: Twilio (Recommended for beginners)

1. Go to https://www.twilio.com/try-twilio
2. Sign up and verify your account
3. Go to Console → Messaging → Try it out → Try WhatsApp
4. Follow the instructions to connect your WhatsApp number
5. Get your credentials:
   - Account SID (starts with `AC...`)
   - Auth Token
   - WhatsApp number (format: `whatsapp:+14155238886`)

#### Option B: 360Dialog

1. Go to https://www.360dialog.com/
2. Sign up for WhatsApp Business API
3. Complete business verification (takes 1-2 days)
4. Get your API key and phone number ID

**For this guide, we'll use Twilio.**

---

### PART 3: OpenAI API Setup (10 minutes)

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Name it: "n8n Lounge Agent"
6. **COPY THE KEY** (starts with `sk-...`)
7. Add $5-10 credits to your account

---

### PART 4: n8n Setup (45 minutes)

#### 4.1 Install n8n

**Option A: Cloud (Easiest)**
1. Go to https://n8n.io/cloud/
2. Sign up for free trial
3. Access your n8n instance

**Option B: Self-hosted**
```bash
# Using Docker (recommended)
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Or using npm
npm install n8n -g
n8n start
```

Access n8n at: http://localhost:5678

#### 4.2 Add Credentials

1. **Airtable:**
   - Go to Credentials → Add Credential → Airtable API
   - Name: "Lounge Airtable"
   - Access Token: Paste your `pat...` token
   - Test connection → Save

2. **Twilio:**
   - Go to Credentials → Add Credential → Twilio API
   - Name: "WhatsApp Twilio"
   - Account SID: Your `AC...` SID
   - Auth Token: Your token
   - Test connection → Save

3. **OpenAI:**
   - Go to Credentials → Add Credential → OpenAI API
   - Name: "OpenAI GPT-4"
   - API Key: Your `sk-...` key
   - Test connection → Save

#### 4.3 Import the Workflow

1. In n8n, click "Workflows" → "Add Workflow"
2. Click the "..." menu → "Import from File"
3. Upload the `main-workflow.json` file provided
4. The workflow will appear with red warning icons (expected)

#### 4.4 Configure the Workflow

Go through each node and update:

**1. WhatsApp Webhook Node:**
- Leave path as `whatsapp-webhook`
- After saving, COPY the webhook URL
- It will look like: `https://your-n8n.com/webhook/whatsapp-webhook`

**2. Airtable Nodes (4 total):**
- For EACH Airtable node:
  - Click the node
  - Select your "Lounge Airtable" credential
  - In "Application/Base ID": Paste your `appXXXXXXXXXXXXXX`
  - Update table names if you used different names

**3. OpenAI Nodes (2 total):**
- For EACH OpenAI node:
  - Click the node
  - Select your "OpenAI GPT-4" credential
  - Keep model as `gpt-4-turbo-preview`

**4. Twilio WhatsApp Node:**
- Click the node
- Select your "WhatsApp Twilio" credential
- Update the "From" number to your Twilio WhatsApp number

**5. Function Nodes:**
- These should work as-is
- The JavaScript code is pre-configured

#### 4.5 Activate the Workflow

1. Click the toggle switch at the top right
2. Workflow should turn from "Inactive" to "Active"
3. The webhook is now listening for messages!

---

### PART 5: Connect Twilio to n8n (15 minutes)

1. Go to Twilio Console → Messaging → Settings → WhatsApp Sandbox Settings
2. Find "WHEN A MESSAGE COMES IN" section
3. Paste your n8n webhook URL: `https://your-n8n.com/webhook/whatsapp-webhook`
4. Make sure HTTP method is set to `POST`
5. Click "Save"

**Test the connection:**
1. Send a WhatsApp message to your Twilio sandbox number
2. Message: "join [your-sandbox-code]" (shown in Twilio)
3. Then send: "Hello!"
4. Check n8n executions - you should see activity

---

### PART 6: Testing (30 minutes)

#### Test 1: Member Lookup
```
Send: "Hi, coming tonight"
Expected: Bot recognizes you and asks for guest count
```

#### Test 2: Complete Booking
```
Send: "Coming tonight with 2 friends, buying drinks there"
Expected: 
- Bot confirms 2 guests (free)
- Shows no corkage fee
- Total: $0
- Confirmation message
```

#### Test 3: Over Limit
```
Send: "Coming with 5 people and bringing our bottles"
Expected:
- Shows breakdown of free vs paid guests
- Shows corkage fee
- Asks for confirmation
```

#### Test 4: FAQ
```
Send: "What are your hours?"
Expected: Bot responds with operating hours
```

#### Test 5: Non-Member
```
Use a phone number NOT in Airtable
Send: "Hello"
Expected: "I don't have you registered as a member..."
```

---

### PART 7: Customization

#### Update Your Lounge Information

1. In Airtable, update the LoungeInfo table with your actual:
   - Hours
   - Address  
   - Phone number
   - Amenities
   - Any other info

2. Update pricing in the workflow:
   - Open the "Process Visit Booking" Function node
   - Find these constants:
     ```javascript
     const FREE_GUEST_LIMIT = 3;
     const ADDITIONAL_GUEST_FEE = 50;
     const CORKAGE_FEE = 30;
     ```
   - Change the values as needed

#### Adjust AI Personality

In the AI nodes, you can modify the system prompts to change:
- Tone (more formal, more casual)
- Verbosity (shorter, longer responses)
- Additional context

---

## 🔧 Troubleshooting

### Issue: Webhook not receiving messages
**Solution:**
- Check webhook URL is correct in Twilio
- Ensure workflow is ACTIVE in n8n
- Check Twilio logs for errors

### Issue: "Member not found" for valid member
**Solution:**
- Verify phone number format in Airtable matches incoming format
- Check phone number includes country code (+1, +44, etc.)
- Try removing spaces/dashes from phone number

### Issue: AI responses are too long/short
**Solution:**
- Adjust `maxTokens` parameter in OpenAI nodes
- Update system prompt with "Keep responses under X sentences"

### Issue: Database not updating
**Solution:**
- Check Airtable credentials are correct
- Verify field names match exactly (case-sensitive)
- Check Airtable API token has write permissions

### Issue: Bot responds slowly
**Solution:**
- Consider using GPT-3.5-turbo instead of GPT-4 (faster, cheaper)
- Or switch to Anthropic Claude Haiku for speed
- Check if n8n server has adequate resources

---

## 📊 Monitoring & Maintenance

### Daily Checks
- Review n8n execution history for errors
- Check Airtable for any data issues
- Monitor OpenAI API usage

### Weekly Tasks
- Export Airtable data as backup (CSV)
- Review conversation logs for improvements
- Check that monthly reset is working

### Monthly Tasks
- Review and optimize AI prompts
- Analyze usage patterns in Visits table
- Update lounge information if changed
- Check API costs (OpenAI, Twilio)

---

## 💰 Cost Breakdown

**Monthly Estimates (100 conversations):**

- n8n: $20-50/month (cloud) or FREE (self-hosted)
- Airtable: FREE (or $10/mo for Pro)
- Twilio WhatsApp: ~$0.005/message = $1
- OpenAI API: ~$0.03/message = $3
- **Total: ~$24-54/month** (or ~$4/month self-hosted)

---

## 🚀 Next Steps & Enhancements

Once basic setup is working, consider:

1. **Payment Integration**
   - Add Stripe to collect fees automatically
   - Send payment links via WhatsApp

2. **Admin Notifications**
   - Alert staff when someone confirms visit
   - Daily summary of expected guests

3. **Automated Reminders**
   - Send reminder messages day-of
   - Follow-up after visits

4. **Conversation Memory**
   - Store conversation history for context
   - Multi-turn conversations

5. **Advanced Analytics**
   - Dashboard showing usage trends
   - Member engagement metrics
   - Revenue tracking

6. **Cancellation Handling**
   - Let members cancel bookings
   - Update visit status

7. **Voice Messages**
   - Transcribe voice messages
   - Respond to voice

8. **Multi-Language**
   - Detect language
   - Respond in member's language

---

## 📚 Resources

- [n8n Documentation](https://docs.n8n.io/)
- [Airtable API Reference](https://airtable.com/developers/web/api/introduction)
- [Twilio WhatsApp Guide](https://www.twilio.com/docs/whatsapp)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

## 🆘 Support

If you get stuck:

1. Check n8n execution logs for specific errors
2. Review Airtable field names and types
3. Verify all API credentials are correct
4. Test each node individually
5. Check the troubleshooting section above

For complex issues, consider:
- n8n community forum
- Hiring an n8n consultant
- Anthropic's developer community (for AI prompts)

---

## ✅ Setup Checklist

- [ ] Airtable base created with all 4 tables
- [ ] Sample data added to Airtable
- [ ] Airtable API token created
- [ ] Twilio account setup
- [ ] WhatsApp sandbox configured
- [ ] OpenAI API key obtained
- [ ] n8n instance running
- [ ] All credentials added to n8n
- [ ] Workflow imported and configured
- [ ] Webhook URL added to Twilio
- [ ] Workflow activated
- [ ] Test message sent successfully
- [ ] Visit booking tested
- [ ] FAQ tested
- [ ] Database updates verified

**Congratulations! Your WhatsApp Lounge Agent is ready!** 🎉
