# Dostt Coins League - Deployment Guide

## ✅ What's Been Completed

### 1. **Premium Website Design**
- ✅ Custom Dostt Coins League logo with crown and coin design
- ✅ Gradient typography (orange-to-red) for the main title
- ✅ Glassmorphism cards with hover effects and gradient borders
- ✅ Loading spinner animation during API calls
- ✅ Smooth animations and transitions throughout
- ✅ Fully responsive mobile-first design
- ✅ Enter key support for mobile number input
- ✅ Dynamic Terms & Conditions loading from Google Docs

### 2. **Functionality Implemented**
- ✅ Mobile number validation (supports 10-digit, +91, and 91 formats)
- ✅ Real-time leaderboard lookup via Google Apps Script
- ✅ User activity logging to "Users Logs" sheet
- ✅ Rank #1 detection with special motivation message
- ✅ Dynamic T&C fetching from Google Docs
- ✅ Error handling with shake animation
- ✅ Loading states with visual feedback

---

## 🔧 What You Need to Do Next

### Step 1: Deploy the Google Apps Script

1. **Open Google Apps Script**
   - Go to https://script.google.com/
   - Click "New Project"

2. **Paste the Code**
   - Open the file: `apps-script.js` in your project folder
   - Copy ALL the code
   - Paste it into the Apps Script editor

3. **Update the IDs**
   Replace these two lines at the top:
   ```javascript
   const SHEET_ID = '1DExwWv7CHrt-aC3V33KOa00Xze7ss8e_7fbJ9a7MNto';  // ✅ Already correct
   const DOC_ID = '1Vcs3p9rSZ9t02az27uAnic0XbspmbjX2RvJPEsDrJTI';    // ✅ Already correct
   ```

4. **Deploy as Web App**
   - Click **Deploy** → **New deployment**
   - Click the gear icon ⚙️ → Select **Web app**
   - Settings:
     - **Execute as**: Me (your email)
     - **Who has access**: Anyone
   - Click **Deploy**
   - **IMPORTANT**: Copy the Web App URL (it will look like: `https://script.google.com/macros/s/...../exec`)

5. **Update Your Website**
   - The current URL in your `script.js` is:
     ```
     https://script.google.com/macros/s/AKfycbzBX_84j8YpGLCYKYHbg0TdWP02NsaFLT3UD7QT6m4YFRV4VdDo-q-2pfNC_7H8MkJgNA/exec
     ```
   - **Replace this** with the NEW Web App URL you just copied
   - This is critical because the old script doesn't have the updated code!

---

### Step 2: Make Google Doc Public (for T&C)

1. Open your T&C document:
   https://docs.google.com/document/d/1Vcs3p9rSZ9t02az27uAnic0XbspmbjX2RvJPEsDrJTI/edit

2. Click **Share** → **Change to anyone with the link**
   - Set to: "Anyone with the link can **view**"
   - This allows the Apps Script to read it

---

### Step 3: Test the Website

1. **Keep the local server running** (it's already running on port 8000)

2. **Test with a real mobile number from your sheet**:
   - Try: `8247200143` (Rank #1 from your sheet)
   - You should see:
     - ✅ Your Rank: 1
     - ✅ Coins Utilized: (value from sheet)
     - ✅ Total Coins Spent: (value from sheet)
     - ✅ Motivation: "🎉 You are currently Rank #1! Keep leading to win Apple AirPods 4!"

3. **Test Terms & Conditions**:
   - Click the "Terms & Conditions" link
   - Should load the content from your Google Doc

---

### Step 4: Deploy to Netlify

#### Option A: Manual Deployment (Easiest)

1. **Create a Netlify account** (if you don't have one):
   - Go to https://www.netlify.com/
   - Sign up with GitHub

2. **Deploy via Drag & Drop**:
   - Go to https://app.netlify.com/drop
   - Drag your entire project folder: `/Users/marieswara/Documents/User Competetion Dashboard`
   - Netlify will give you a live URL instantly!

#### Option B: Deploy via GitHub + Netlify (Recommended)

1. **Create a GitHub repository**:
   - Go to https://github.com/new
   - Name it: `dostt-coins-league`
   - Make it **Public** or **Private** (your choice)
   - Click **Create repository**

2. **Push your code to GitHub**:
   ```bash
   cd "/Users/marieswara/Documents/User Competetion Dashboard"
   git init
   git add .
   git commit -m "Initial commit - Dostt Coins League"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/dostt-coins-league.git
   git push -u origin main
   ```

3. **Connect to Netlify**:
   - Go to https://app.netlify.com/
   - Click **Add new site** → **Import an existing project**
   - Choose **GitHub**
   - Select your `dostt-coins-league` repository
   - Click **Deploy site**

4. **Get your live URL**:
   - Netlify will give you a URL like: `https://dostt-coins-league.netlify.app`
   - You can customize this in **Site settings** → **Change site name**

---

## 🐛 Troubleshooting

### Issue: "Mobile number not found"

**Cause**: The Apps Script isn't finding the mobile number in your sheet.

**Solutions**:
1. Make sure you **redeployed** the Apps Script with the NEW code from `apps-script.js`
2. Check that the column in your sheet is exactly `mobile no` (with a space, not `mobile_no`)
3. Try the mobile number exactly as it appears in the sheet (e.g., if it has +91, include that)

### Issue: "Terms & Conditions not available"

**Cause**: The Apps Script can't access your Google Doc.

**Solutions**:
1. Make the Google Doc **public** (Anyone with the link can view)
2. Redeploy the Apps Script as a **new version**

### Issue: Website looks broken after deployment

**Cause**: The logo file might not be uploaded.

**Solution**:
- Make sure `logo.png` is in the same folder as `index.html`
- If deploying to Netlify, ensure all files are uploaded

---

## 📁 Project Files

| File | Purpose |
|------|---------|
| `index.html` | Main website structure |
| `style.css` | Premium styling and animations |
| `script.js` | Frontend logic and API calls |
| `logo.png` | Dostt Coins League logo |
| `apps-script.js` | Google Apps Script (deploy this separately) |

---

## 🎯 Final Checklist

- [ ] Deploy Google Apps Script with updated code
- [ ] Copy the NEW Web App URL
- [ ] Update `script.js` with the new URL
- [ ] Make Google Doc public (for T&C)
- [ ] Test locally with real mobile number
- [ ] Deploy to Netlify
- [ ] Test live website
- [ ] Share the live URL!

---

## 🚀 Live URL

Once deployed, your website will be live at:
- **Netlify**: `https://your-site-name.netlify.app`

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors (F12 → Console tab)
2. Verify the Apps Script is deployed correctly
3. Test the Apps Script URL directly in your browser

---

**Created by**: Antigravity AI
**Date**: 28 Jan 2026
**Campaign Period**: 29 Jan – 1 Feb 2026
