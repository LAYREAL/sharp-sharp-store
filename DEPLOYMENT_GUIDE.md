# 🚀 Deployment Guide: GitHub + Vercel / Netlify Auto-Deployment

Follow these simple steps to host your **SHARP SHARP** store on **GitHub** and connect it to **Vercel** or **Netlify** for free, automatic deployment.

---

## 📦 Step 1: Create a GitHub Repository

1. Go to **[GitHub.com](https://github.com)** and sign in (or create a free account).
2. Click the **`+`** icon in the top right corner and select **"New repository"**.
3. Name your repository: `sharp-sharp-store`.
4. Keep it set to **Public** (or Private), leave all checkboxes unchecked, and click **"Create repository"**.

---

## 📁 Step 2: Upload Your Code to GitHub

Your project files are located at:
`C:\Users\HomePC\.gemini\antigravity\scratch\momo-whatsapp-store`

### Easy Web Upload Method (No Git CLI needed):
1. On your new empty GitHub repository page, click **"uploading an existing file"**.
2. Open your computer file explorer at `C:\Users\HomePC\.gemini\antigravity\scratch\momo-whatsapp-store`.
3. Drag and drop all files and folders (except `node_modules` and `dist` which are generated automatically).
4. Click **"Commit changes"**.

*Or if you use GitHub Desktop, simply open `C:\Users\HomePC\.gemini\antigravity\scratch\momo-whatsapp-store` and click "Publish Repository".*

---

## ⚡ Step 3: Connect GitHub to Vercel (Free Automatic Deployment)

1. Go to **[Vercel.com](https://vercel.com)** and click **"Sign Up"** (choose **"Continue with GitHub"**).
2. Once signed in, click **"Add New..."** ➔ **"Project"**.
3. Under **"Import Git Repository"**, locate your `sharp-sharp-store` repository and click **"Import"**.
4. Leave all default settings unchanged (Vercel automatically detects Vite + React!):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**.

---

## 🎉 Done! Your Store is Live!

Within ~20 seconds, Vercel will build your store and provide you with your live URL:
👉 `https://sharp-sharp-store.vercel.app` (or custom domain).

### 🔄 Automatic Updates:
Whenever you update code or add changes to your GitHub repository in the future, Vercel will automatically re-deploy your live website in seconds!
