# Quick Fix: OpenAI Node Error

## The Problem
Error: "This is a chat model and not supported in the v1/completions endpoint"

## Quick Fix (2 minutes)

### In n8n:

1. **Click on "OpenAI: Generate Natural Response" node**

2. **At the top, change "Resource" dropdown:**
   - From: `Text` 
   - To: `Chat`

3. **Fix the System Message** (it got corrupted):
   - Find the System message field
   - Replace with:
   ```
   You are a friendly WhatsApp assistant for a members-only lounge. You are helpful, professional, and conversational. Keep responses concise (2-3 sentences max). Use emojis sparingly. Always address the member by name when possible.
   ```

4. **Save the node**

5. **Test again** with: "I will be purchasing at the bar"

That's it! The error should be fixed.

## Why This Happened
- GPT-4 requires the Chat API endpoint (`/v1/chat/completions`)
- The node was using the old Text API endpoint (`/v1/completions`)
- Changing Resource to "Chat" fixes this
