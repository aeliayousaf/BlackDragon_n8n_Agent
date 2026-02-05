# WhatsApp Lounge Agent - Complete Setup Package

An intelligent WhatsApp automation system for managing lounge members, tracking guest limits, and calculating fees automatically using n8n, Airtable, and AI.

## 🎯 What This Does

Your members can text your WhatsApp number to:
- ✅ Notify you they're coming to the lounge
- ✅ Specify how many guests they're bringing
- ✅ Indicate if they're bringing alcohol or buying from you
- ✅ Get instant confirmation with fee breakdown
- ✅ Ask questions about hours, policies, and amenities

The system automatically:
- ✅ Tracks each member's monthly guest count (3 free, $50 each additional)
- ✅ Calculates corkage fees ($30 when bringing own alcohol)
- ✅ Updates your database in real-time
- ✅ Resets guest counts monthly
- ✅ Responds to common questions 24/7

## 📦 What's Included

```
whatsapp-lounge-agent/
├── workflows/
│   ├── main-workflow.json              # Main WhatsApp conversation handler
│   └── monthly-reset-workflow.json     # Automatic monthly guest reset
├── database/
│   └── airtable-schema.md              # Complete database structure
├── code/
│   ├── calculation-logic.js            # Fee calculation functions
│   └── ai-prompts.md                   # AI prompt templates
└── documentation/
    ├── SETUP-GUIDE.md                  # Step-by-step setup (start here!)
    ├── QUICK-REFERENCE.md              # Quick tips and common tasks
    └── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites
- n8n instance (cloud or self-hosted)
- Airtable account
- WhatsApp Business API (via Twilio)
- OpenAI API key
- 2-3 hours for initial setup

### Setup Steps

1. **Read the Setup Guide First**
   - Open `documentation/SETUP-GUIDE.md`
   - Follow step-by-step instructions
   - Complete all 7 parts

2. **Set Up Airtable**
   - Create database tables
   - Add your member data
   - Get API credentials

3. **Configure WhatsApp**
   - Set up Twilio account
   - Connect WhatsApp number
   - Get credentials

4. **Import to n8n**
   - Import workflow files
   - Add credentials
   - Configure nodes
   - Activate workflows

5. **Test Everything**
   - Send test messages
   - Verify calculations
   - Check database updates

## 💰 Business Rules

### Guest Policy
- Each member gets **3 free guests per month**
- Additional guests: **$50 per guest**
- Guest count resets on the 1st of each month

### Alcohol Policy
- Bringing own alcohol: **$30 corkage fee per visit**
- Purchasing from lounge: **No fee**

### Customize These
All pricing and limits can be easily changed in the workflow configuration.

## 📱 Example Conversations

### Simple Booking
```
Member: "Coming tonight with 2 friends, buying drinks there"

Bot: "✅ Booking Confirmed!
👤 Member: John Smith
👥 Guests: 2
   • Free guests: 2

🍾 Alcohol: Purchasing from us

💰 Total Charges: $0

📊 Free guests remaining this month: 1

See you soon! 🥂"
```

### Over Guest Limit
```
Member: "Bringing 5 people tonight and our bottles"

Bot: "✅ Booking Confirmed!
👤 Member: Sarah Johnson
👥 Guests: 5
   • Free guests: 1
   • Additional guests: 4 × $50 = $200

🍾 Alcohol: Bringing own
   • Corkage fee: $30

💰 Total Charges: $230

⚠️ You've used all free guests this month.

See you soon! 🥂"
```

### FAQ
```
Member: "What time do you close on Saturday?"

Bot: "We close at 2 AM on Saturdays! 🌙"
```

## 🏗️ System Architecture

```
WhatsApp Message
    ↓
Twilio API
    ↓
n8n Webhook
    ↓
Member Lookup (Airtable)
    ↓
AI Intent Classification (OpenAI)
    ↓
┌─────────────┬──────────────┐
│             │              │
Visit         FAQ            Other
Booking       Response       Response
    ↓             ↓              ↓
Calculate     Query Info     Generate
Fees          Table          Response
    ↓             ↓              ↓
Update        Format         Format
Database      Response       Response
    ↓             ↓              ↓
└─────────────┴──────────────┘
              ↓
    Send WhatsApp Response
