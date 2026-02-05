# Quick Reference Guide

## 🎯 Key Information

### System Constants
- **Free Guests per Month:** 3
- **Additional Guest Fee:** $50 per guest
- **Corkage Fee:** $30 per visit

### Workflow Components
- Main Workflow: `main-workflow.json`
- Monthly Reset: `monthly-reset-workflow.json`

---

## 📱 Test Messages

### Valid Member - Simple Booking
```
Coming tonight with 2 friends, buying drinks there
```
Expected: Free guests used, no corkage, $0 total

### Valid Member - With Corkage
```
Coming in tomorrow with 1 guest, bringing our own bottles
```
Expected: 1 free guest, $30 corkage, $30 total

### Valid Member - Over Limit
```
Bringing 5 people tonight and our alcohol
```
(Assuming member has used 2 guests already)
Expected: 1 free, 4 paid ($200), $30 corkage, $230 total

### FAQ Questions
```
What are your hours?
What's the address?
Can I bring guests?
Tell me about corkage fees
```

### Incomplete Information
```
Coming tonight
I'll be there later
Visiting soon
```
Expected: Bot asks for guest count and alcohol preference

---

## 🔑 Important Field Names (Case Sensitive!)

### Airtable - Members Table
- `MemberID`
- `FullName`
- `PhoneNumber`
- `MembershipStatus`
- `MonthlyGuestCount`
- `LastResetDate`
- `TotalLifetimeGuests`

### Airtable - Visits Table
- `VisitID`
- `Member` (linked record)
- `VisitDate`
- `NumberOfGuests`
- `FreeGuests`
- `PaidGuests`
- `GuestFee`
- `AlcoholSource`
- `CorkageFee`
- `Status`

### Airtable - LoungeInfo Table
- `Category`
- `Question`
- `Answer`
- `IsActive`

---

## 🔧 Common Modifications

### Change Pricing
File: `main-workflow.json` → "Process Visit Booking" node

```javascript
const FREE_GUEST_LIMIT = 3;        // Change this
const ADDITIONAL_GUEST_FEE = 50;   // Change this
const CORKAGE_FEE = 30;            // Change this
```

### Change AI Temperature
In any OpenAI node:
```json
"temperature": 0.3  // Lower = more consistent (0.0-1.0)
```

### Change Response Length
In OpenAI nodes:
```json
"maxTokens": 250  // Increase for longer responses
```

### Update Lounge Info
Edit records in Airtable's `LoungeInfo` table - no code changes needed!

---

## 📊 Monitoring

### Check Workflow Executions
1. Go to n8n → Executions
2. Look for errors (red icon)
3. Click execution to see details

### Check Airtable Data
1. Visits table - see all bookings
2. Members table - verify guest counts
3. ConversationLog (optional) - full message history

### API Usage
- **OpenAI:** https://platform.openai.com/usage
- **Twilio:** Twilio Console → Usage

---

## 🚨 Emergency Procedures

### Bot Stopped Responding
1. Check workflow is ACTIVE in n8n
2. Check webhook URL in Twilio is correct
3. Look at recent executions for errors
4. Verify all credentials are valid

### Wrong Guest Count
1. Check member record in Airtable
2. Manually update `MonthlyGuestCount` if needed
3. Check `LastResetDate` is current month

### Bot Giving Wrong Prices
1. Check constants in "Process Visit Booking" node
2. Verify calculation logic
3. Test with known scenarios

### Database Not Updating
1. Check Airtable credentials
2. Verify field names match exactly
3. Check API token has write permissions
4. Look at execution logs for specific error

---

## 📞 Member Phone Number Format

**CRITICAL:** Phone numbers MUST include country code

✅ Correct formats:
- `+12125551234`
- `+442071234567`
- `+919876543210`

❌ Wrong formats:
- `2125551234` (missing +1)
- `+1-212-555-1234` (dashes may cause issues)
- `(212) 555-1234` (no country code)

---

## 🎨 Customizing Response Messages

### Location in Workflow
Main Workflow → "Process Visit Booking" node → Scroll to message formatting section

### Current Format
```
✅ *Booking Confirmed!*

👤 Member: John Smith
👥 Guests: 3
   • Free guests: 1
   • Additional guests: 2 × $50 = $100

🍾 Alcohol: Bringing own
   • Corkage fee: $30

💰 *Total Charges: $130*

📊 Free guests remaining this month: 0

See you soon! 🥂
```

### Customization Tips
- Change emojis to match your brand
- Adjust formatting (bold, italics)
- Add/remove sections
- Change tone (formal vs casual)

---

## 🧪 Testing Checklist

Before going live, test these scenarios:

- [ ] New member (not in database)
- [ ] Active member with 0 guests used
- [ ] Active member with 2 guests used
- [ ] Active member with 3 guests used (at limit)
- [ ] Booking with 1 guest, purchasing alcohol
- [ ] Booking with 3 guests, bringing own alcohol
- [ ] Booking with 5 guests (over limit)
- [ ] FAQ about hours
- [ ] FAQ about policies
- [ ] FAQ about address
- [ ] Incomplete message (missing guest count)
- [ ] Incomplete message (missing alcohol choice)
- [ ] Random question outside scope
- [ ] Multiple messages in quick succession

---

## 💡 Tips & Best Practices

1. **Test with your own number first** before adding real members
2. **Start with a small group** of tech-savvy members for beta testing
3. **Monitor the first week closely** for unexpected issues
4. **Keep Airtable data backed up** (export CSV weekly)
5. **Document any custom changes** you make to the workflow
6. **Set up API spending alerts** on OpenAI and Twilio
7. **Review conversations regularly** to improve AI prompts
8. **Update lounge info in Airtable** when hours/policies change

---

## 🔗 Quick Links

- **n8n Dashboard:** [Your n8n URL]
- **Airtable Base:** [Your Airtable URL]
- **Twilio Console:** https://console.twilio.com
- **OpenAI Usage:** https://platform.openai.com/usage

---

## 📈 Next Features to Add

Consider implementing these enhancements:

**Phase 2:**
- Payment collection via Stripe
- Admin notification system
- Booking cancellation handling

**Phase 3:**
- Automated reminders
- Visit history lookup
- Member dashboard

**Phase 4:**
- Multi-language support
- Voice message handling
- Advanced analytics

---

## 🆘 Getting Help

If you encounter issues:

1. **Check this guide first**
2. Review the Setup Guide troubleshooting section
3. Check n8n execution logs for specific errors
4. Verify Airtable data is correct
5. Test each workflow node individually
6. Search n8n community forum
7. Consider hiring an n8n expert for complex issues

---

## 📝 Change Log Template

Keep track of your modifications:

```
Date: 2025-01-28
Change: Increased guest limit from 3 to 5
Modified: Process Visit Booking function
Reason: Member feedback
```

---

## ✅ Daily Operations Checklist

**Morning:**
- [ ] Check for any failed executions overnight
- [ ] Review new bookings in Visits table
- [ ] Verify guest counts are accurate

**Evening:**
- [ ] Check day's conversation quality
- [ ] Note any AI response improvements needed
- [ ] Verify all bookings were processed

**End of Month:**
- [ ] Verify monthly reset ran successfully
- [ ] Export Airtable data for records
- [ ] Review total API costs
- [ ] Analyze booking patterns

---

**Remember:** The system is designed to be easily modifiable. Don't be afraid to adjust prompts, pricing, or logic to fit your specific needs!
