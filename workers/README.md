# Cloudflare Workers

This directory contains the Cloudflare Worker code for the Hydragear website.

## Form Handler Worker

**File:** `form-handler.js`  
**Deployed URL:** https://hydragear-form-handler.cold-hat-c35d.workers.dev/  
**Purpose:** Handles contact form and newsletter signup submissions

### What It Does:
1. Receives form submissions from the website
2. Sends email notifications via FormSubmit
3. Stores submission data in Airtable database
4. Returns success response to the user

### Environment Variables (Set in Cloudflare Dashboard):

| Variable | Purpose | Example |
|----------|---------|---------|
| `EMAIL_RECIPIENT` | Email address to receive notifications | corehomeweb2@gmail.com |
| `AIRTABLE_API_KEY` | Airtable Personal Access Token | patj44WB5W5vs1Xnu... |
| `AIRTABLE_BASE_ID` | Airtable Base ID | appLh4lmU0rn22CNi |

### How to Update the Worker:

1. Edit `form-handler.js` in this repository
2. Copy the entire code
3. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages
4. Click on `hydragear-form-handler`
5. Click "Edit code" button (top right)
6. Paste the updated code
7. Click "Save and Deploy"

### How to Change Email Recipient:

**NO CODE CHANGES NEEDED!** Just update the environment variable:

1. Go to Cloudflare Dashboard → Workers & Pages → hydragear-form-handler
2. Click "Settings" → "Variables and Secrets"
3. Edit `EMAIL_RECIPIENT` value
4. Click "Deploy"
5. Done! (Takes ~10 seconds)

### Airtable Configuration:

**Table Name:** `Contacts`

**Required Fields:**
- `Full Name` (Single line text)
- `Email Address` (Email)
- `Message` (Long text)
- `Submission Date` (Single line text or Date)
- `Source` (Single line text) - Optional, shows "Contact Form" or "Newsletter Signup"

### Forms Using This Worker:

- Contact page main form (`contact.html`)
- Newsletter signup form (footer on all pages)

### Troubleshooting:

**Check Worker Logs:**
1. Go to Worker dashboard
2. Click "Logs" or "Observability" → "Logs"
3. Submit a test form
4. Look for error messages

**Common Issues:**
- Airtable field names must match exactly (case-sensitive)
- Date field format: Use `YYYY-MM-DD` format
- API key must have write permissions for the base

