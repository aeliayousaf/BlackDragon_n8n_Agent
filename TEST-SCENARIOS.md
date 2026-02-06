# Testing Scenarios for WhatsApp Lounge Agent

## 📋 Pre-Testing Setup

### Test Members in Airtable

Create these test members in your Airtable:

**Test Member 1: "Fresh Start"**
- Name: Alex Thompson
- Phone: Your testing number
- Status: Active
- Monthly Guest Count: 0
- Use this to test: Fresh bookings, full free guest allowance

**Test Member 2: "Almost At Limit"**
- Name: Jamie Lee
- Phone: Alternative test number
- Status: Active
- Monthly Guest Count: 2
- Use this to test: Approaching limit scenarios

**Test Member 3: "At Limit"**
- Name: Morgan Chen
- Phone: Third test number
- Status: Active
- Monthly Guest Count: 3
- Use this to test: Over-limit scenarios

---

## ✅ Test Scenarios

### SCENARIO 1: Simple Booking (Happy Path)
**Member:** Alex Thompson (0 guests used)

**Test Message:**
```
Coming tonight with 2 friends, we'll buy drinks there
```

**Expected Response:**
- Recognizes member by name
- Shows 2 free guests
- Shows "Purchasing from us"
- Total: $0
- Shows 1 free guest remaining

**Database Changes:**
- Visits table: New record created
- Members table: MonthlyGuestCount = 2

**✓ Pass Criteria:**
- Correct fee calculation
- Proper database update
- Response within 5 seconds

---

### SCENARIO 2: Booking with Corkage
**Member:** Alex Thompson (2 guests used from Scenario 1)

**Test Message:**
```
Coming tomorrow with 1 guest, bringing our own bottles
```

**Expected Response:**
- Shows 1 free guest
- Shows "Bringing own"
- Corkage fee: $30
- Total: $30
- Shows 0 free guests remaining

**Database Changes:**
- New visit record
- MonthlyGuestCount = 3

**✓ Pass Criteria:**
- Corkage fee calculated
- Guest count incremented
- Warning about using all free guests

---

### SCENARIO 3: Over Guest Limit
**Member:** Morgan Chen (3 guests used)

**Test Message:**
```
Bringing 5 people tonight and our alcohol
```

**Expected Response:**
- Shows 0 free guests
- Shows 5 paid guests × $50 = $250
- Corkage fee: $30
- Total: $280
- Warning about exceeding limit

**Database Changes:**
- New visit record with fees
- MonthlyGuestCount = 8

**✓ Pass Criteria:**
- Correct calculation of paid guests
- Both fees applied correctly
- Clear fee breakdown shown

---

### SCENARIO 4: Incomplete Information (No Guest Count)
**Member:** Alex Thompson

**Test Message:**
```
Coming tonight
```

**Expected Response:**
- Greets by name
- Asks for number of guests
- Shows free guests remaining
- Asks about alcohol preference

**Database Changes:**
- None yet (waiting for complete info)

**✓ Pass Criteria:**
- Recognizes incomplete information
- Asks specific questions
- Doesn't make assumptions

---

### SCENARIO 5: Incomplete Information (No Alcohol Choice)
**Member:** Jamie Lee

**Test Message:**
```
Bringing 3 guests later
```

**Expected Response:**
- Acknowledges 3 guests
- Asks about alcohol choice
- Explains options and fees

**Database Changes:**
- None yet

**✓ Pass Criteria:**
- Extracts guest count correctly
- Asks only for missing info
- Explains both options

---

### SCENARIO 6: Multi-Turn Conversation
**Member:** Alex Thompson

**Message 1:**
```
Coming tonight
```

**Bot Response:**
Asks for guest count and alcohol preference

**Message 2:**
```
3 guests
```

**Bot Response:**
Asks about alcohol preference

**Message 3:**
```
Buying from you
```

