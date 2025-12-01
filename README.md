# El Paso Furniture & Style - Invoice Generator

## Quick Start Guide

### How to Run the Application

The invoice generator needs to run through a local web server for PDF downloads to work properly.

**Option 1: Use the START_INVOICE_GENERATOR.bat file (Easiest)**

1. Double-click `START_INVOICE_GENERATOR.bat`
2. The server will start automatically and your browser will open
3. Start creating invoices!
4. To stop the server, close the command window

**Option 2: Manual Start**

1. Open Command Prompt or PowerShell
2. Navigate to: `C:\Users\hecto\.gemini\antigravity\scratch\el-paso-invoice-generator`
3. Run: `python -m http.server 8080`
4. Open your browser to: `http://localhost:8080`

### Why You Need a Local Server

Modern browsers block certain features (like PDF downloads) when pages are opened as local files (`file:///`) for security reasons. Running a local web server solves this issue.

### PDF Generation Now Works! ✅

- **Download PDF** button generates a professional invoice PDF
- PDFs include your logo, all invoice details, and customer information
- Files save directly to your Downloads folder

### Features

- ✅ Create professional invoices
- ✅ Save invoices locally (localStorage)
- ✅ View invoice history
- ✅ Edit existing invoices
- ✅ **Download PDFs** (requires server)
- ✅ Texas tax calculation (8.25%)
- ✅ Multiple payment methods
- ✅ Financing company options

### Business Information (Pre-filled)

- **Name:** El Paso Furniture & Style
- **Address:** 402 S El Paso St, El Paso, TX 79901
- **Phone:** (915) 730-0160
- **Tagline:** Your Comfort, Our Priority

### Troubleshooting

**Problem:** PDF won't download
- **Solution:** Make sure you're running the app through `http://localhost:8080` (not by double-clicking index.html)

**Problem:** "Python not found" error
- **Solution:** Install Python from python.org or use any other simple HTTP server

**Problem:** Port 8080 already in use
- **Solution:** Change `8080` to another number like `8081` in the bat file

### Files

- `index.html` - Main application
- `styles.css` - Design and styling
- `script.js` - Functionality
- `assets/logo.png` - Your business logo
- `START_INVOICE_GENERATOR.bat` - Easy launcher

---

**No monthly fees. No cloud storage. Your data stays on your computer. 100% Free Forever!**
