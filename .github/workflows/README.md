# CI/CD Pipeline - Setup Guide

## 🎯 What This Does

Automatically runs on every pull request and deployment:
- ✅ Lints code
- ✅ Type checks TypeScript
- ✅ Runs unit tests
- ✅ Builds application
- ✅ Generates coverage reports
- ✅ Auto-deploys to Vercel on merge to main

---

## 🔧 Required GitHub Secrets

Add these in: **GitHub repo → Settings → Secrets and variables → Actions**

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### Vercel Configuration
```
VERCEL_TOKEN         # Get from: vercel.com/account/tokens
VERCEL_ORG_ID        # Find in: .vercel/project.json
VERCEL_PROJECT_ID    # Find in: .vercel/project.json
```

---

## 📝 How to Get Vercel Credentials

### 1. Get Vercel Token
```bash
# Go to: https://vercel.com/account/tokens
# Click "Create Token"
# Name: "GitHub Actions"
# Scope: "Full Account"
# Copy token → Add as VERCEL_TOKEN secret
```

### 2. Get Project IDs
```bash
# In your project directory:
npm i -g vercel
vercel link

# This creates .vercel/project.json
cat .vercel/project.json

# Copy:
# - orgId → VERCEL_ORG_ID
# - projectId → VERCEL_PROJECT_ID
```

---

## 🚀 Usage

### On Pull Requests
1. Create PR
2. CI runs automatically
3. See results in "Checks" tab
4. Can't merge if tests fail

### On Push to Main
1. Merge PR
2. CI runs + deploys to Vercel
3. Comment added with deployment URL
4. Live in ~5 minutes

---

## ✅ Verification

After setting up, create a test PR:
```bash
git checkout -b test-ci
echo "# Test" >> README.md
git add README.md
git commit -m "test: CI pipeline"
git push origin test-ci
```

Then check GitHub → Pull Requests → Checks tab

---

## 🐛 Troubleshooting

**Tests failing?**
- Check test output in Actions tab
- Fix locally: `npm run test:run`

**Build failing?**
- Check environment variables are set
- Verify Firebase config is correct

**Deploy failing?**
- Check Vercel token is valid
- Verify project IDs are correct

---

## 📊 Benefits

- ✅ Can't merge broken code
- ✅ Auto-deployment saves 30min/deploy
- ✅ Confidence in every merge
- ✅ Coverage tracking
- ✅ Free (GitHub Actions free tier)