**Expected Final Response:**
- Complete booking confirmation
- Correct fees
- Database updated

**✓ Pass Criteria:**
- Maintains conversation context
- Remembers previous answers
- Completes booking correctly

---

### SCENARIO 7: FAQ - Hours
**Member:** Any member

**Test Message:**
```
What time do you close on Saturday?
```

**Expected Response:**
- Direct answer from LoungeInfo table
- "We close at 2 AM on Saturdays"
- Brief and helpful

**Database Changes:**
- None (FAQ only)

**✓ Pass Criteria:**
- Retrieves correct info from database
- Natural response
- No unnecessary information

---

### SCENARIO 8: FAQ - Guest Policy
**Member:** Any member

**Test Message:**
```
How many guests can I bring?
```

**Expected Response:**
- Explains 3 free guests per month
- Mentions $50 fee for additional
- Clear and concise

**✓ Pass Criteria:**
- Accurate policy information
- Easy to understand
- Mentions current usage if applicable

---

### SCENARIO 9: FAQ - Corkage
**Member:** Any member

**Test Message:**
```
What if I bring my own alcohol?
```

**Expected Response:**
- Explains $30 corkage fee
- Mentions alternative (purchasing)
- Friendly tone

**✓ Pass Criteria:**
- Correct fee amount
- Presents both options
- Professional but warm

---

### SCENARIO 10: Non-Member
**Setup:** Use a phone number NOT in Airtable

**Test Message:**
```
Hi, can I come tonight?
```

**Expected Response:**
- Polite message that they're not registered
- Provides phone number to call
- No harsh rejection

**Database Changes:**
- None

**✓ Pass Criteria:**
- Doesn't expose member data
- Helpful response
- Clear next steps

---

### SCENARIO 11: Inactive Member
**Setup:** Set a test member's status to "Suspended"

**Test Message:**
```
Coming tonight with guests
```

**Expected Response:**
- Recognizes member
- Explains status is not Active
- Directs to contact for reactivation

**✓ Pass Criteria:**
- Identifies member but blocks booking
- Explains status clearly
- Provides solution path

---

### SCENARIO 12: Edge Case - Large Group
**Member:** Any active member

**Test Message:**
```
Can I bring 15 people for a party?
```

**Expected Response:**
- Acknowledges large group
- Calculates fees (if under 20 guests)
- OR suggests calling for groups over 10-20

**✓ Pass Criteria:**
- Handles large numbers gracefully
- Reasonable response for business
- Suggests personal contact if appropriate

---

### SCENARIO 13: Edge Case - Zero Guests
**Member:** Any active member

**Test Message:**
```
Coming alone tonight, no guests
```

**Expected Response:**
- Confirms booking for member only
- No guest fees
- Asks about alcohol or confirms purchase

**✓ Pass Criteria:**
- Handles zero guests correctly
- No fees charged
- Still asks about alcohol

---

### SCENARIO 14: Ambiguous Message
**Member:** Any active member

**Test Message:**
```
Maybe coming later idk
```

**Expected Response:**
- Acknowledges uncertainty
- Offers to help when they decide
- Friendly and patient

**✓ Pass Criteria:**
- Doesn't force booking
- Remains helpful
- No database changes

---

### SCENARIO 15: Mixed Information
**Member:** Jamie Lee (2 guests used)

**Test Message:**
```
Tonight with friends bringing bottles buying 2 guests
```

**Expected Response:**
- Clarifies ambiguous information
- Asks for confirmation
- Doesn't guess

**✓ Pass Criteria:**
- Identifies conflicting info
- Requests clarification
- Doesn't make dangerous assumptions

---

## 🔄 Testing Workflow

### Phase 1: Basic Functionality (30 min)
1. Test Scenarios 1-3 (happy paths)
2. Verify database updates after each
3. Check fee calculations manually

