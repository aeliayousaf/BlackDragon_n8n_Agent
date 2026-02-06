# Airtable Database Schema for WhatsApp Lounge Agent

## Base Setup

Create a new Airtable Base called "Lounge Management"

---

## Table 1: Members

**Purpose:** Store member information, membership details, and track monthly guest counts

| Field Name | Field Type | Description | Example |
|------------|-----------|-------------|---------|
| MemberID | Autonumber | Unique identifier | 1, 2, 3... |
| FullName | Single line text | Member's full name | "John Smith" |
| PhoneNumber | Phone | WhatsApp number (with country code) | +12125551234 |
| Email | Email | Member's email | john@example.com |
| MembershipType | Single select | Monthly, 3-Month | "Monthly" |
| MembershipStatus | Single select | Active, Suspended, Expired, Cancelled | Active |
| MembershipStartDate | Date | When current membership began | 2025-01-15 |
| MembershipEndDate | Date | When membership expires | 2025-04-15 |
| MembershipPrice | Currency | Amount paid | $1,412.50 |
| AutoRenew | Checkbox | If member wants auto-renewal | ✓ |
| MonthlyGuestCount | Number | Current month guest count | 2 |
| LastResetDate | Date | Last month reset date | 2025-01-01 |
| TotalLifetimeGuests | Number | All-time guest count | 45 |
| JoinDate | Date | Original membership start date | 2024-06-15 |
| RenewalReminderSent | Single select | None, 7-Day, 3-Day, 1-Day, Expired | "None" |
| LastReminderDate | Date | When last reminder was sent | 2025-01-20 |
| CancellationDate | Date | If/when they cancelled | null |
| CancellationReason | Long text | Why they left | null |
| Notes | Long text | Additional notes | "VIP member" |

**Key Field:** PhoneNumber (used for lookup)

---

## Table 2: Visits

**Purpose:** Log each visit with guest details and fees

| Field Name | Field Type | Description | Example |
|------------|-----------|-------------|---------|
| VisitID | Autonumber | Unique visit identifier | 1001, 1002... |
| Member | Link to Members | Linked member record | [Link to John Smith] |
| VisitDate | Date | Date of visit | 2025-01-28 |
| VisitTime | Single line text | Time of visit | "7:00 PM" |
| NumberOfGuests | Number | Guest count | 4 |
| FreeGuests | Number | Free guests used | 3 |
| PaidGuests | Number | Guests charged | 1 |
| GuestFee | Currency | Guest charges ($50/guest) | $50.00 |
| AlcoholSource | Single select | Own, Purchase | "Own" |
| CorkageFee | Currency | Corkage fee if applicable | $30.00 |
| TotalFees | Formula | Sum of all fees | $80.00 |
| Status | Single select | Confirmed, Cancelled, Completed | Confirmed |
| ConfirmationSent | Checkbox | Confirmation message sent | ✓ |
| CreatedAt | Created time | Auto timestamp | 2025-01-28 3:45 PM |
| Notes | Long text | Additional details | "Birthday celebration" |

**Formula for TotalFees:**
```
{GuestFee} + {CorkageFee}
```

---

## Table 3: LoungeInfo

**Purpose:** Store lounge information for FAQ responses

| Field Name | Field Type | Description | Example |
|------------|-----------|-------------|---------|
| InfoID | Autonumber | Unique identifier | 1, 2, 3... |
| Category | Single select | Hours, Policies, Amenities, Contact, Membership | "Hours" |
| Question | Single line text | Common question | "What are your hours?" |
| Answer | Long text | Detailed answer | "Monday-Thursday: 5 PM - 12 AM..." |
| IsActive | Checkbox | Show in responses | ✓ |
| LastUpdated | Last modified time | Auto timestamp | 2025-01-28 |

**Sample Records:**

| Category | Question | Answer |
|----------|----------|--------|
| Hours | What are your hours? | Monday-Thursday: 5 PM - 12 AM, Friday-Saturday: 4 PM - 2 AM, Sunday: 4 PM - 11 PM |
| Policies | What's the guest policy? | Each member can bring up to 3 guests per month at no charge. Additional guests are $50 per person. |
| Policies | What about bringing my own alcohol? | You're welcome to bring your own bottles! There's a $30 corkage fee per visit when you bring your own alcohol. |
| Membership | What are the membership options? | We offer two options: Monthly at $350 + 13% tax ($395.50/month) or 3-Month at $1,250 + 13% tax ($1,412.50 total). |
| Membership | How do I renew my membership? | Reply RENEW when you receive your renewal reminder, or message us anytime to renew! |
| Amenities | What amenities do you offer? | Private lounge seating, premium bar service, complimentary appetizers, WiFi, music system, and outdoor patio. |
| Contact | What's your address? | 123 Main Street, Suite 500, Your City, ST 12345 |
| Contact | How do I contact you? | Call us at (555) 123-4567 or WhatsApp this number! |

