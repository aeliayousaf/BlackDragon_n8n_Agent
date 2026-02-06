# How to Update OpenAI Node Version in n8n

## Quick Steps

1. **Close the current node** (click X or click away)

2. **Go to Nodes Panel:**
   - Look for a "+" button or "Add Node" button
   - Or press `Space` key to open node search

3. **Search for OpenAI:**
   - Type "OpenAI" in the search
   - You should see the OpenAI node

4. **Check for Update:**
   - Look for a version number or update indicator
   - The yellow banner mentioned "New node version available"
   - There might be an "Update" button or version selector

5. **Update the Node:**
   - If there's an update option, click it
   - Or delete the old node and add a fresh OpenAI node
   - The new version should have "Create Message" operation

6. **Reconfigure:**
   - Set Resource: Chat
   - Set Operation: Create Message (should now be available)
   - Configure Messages array
   - Set Model: gpt-4-turbo-preview or chatgpt-4o-latest

## Alternative: Check n8n Version

Your n8n might need updating:
- Go to Settings → About
- Check your n8n version
- If it's older than 1.0+, consider updating n8n itself

## If Update Doesn't Work

Use the Custom API call method (see FIX-Custom-API-Call.md) or replace with HTTP Request node.