```

## 🛠️ Technologies Used

- **n8n** - Workflow automation platform
- **Airtable** - Database for members and visits
- **Twilio** - WhatsApp Business API provider
- **OpenAI GPT-4** - Natural language understanding
- **JavaScript** - Custom logic and calculations

## 📊 Cost Estimate

For 100 conversations per month:
- n8n: $0-50 (free if self-hosted)
- Airtable: $0 (free tier)
- Twilio: ~$1
- OpenAI: ~$3
- **Total: $4-54/month**

## 🔒 Security & Privacy

- All credentials stored securely in n8n
- Member data stored in private Airtable base
- API keys never exposed in code
- WhatsApp end-to-end encryption maintained
- No data shared with third parties

## 🎨 Customization

Everything is customizable:

**Pricing**
- Guest limits and fees
- Corkage fees
- Any additional charges

**Responses**
- Message formatting
- Tone and personality
- Language and emojis

**Logic**
- Booking rules
- Eligibility criteria
- Special member tiers

**Features**
- Add payment processing
- SMS notifications to staff
- Booking modifications
- Member tiers

See `documentation/QUICK-REFERENCE.md` for customization details.

## 📚 Documentation

1. **SETUP-GUIDE.md** - Complete step-by-step setup instructions
2. **QUICK-REFERENCE.md** - Common tasks and troubleshooting
3. **airtable-schema.md** - Database structure details
4. **ai-prompts.md** - AI prompt engineering guide
5. **calculation-logic.js** - Commented code with examples

## 🐛 Troubleshooting

### Bot Not Responding?
1. Check workflow is active in n8n
2. Verify webhook URL in Twilio
3. Check recent executions for errors

### Wrong Fee Calculations?
1. Verify member's guest count in Airtable
2. Check calculation constants in workflow
3. Review test scenarios

### Database Not Updating?
1. Verify Airtable credentials
2. Check field names match exactly
3. Review API token permissions

See `SETUP-GUIDE.md` for detailed troubleshooting.

## 🚀 Next Steps After Setup

1. **Test Thoroughly**
   - Run all test scenarios
   - Verify calculations
   - Check database updates

2. **Add Real Members**
   - Import member data to Airtable
   - Include phone numbers with country codes
   - Set initial guest counts

3. **Monitor First Week**
   - Check executions daily
   - Review conversation quality
   - Note any needed adjustments

4. **Optimize**
   - Adjust AI prompts based on feedback
   - Fine-tune response formatting
   - Add custom features

5. **Scale**
   - Add more members
   - Implement payment collection
   - Build analytics dashboard

## 📈 Feature Roadmap

**Phase 1 (Current):**
- ✅ Member identification
- ✅ Visit booking with fee calculation
- ✅ Guest tracking
- ✅ FAQ responses
- ✅ Monthly resets

**Phase 2 (Next):**
- Payment collection via Stripe
- Staff notifications
- Booking cancellation
- Conversation history

**Phase 3 (Future):**
- Multi-language support
- Voice message handling
- Advanced analytics
- Member portal

## 💡 Pro Tips

1. Start with a small test group of tech-savvy members
2. Keep your Airtable data backed up weekly
3. Monitor API costs in the first month
4. Update lounge info in Airtable, not in code
5. Test edge cases before launching fully
6. Set up spending alerts on OpenAI and Twilio
7. Review and improve AI prompts monthly

## 🆘 Support

**Self-Help:**
1. Check `SETUP-GUIDE.md` troubleshooting section
2. Review `QUICK-REFERENCE.md` for common tasks
3. Examine n8n execution logs for errors
4. Verify Airtable data structure

**Community:**
- n8n Community Forum: https://community.n8n.io/
- Airtable Community: https://community.airtable.com/

**Professional Help:**
- n8n Consulting: https://n8n.io/partners/
- Automation Experts: Upwork, Fiverr

## 📄 License

This is a complete implementation package provided for your business use. Feel free to:
- Modify any code or workflows
- Customize for your specific needs
- Add additional features
- Use commercially in your lounge business

## 🙏 Acknowledgments

Built with:
- n8n - Workflow automation platform
- Airtable - Flexible database solution
- OpenAI - AI language models
- Twilio - Communications platform

## ✨ Success Stories

This system is designed for lounges, clubs, and membership-based businesses that need to:
- Automate member communications
- Track guest limits and fees
- Provide 24/7 member support
- Reduce administrative overhead
- Improve member experience

## 📧 Questions?

Review the documentation files in order:
1. Start with `SETUP-GUIDE.md`
2. Reference `QUICK-REFERENCE.md` during use
3. Consult `airtable-schema.md` for database questions
4. Check `ai-prompts.md` for conversation improvements

---

**Ready to get started? Open `documentation/SETUP-GUIDE.md` and follow the step-by-step instructions!**

Good luck with your lounge automation! 🎉