---

## Table 4: MembershipTransactions

**Purpose:** Track all membership payments and renewals

| Field Name | Field Type | Description | Example |
|------------|-----------|-------------|---------|
| TransactionID | Autonumber | Unique identifier | 1, 2, 3... |
| Member | Link to Members | Linked member record | [Link to John Smith] |
| TransactionDate | Date | Date of transaction | 2025-01-28 |
| TransactionType | Single select | New, Renewal, Cancellation, Refund | "Renewal" |
| MembershipType | Single select | Monthly, 3-Month | "3-Month" |
| BasePrice | Currency | Price before tax | $1,250.00 |
| TaxAmount | Currency | 13% tax | $162.50 |
| TotalAmount | Currency | Total charged | $1,412.50 |
| PaymentMethod | Single select | Cash, Card, Transfer | "Card" |
| PaymentStatus | Single select | Pending, Completed, Failed, Refunded | "Completed" |
| Notes | Long text | Additional details | "Upgraded from monthly" |
| CreatedAt | Created time | Auto timestamp | 2025-01-28 |

---

## Table 5: ConversationLog (Optional)

**Purpose:** Archive all WhatsApp conversations for reference

| Field Name | Field Type | Description |
|------------|-----------|-------------|
| LogID | Autonumber | Unique log entry |
| Member | Link to Members | Associated member |
| MessageDate | Date | Date of message |
| MessageTime | Single line text | Time of message |
| MessageFrom | Single select | Member, Agent |
| MessageText | Long text | Message content |
| Intent | Single select | Visit, FAQ, Renewal, Cancellation, Other |
| CreatedAt | Created time | Auto timestamp |

---

## Membership Pricing Reference

| Type | Base Price | Tax (13%) | Total |
|------|-----------|-----------|-------|
| Monthly | $350.00 | $45.50 | $395.50 |
| 3-Month | $1,250.00 | $162.50 | $1,412.50 |

**Savings with 3-Month:** $1,186.50 - $1,412.50 = $226.00 savings (vs 3x monthly)

---

## Setup Instructions

### Step 1: Create the Airtable Base
1. Go to https://airtable.com
2. Create new base: "Lounge Management"
3. Create all 5 tables above with exact field names and types

### Step 2: Add Sample Data
Add a few test members:
- Include your own phone number for testing
- Set different MembershipTypes (Monthly, 3-Month)
- Set MembershipEndDate to various dates to test reminders
- Set MonthlyGuestCount to different values (0, 2, 3)

### Step 3: Get API Credentials
1. Go to https://airtable.com/create/tokens
2. Create new token with these scopes:
   - data.records:read
   - data.records:write
   - schema.bases:read
3. Add access to your "Lounge Management" base
4. Copy the token (starts with "pat...")
5. Get your Base ID:
   - Go to https://airtable.com/api
   - Click your base
   - Base ID is in the URL: `app...`

### Step 4: Test API Access
Use this curl command to test:
```bash
curl "https://api.airtable.com/v0/YOUR_BASE_ID/Members" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Renewal Reminder Schedule

The system sends automatic WhatsApp reminders:

| Days Before Expiry | Reminder Type | Message Content |
|-------------------|---------------|-----------------|
| 7 days | First Reminder | "Your membership expires on [date]. Reply RENEW to continue." |
| 3 days | Second Reminder | "Reminder: Your membership expires in 3 days. Reply RENEW to stay active." |
| 1 day | Final Reminder | "Last chance! Your membership expires tomorrow. Reply RENEW now." |
| 0 days (expired) | Expiry Notice | "Your membership has expired. Reply RENEW anytime to rejoin!" |

---

## Cancellation Flow

When member replies **CANCEL**:
1. Set MembershipStatus → `Cancelled`
2. Set CancellationDate → Today
3. Ask for reason (optional)
4. Send confirmation message
5. Keep record for potential future rejoining

---

## Monthly Reset Logic

The system resets MonthlyGuestCount to 0 on the 1st of each month.

**Option 1: n8n Scheduled Workflow**
- Run daily at midnight
- Check if LastResetDate is in previous month
- If yes, set MonthlyGuestCount = 0 and LastResetDate = today

**Option 2: Reset on First Visit**
- When processing a visit, check LastResetDate
- If in previous month, reset counter before calculating

---

## Notes

- **Phone Number Format:** Store with country code (e.g., +12125551234)
- **Currency:** All fees in USD (adjust as needed)
- **Tax Rate:** 13% (adjust in workflow if different)
- **Date Format:** Use ISO format (YYYY-MM-DD) for consistency
- **Backup:** Airtable auto-saves, but export CSV weekly as backup