### Phase 2: Edge Cases (30 min)
4. Test Scenarios 4-6 (incomplete info)
5. Test Scenarios 10-11 (invalid members)
6. Test Scenarios 12-15 (edge cases)

### Phase 3: FAQ System (20 min)
7. Test Scenarios 7-9 (FAQs)
8. Try 5 additional FAQ questions
9. Verify responses match Airtable data

### Phase 4: Stress Testing (20 min)
10. Send 3 messages rapidly
11. Test from multiple numbers simultaneously
12. Try very long messages
13. Test special characters and emojis

---

## 📊 Test Results Template

| Scenario | Pass/Fail | Notes | Time (sec) |
|----------|-----------|-------|------------|
| 1 - Simple Booking | | | |
| 2 - With Corkage | | | |
| 3 - Over Limit | | | |
| 4 - Incomplete (Guests) | | | |
| 5 - Incomplete (Alcohol) | | | |
| 6 - Multi-Turn | | | |
| 7 - FAQ Hours | | | |
| 8 - FAQ Policy | | | |
| 9 - FAQ Corkage | | | |
| 10 - Non-Member | | | |
| 11 - Inactive | | | |
| 12 - Large Group | | | |
| 13 - Zero Guests | | | |
| 14 - Ambiguous | | | |
| 15 - Mixed Info | | | |

---

## 🐛 Common Issues to Watch For

### Issue: Phone Number Mismatch
**Symptom:** Member not found
**Check:** Phone format in Airtable vs incoming
**Fix:** Ensure consistent format with country code

### Issue: Incorrect Fee Calculation
**Symptom:** Wrong dollar amounts
**Check:** Member's current guest count
**Fix:** Verify MonthlyGuestCount in database

### Issue: Slow Response
**Symptom:** Takes >10 seconds
**Check:** OpenAI API response time
**Fix:** Consider switching to GPT-3.5 or Claude Haiku

### Issue: AI Misunderstanding
**Symptom:** Wrong intent classification
**Check:** AI prompt and examples
**Fix:** Add more examples to prompt, adjust temperature

### Issue: Database Not Updating
**Symptom:** Visits not recorded
**Check:** Execution logs in n8n
**Fix:** Verify Airtable credentials and field names

---

## ✅ Sign-Off Checklist

Before going live:

- [ ] All 15 scenarios tested and passed
- [ ] Database updates verified for each
- [ ] Fee calculations spot-checked manually
- [ ] Response times under 5 seconds average
- [ ] No errors in n8n execution logs
- [ ] Airtable data structure validated
- [ ] FAQ responses accurate and helpful
- [ ] Edge cases handled gracefully
- [ ] Non-member case tested
- [ ] Multiple concurrent messages handled
- [ ] Monthly reset workflow tested (or scheduled)
- [ ] Backup of Airtable data created
- [ ] API spending limits set
- [ ] Documentation reviewed
- [ ] Team trained on system

---

## 🎯 Success Metrics

After first week of live operation:

- **Response Rate:** >95% of messages get response
- **Accuracy:** >90% of bookings correct first time
- **Speed:** Average response time <5 seconds
- **Errors:** <5% execution failures
- **User Satisfaction:** Positive feedback from members

---

## 🔄 Ongoing Testing

### Weekly
- Test 3 random scenarios
- Verify guest count accuracy
- Check for any errors

### Monthly
- Full regression testing (all 15 scenarios)
- Review AI prompt performance
- Update test cases based on new edge cases found

---

## 📝 Issue Tracking Template

When you find a bug:

```
Date: 2025-01-28
Scenario: #3 - Over Guest Limit
Issue: Corkage fee not being applied
Expected: $280 total
Actual: $250 total
Cause: Corkage calculation skipped when over limit
Fix: Updated conditional logic in Process Visit Booking node
Status: Resolved
Retested: ✓ Pass
```

---

**Remember:** Test thoroughly before launching to all members. It's much easier to fix issues during testing than after members are actively using the system!
