# Hydragear Bottle Website

**Live Website:** https://hydragearbottle.com  
**GitHub Repository:** https://github.com/core-home-web/hydragearbottle_website  
**Hosting:** Cloudflare Pages  
**Analytics:** Google Analytics (G-JLRWKEKHRW)

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Making Changes](#making-changes)
- [Form System](#form-system)
- [Analytics & Tracking](#analytics--tracking)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

Hydragear is an eco-conscious water bottle brand website built with Webflow and deployed on Cloudflare Pages. The site features:

- **16 HTML pages** including home, shop, contact, blogs, and admin pages
- **Google Analytics tracking** on all pages
- **Smart form system** with email notifications and Airtable database integration
- **Cloudflare Workers** for serverless form handling
- **Firebase hosting configuration** (legacy - not currently used)

---

## 🛠 Tech Stack

| Technology | Purpose | Details |
|------------|---------|---------|
| **HTML/CSS/JS** | Frontend | Static website exported from Webflow |
| **Cloudflare Pages** | Hosting | Auto-deploys from GitHub `main` branch |
| **Cloudflare Workers** | Backend | Serverless form handling |
| **FormSubmit.co** | Email Service | Sends form submissions to email |
| **Airtable** | Database | Stores contact form submissions |
| **Google Analytics** | Tracking | Visitor analytics (G-JLRWKEKHRW) |
| **Firebase** | Legacy | Configuration files present but not actively used |

---

## 📁 Project Structure

```
hydragear-bottle/
├── README.md                    # This file
├── firebase.json                # Firebase config (legacy)
├── .firebaserc                  # Firebase project config
├── .gitignore                   # Git ignore rules
│
├── workers/                     # Cloudflare Worker code
│   ├── form-handler.js          # Form submission handler
│   └── README.md                # Worker documentation
│
├── public/                      # DEPLOYED TO CLOUDFLARE PAGES
│   ├── index.html               # Homepage
│   ├── shop.html                # Shop page
│   ├── contact.html             # Contact page (with forms)
│   ├── all-blogs.html           # Blog listing
│   ├── coming-soon.html         # Coming soon page
│   ├── videos.html              # Video showcase
│   ├── home-2.html              # Alternative home layouts
│   ├── home-3.html
│   ├── old-home.html
│   ├── detail_blog-article.html # Blog article template
│   ├── 401.html                 # Protected page error
│   ├── 404.html                 # Not found error
│   │
│   ├── admin/                   # Admin/utility pages
│   │   ├── changelog.html
│   │   ├── instructions.html
│   │   ├── licenses.html
│   │   └── style-guide.html
│   │
│   ├── css/                     # Stylesheets
│   │   ├── hydragear-2024.webflow.css
│   │   ├── normalize.css
│   │   └── webflow.css
│   │
│   ├── js/                      # JavaScript
│   │   └── webflow.js
│   │
│   ├── images/                  # All images (238 files)
│   │   ├── *.webp               # Optimized images
│   │   ├── *.jpg                # Photos
│   │   └── *.svg                # Icons/logos
│   │
│   ├── videos/                  # Video posters only
│   │   └── *-poster-*.jpg       # (Large video files excluded via .gitignore)
│   │
│   ├── fonts/
│   │   └── MonaSansCondensed-ExtraBold.otf
│   │
│   └── documents/
│       └── 78X7apKrEN.json
│
└── (Root-level files)           # Duplicates of public/ for Cloudflare compatibility
    ├── index.html               # Same as public/index.html
    ├── shop.html
    ├── contact.html
    └── ... (mirrors public/ directory)
```

---

## 🚀 Getting Started

### Prerequisites

- Git installed
- GitHub account access to `core-home-web` organization
- Cloudflare account access
- Airtable account access (for form database)

### Clone the Repository

```bash
git clone https://github.com/core-home-web/hydragearbottle_website.git
cd hydragearbottle_website
```

### View the Website Locally

Since this is a static website, you can open any HTML file directly in your browser:

```bash
# macOS
open index.html

# Or use a local server (recommended)
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

---

## ✏️ Making Changes

### Updating Content (HTML/CSS)

1. **Edit files in BOTH locations:**
   - Root directory (e.g., `index.html`)
   - Public directory (e.g., `public/index.html`)
   
   > **Why both?** Cloudflare Pages reads from root, while Firebase config points to `public/`. Keeping both ensures compatibility.

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of your changes"
   git push origin main
   ```

3. **Automatic deployment:**
   - Cloudflare Pages automatically deploys when you push to `main`
   - Deployment takes 1-3 minutes
   - Check status at: https://dash.cloudflare.com

### Adding New Pages

1. Create HTML file in both root and `public/` directories
2. **IMPORTANT:** Add Google Analytics tag to `<head>`, plus `<link href="css/hydragear-enhance.css" rel="stylesheet">` after the Webflow CSS and `<script src="js/hydragear-enhance.js" defer></script>` before `</body>`:
   ```html
   <head>
     <!-- Google tag (gtag.js) -->
     <script async src="https://www.googletagmanager.com/gtag/js?id=G-JLRWKEKHRW"></script>
     <script>
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', 'G-JLRWKEKHRW');
     </script>
     <!-- Rest of head content -->
   </head>
   ```
3. Update navigation links in existing pages
4. Commit and push

### Updating Images

1. Add images to `images/` directory (or `public/images/`)
2. Optimize for web (use WebP format when possible)
3. Update HTML references
4. Commit and push

### Managing Videos

**⚠️ Important:** Videos over 25MB are excluded from GitHub (`.gitignore`) due to Cloudflare Pages limits.

**Current approach:**
- Only video poster images are committed
- Large video files stored locally or on external CDN
- Consider using Cloudflare R2, Vimeo, or YouTube for video hosting

**To add videos:**
1. Keep video files local only
2. Upload to external hosting service
3. Embed using `<iframe>` or external URL
4. Commit only the poster images

---

## 📝 Form System

### Architecture

```
Website Contact Form
        ↓
Cloudflare Worker (hydragear-form-handler)
        ↓
        ├─→ FormSubmit.co → Email Notification
        └─→ Airtable → Database Storage
```

### Forms on the Website

1. **Contact Form** (`contact.html`)
   - Fields: Full Name, Email, Message
   - Sends to: corehomeweb2@gmail.com
   - Subject: "New Contact Form Submission - Hydragear"
   
2. **Newsletter Signup** (footer on all pages)
   - Field: Email only
   - Sends to: corehomeweb2@gmail.com
   - Subject: "New Newsletter Signup - Hydragear"

### Airtable Database

**Base ID:** `appLh4lmU0rn22CNi`  
**Table:** `Contacts`  
**Access:** https://airtable.com/appLh4lmU0rn22CNi/shrkWr6eVQtt5OWCy

**Table Structure:**
| Field Name | Type | Description |
|------------|------|-------------|
| Full Name | Single line text | Contact's name |
| Email Address | Email | Contact's email |
| Message | Long text | Message from contact form |
| Submission Date | Single line text | Date of submission (YYYY-MM-DD) |
| Source | Single line text | "Contact Form" or "Newsletter Signup" |

### Changing Email Recipient

**NO CODE CHANGES NEEDED!** Update via Cloudflare:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to: Workers & Pages → `hydragear-form-handler`
3. Click: Settings → Variables and Secrets
4. Edit `EMAIL_RECIPIENT` value
5. Click "Deploy"
6. Takes ~10 seconds ⚡

### Updating Form Handler Code

1. Edit `workers/form-handler.js` in this repository
2. Copy the entire file content
3. Go to Cloudflare Dashboard → Workers & Pages → `hydragear-form-handler`
4. Click "Edit code" button
5. Select all (Cmd/Ctrl + A) and paste
6. Click "Save and Deploy"

See `workers/README.md` for detailed Worker documentation.

---

## 📊 Analytics & Tracking

### Google Analytics

**Tracking ID:** `G-JLRWKEKHRW`  
**Dashboard:** https://analytics.google.com

**What's Tracked:**
- Page views on all 16 pages
- User sessions and behavior
- Traffic sources
- Geographic data
- Device types (mobile/desktop)
- Real-time visitor data

**Verification:**
```bash
# View source of any page and look for:
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-JLRWKEKHRW"></script>
```

### Enhancement layer (motion, scrolling, shopping)

Every page also loads `css/hydragear-enhance.css` and `js/hydragear-enhance.js` (in both root and `public/`). They sit on top of the Webflow export and don't change content:

- **Smooth scrolling.** Lenis inertia scrolling on desktop mouse/trackpad, native momentum on touch, header-aware smooth anchor jumps.
- **Page transitions.** Cross-document view transitions, with a fade fallback for browsers that don't support them.
- **Scroll reveals and a brand-gradient scroll progress bar.** Elements already animated by Webflow interactions are skipped.
- **Shopping polish.** Product photos open the Amazon listing, hover lift and image zoom (desktop only), press feedback on touch, image-loading shimmer, Amazon preconnect on intent.
- **`prefers-reduced-motion`** turns all of the movement off.

**GA4 events sent by the enhancement script:**

| Event | When |
|-------|------|
| `view_item_list` | Product grid scrolled into view (all items with ASIN + price) |
| `select_item` | A product's Shop Now button or photo is clicked |
| `amazon_click` | Any click to Amazon (product or storefront). Mark this as a **key event** in GA4 |
| `social_click` | Instagram / TikTok / YouTube links |
| `outbound_click` | Any other external link |
| `contact_email_click` | `mailto:` links |
| `sign_up` | Newsletter form submitted |
| `generate_lead` | Contact form submitted |

Amazon links use the clean `https://www.amazon.com/dp/<ASIN>` form (no search/session tracking params), which also opens the Amazon app on phones.

### Product pop-ups and bottle-matched colours

`index.html` and `shop.html` also load `js/hydragear-products.js` (the product catalog) and `js/hydragear-pdp.js`:

- **Product detail pop-up.** Opens when a shopper clicks a product card or its **Learn more** link. It shows a photo gallery, price, highlights, description, an "About this item" list and a **Shop on Amazon** button that goes straight to the listing. On phones it slides up as a bottom sheet (swipe down to close, swipe sideways for the next bottle). The **Shop Now** button on each card still goes straight to Amazon.
- **Deep links.** `shop.html#juno-tumbler` (any product `slug`) opens that bottle's pop-up directly. Back closes it.
- **Bottle-matched background.** The gradient behind the product grid shifts to the colours of the bottle being hovered (desktop), focused (keyboard) or scrolled to the middle of the screen (phones).
- **Analytics.** Opening a pop-up sends `view_item`. Clicking its Amazon button sends `select_item` and `amazon_click`.

**To edit product details or colours, change `js/hydragear-products.js`** (copy it to `public/js/` too). Each product is keyed by its Amazon ASIN:

| Field | What it does |
|-------|--------------|
| `amazonBullets` | The "About this item" bullets from Amazon, one string each. An empty list hides the section. |
| `description` | Short paragraph under the price |
| `highlights` | Feature chips |
| `gallery` | Photos shown in the pop-up (first one is the main image) |
| `colors` | `base`, `deep`, `accent`, `glow`: the palette used for the background and pop-up |

### Homepage hero video

Video files aren't stored in Git (Cloudflare Pages has a 25MB limit). The homepage hero first tries `videos/hydragear_header_2-1080p-transcode.mp4/.webm`. If those aren't deployed, it falls back to the "Wed Vid fo Hydragear" clip on Webflow's CDN. To use a different hosted video (for example Cloudflare R2 or Stream), add another `<source>` to the hero `<video>` in `index.html`.

**Adding Analytics to New Pages:**
Copy the Google Analytics code block from any existing page's `<head>` section and paste it into the new page (must be at the top of `<head>`).

---

## 🚀 Deployment

### Automatic Deployment (Recommended)

**Current Setup:** Auto-deploy from GitHub enabled

1. Make changes locally
2. Commit: `git commit -m "Your message"`
3. Push: `git push origin main`
4. Cloudflare Pages automatically builds and deploys
5. Live in 1-3 minutes

### Manual Deployment

**Using Firebase (Legacy):**
```bash
firebase deploy
```

**Note:** The site currently deploys via Cloudflare Pages, not Firebase.

### Deployment Status

Check deployment status:
- **Cloudflare:** https://dash.cloudflare.com → Workers & Pages → hydragearbottle-website → Deployments
- **GitHub Actions:** https://github.com/core-home-web/hydragearbottle_website/actions

### Deployment Triggers

- ✅ Push to `main` branch → Automatic deployment
- ✅ Pull request merge → Automatic deployment
- ❌ Push to other branches → No deployment (can be configured)

---

## 🔐 Environment Variables

### Cloudflare Worker Variables

Set in: Cloudflare Dashboard → Workers & Pages → hydragear-form-handler → Settings → Variables

| Variable | Purpose | Current Value |
|----------|---------|---------------|
| `EMAIL_RECIPIENT` | Form submission email | corehomeweb2@gmail.com |
| `AIRTABLE_API_KEY` | Airtable authentication | patj44WB5W5vs1Xnu.* |
| `AIRTABLE_BASE_ID` | Airtable database ID | appLh4lmU0rn22CNi |

**To Update:**
1. Go to Worker settings
2. Click edit icon next to variable
3. Change value
4. Click "Deploy"
5. No code changes needed ✨

### Security Notes

- ⚠️ **Never commit API keys** to GitHub
- ✅ API keys are stored securely in Cloudflare environment variables
- ✅ GitHub has push protection enabled for secret detection
- 🔒 Airtable API token has limited scope to specific base

---

## 🐛 Troubleshooting

### Forms Not Working

**Check 1: Worker Logs**
```
1. Cloudflare Dashboard → Workers & Pages → hydragear-form-handler
2. Click "Logs" tab
3. Submit test form
4. Look for errors in logs
```

**Check 2: Airtable Connection**
- Verify table name is exactly "Contacts" (case-sensitive)
- Verify field names match: Full Name, Email Address, Message, Submission Date
- Check API token has write permissions

**Check 3: Email Delivery**
- Check spam folder
- Verify EMAIL_RECIPIENT is correct
- Test FormSubmit directly: https://formsubmit.co/documentation

### Google Analytics Not Tracking

**Wait Time:** Can take 24-48 hours for data to appear

**Verify Installation:**
```bash
# Check if tag is in HTML
curl https://hydragearbottle.com | grep "G-JLRWKEKHRW"
```

**Real-Time Testing:**
1. Visit website
2. Go to Google Analytics → Reports → Real-time
3. Should see "1 user active now"

### Deployment Fails

**Common Issues:**

1. **File Size Limits:**
   - Cloudflare Pages: 25MB max per file
   - Solution: Use .gitignore for large videos

2. **Build Errors:**
   - Check Cloudflare Pages deployment logs
   - Look for failed deployments in dashboard

3. **Git Push Issues:**
   - Secret detected: Remove API keys from code
   - Large files: Add to .gitignore

### Images Not Loading

**Check:**
1. File path is correct (case-sensitive)
2. Image exists in `images/` directory
3. File format is web-compatible (.webp, .jpg, .png, .svg)
4. Check browser console for 404 errors

---

## 📝 Common Tasks

### Task: Update Email Address for Forms

**Time:** ~10 seconds  
**Difficulty:** ⭐ Easy

1. Cloudflare Dashboard → Workers & Pages → hydragear-form-handler
2. Settings → Variables and Secrets
3. Edit `EMAIL_RECIPIENT`
4. Enter new email address
5. Click "Deploy"

### Task: Add New Contact to Airtable Manually

**Airtable Dashboard:** https://airtable.com/appLh4lmU0rn22CNi/shrkWr6eVQtt5OWCy

1. Open Contacts table
2. Click "+" at bottom of table
3. Fill in fields
4. Press Enter to save

### Task: Export Airtable Data

1. Open Airtable base
2. Click "..." (more options) at top right
3. Select "Download CSV"
4. Choose options and download

### Task: Update Website Content

**For text/HTML changes:**
```bash
# 1. Edit the file
code index.html  # or your preferred editor

# 2. Save changes

# 3. Commit and push
git add index.html public/index.html
git commit -m "Update homepage hero text"
git push origin main

# 4. Wait 1-3 minutes for deployment
```

### Task: Add Google Analytics to New Page

Copy this code and paste at the top of `<head>`:

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-JLRWKEKHRW"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-JLRWKEKHRW');
</script>
```

---

## 🔄 Git Workflow

### Standard Workflow

```bash
# 1. Pull latest changes
git pull origin main

# 2. Make your changes
# Edit files as needed

# 3. Check what changed
git status

# 4. Stage changes
git add .

# 5. Commit with descriptive message
git commit -m "Add new blog post about sustainability"

# 6. Push to GitHub (triggers auto-deployment)
git push origin main
```

### Creating a Backup

```bash
# Create a new branch for backup
git checkout -b backup-2025-11-03
git push origin backup-2025-11-03

# Return to main
git checkout main
```

### Rolling Back Changes

```bash
# View commit history
git log --oneline

# Revert to specific commit
git revert <commit-hash>
git push origin main
```

---

## 📧 Contact Form Details

### How It Works

1. **User fills out form** on website
2. **Form submits** to Cloudflare Worker
3. **Worker processes** the submission
4. **Two actions happen simultaneously:**
   - Sends email via FormSubmit → corehomeweb2@gmail.com
   - Saves to Airtable → Contacts table
5. **User sees** success message

### Form Fields

**Contact Form:**
- Full Name (required)
- Email Address (required)
- Message (required)

**Newsletter Signup:**
- Email Address (required)

### Email Notifications

**Service:** FormSubmit.co (https://formsubmit.co/documentation)

**Email Template:** Table format (easy to read)

**Features:**
- No CAPTCHA (can be enabled if spam becomes an issue)
- Custom subject lines
- Redirects back to website after submission
- Success message display

---

## 🌐 Domains & URLs

### Production URLs

- **Primary Domain:** https://hydragearbottle.com
- **Cloudflare Pages URL:** https://hydragearbottle-website.pages.dev
- **Worker URL:** https://hydragear-form-handler.cold-hat-c35d.workers.dev

### Development URLs

- **Local Testing:** Open HTML files directly or use local server
- **Preview Deployments:** Available for branches in Cloudflare Pages

---

## 📦 Dependencies

### External Services

| Service | Purpose | Cost | Account |
|---------|---------|------|---------|
| Cloudflare Pages | Hosting | Free | it@corehome.com |
| Cloudflare Workers | Form handling | Free (100k req/day) | it@corehome.com |
| FormSubmit.co | Email delivery | Free | No account needed |
| Airtable | Database | Free tier | Team account |
| Google Analytics | Website tracking | Free | Team account |

### JavaScript Libraries

**Loaded from CDN:**
- jQuery 3.5.1 (from Cloudflare CDN)
- Google WebFont Loader
- Webflow.js

**No npm dependencies** - all libraries loaded via CDN.

---

## 🎨 Design & Branding

### Colors

Primary colors used in the website (from Webflow):
- Brand colors defined in `css/hydragear-2024.webflow.css`
- Yellow accent sections
- Black/white navigation

### Fonts

**Primary Font:** SUSE, Nunito Sans, Montserrat, Raleway  
**Font Loading:** Google Fonts via WebFont Loader

### Images

**Format:** Mostly .webp (optimized for web)  
**Responsive:** Multiple sizes generated (-p-500, -p-800, -p-1080, etc.)

---

## 📞 Support & Contacts

### Team Contacts

- **Website Email:** team@hydragearbottle.com
- **Form Notifications:** corehomeweb2@gmail.com
- **Cloudflare Account:** it@corehome.com

### Useful Links

- **Website:** https://hydragearbottle.com
- **GitHub Repo:** https://github.com/core-home-web/hydragearbottle_website
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Airtable Base:** https://airtable.com/appLh4lmU0rn22CNi
- **Google Analytics:** https://analytics.google.com (Property: G-JLRWKEKHRW)

### Social Media

- **Instagram:** https://www.instagram.com/hydragearbottle/
- **TikTok:** https://www.tiktok.com/@hydragear.bottle
- **YouTube:** https://www.youtube.com/@Hydragear

---

## 📚 Additional Documentation

- **Workers Documentation:** See `workers/README.md`
- **FormSubmit Docs:** https://formsubmit.co/documentation
- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages
- **Airtable API Docs:** https://airtable.com/developers/web/api/introduction

---

## 🎉 Recent Updates

**November 3, 2025:**
- ✅ Integrated Google Analytics (G-JLRWKEKHRW) on all pages
- ✅ Set up FormSubmit email notifications
- ✅ Created Cloudflare Worker for form handling
- ✅ Connected Airtable database for form storage
- ✅ Removed large video files for Cloudflare compatibility
- ✅ Updated contact form with brand-appropriate copy
- ✅ Removed phone field from contact form
- ✅ Configured flexible email routing via environment variables

---

## ⚠️ Important Notes

1. **Dual File Structure:** Always update files in BOTH root and `public/` directories
2. **Video Files:** Keep large videos (>25MB) local or use external hosting
3. **API Keys:** Never commit API keys - use Cloudflare environment variables
4. **Analytics:** Data may take 24-48 hours to fully populate in Google Analytics
5. **Form Testing:** Test forms after any changes to ensure email/Airtable still work
6. **Worker Code:** Keep `workers/form-handler.js` in sync with deployed Worker

---

## 📖 Version History

See commit history: https://github.com/core-home-web/hydragearbottle_website/commits/main

---

**Last Updated:** November 3, 2025  
**Maintained By:** Core Home Web Team  
**Questions?** Contact corehomeweb2@gmail.com

