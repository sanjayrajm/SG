
# SG CALL TAXI - NEURAL NETWORK V5.4

The premier AI-powered taxi ecosystem for Kanchipuram and Tamil Nadu.

## 🚀 Deployment Guide (Publish to GitHub)

To publish this website live to the internet, follow these exact steps:

### 1. Create a Repository
1. Log in to [GitHub](https://github.com).
2. Create a new repository named `sg-taxi`.
3. Do **not** initialize with a README (this project already has one).

### 2. Push the Code
In your local project folder, run these commands:
```bash
git init
git add .
git commit -m "Initial mission deployment: SG Neural Core v5.4"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sg-taxi.git
git push -u origin main
```

### 3. Setup Gemini AI
For the Neural Routing and Voice features to work in production:
1. Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret**.
3. Name: `GEMINI_API_KEY`.
4. Value: (Paste your Google AI Studio API Key).

### 4. Enable GitHub Pages
1. Go to Repository **Settings** -> **Pages**.
2. Under **Build and deployment**, set the source to **GitHub Actions**.
3. The included `.github/workflows/deploy.yml` will handle the rest!

## 🛠 Local Tactical Execution
If you prefer running locally with the Python launcher:
```bash
python main.py
```

## ✨ Tech Stack
- **Engine**: React 19 + Vite (Ultra-fast HMR)
- **Intelligence**: Gemini 2.5 Live API (Voice) & Pro (Routing)
- **Styling**: Tailwind CSS + Framer Motion (Tactical UI)
- **Deployment**: GitHub Actions + GitHub Pages

---

© 2025 SG CALL TAXI. All Rights Reserved.
