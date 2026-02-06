# CRITICAL FIX: "Cannot read properties of undefined (reading 'every')" Error

## The Problem
This error happens **BEFORE** your function code runs - it's in n8n's internal `normalizeItems` function. This means a Function node is being executed but receiving `undefined` input instead of an array.

## Why Code Fixes Don't Work
The error occurs at line 170 in `Function.node.ts` when n8n tries to normalize input items. This happens **BEFORE** your function code executes, so try-catch blocks and input validation in your code won't help.

## Root Cause
A Function node is being executed without proper input data. This can happen when:
1. A previous node doesn't output data
2. An IF node's branch doesn't pass through data properly
3. A node is executed manually/tested without input

## The Real Fix

Since the error happens before function code runs, you need to ensure nodes always output data. Here's what to check:

### 1. Check "Needs Database Update?" Node

This IF node routes to "Clean Airtable Data". Ensure it passes data through:

**In n8n:**
1. Open "Needs Database Update?" node
2. Check "Options" → ensure "Pass Through" or "Pass Input" is enabled
3. Both TRUE and FALSE branches should pass through the input data

### 2. Check "Is Cancel Visit?" Node

This IF node routes to multiple nodes. Ensure it passes data:

**In n8n:**
1. Open "Is Cancel Visit?" node  
2. Check "Options" → ensure data passes through on both branches
3. Both TRUE and FALSE branches should have the input data

### 3. Check Airtable Nodes

Airtable nodes might not return data by default:

**For "Airtable: Update Member":**
1. Open the node
2. Go to "Options"
3. Enable "Return All" or "Return Updated Records"
4. This ensures it outputs data to "Preserve Response Message"

### 4. Manual Workaround: Add Set Node

If a specific Function node keeps failing, add a "Set" node before it:

1. Add a "Set" node before the failing Function node
2. Set one field: `data` = `{{ $json || {} }}`
3. This ensures the Function node always receives an object

## Most Likely Culprits

Based on the workflow structure, these nodes are most likely to fail:

1. **"Clean Airtable Data"** - Receives input from "Needs Database Update?"
   - **Fix:** Ensure "Needs Database Update?" passes data through TRUE branch

2. **"Preserve Response Message"** - Receives input from "Airtable: Update Member"
   - **Fix:** Enable "Return All" in "Airtable: Update Member" options

3. **"Format AI Response"** - Receives input from "OpenAI: Generate Natural Response"
   - **Fix:** Ensure OpenAI node outputs data properly

## Step-by-Step Debugging

1. **Run the workflow and note which Function node fails**
   - Check the execution log
   - Find the last successful node
   - The next Function node is the one failing

2. **Check the node BEFORE the failing Function node:**
   - Click on it in the execution
   - Check "OUTPUT" tab
   - If it shows "No data" or is empty, that's the problem

3. **Fix the upstream node:**
   - If it's an IF node, ensure it passes data through
   - If it's an Airtable node, enable "Return All"
   - If it's another Function node, ensure it always returns something

## Quick Test

To test if this is the issue:

1. Add a "Set" node before "Clean Airtable Data"
2. Set: `test` = `{{ $json || {} }}`
3. Connect "Set" → "Clean Airtable Data"
4. If this fixes it, the issue is "Needs Database Update?" not outputting data

## Permanent Fix

Once you identify which node isn't outputting data:

1. **For IF nodes:** Enable "Pass Through" in options
2. **For Airtable nodes:** Enable "Return All" in options  
3. **For Function nodes:** Ensure they always return an object (never undefined/null)

## If Nothing Works

If the error persists after trying all of the above:

1. **Export the workflow** (to get a fresh copy)
2. **Delete the failing Function node**
3. **Recreate it** with the same code
4. **Reconnect it** properly

Sometimes n8n nodes get into a bad state and need to be recreated.
