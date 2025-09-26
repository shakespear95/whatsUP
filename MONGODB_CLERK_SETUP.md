# MongoDB Atlas + Clerk Authentication Setup Guide

## Overview
This setup uses **MongoDB Atlas** (free tier) for the database and **Clerk** for authentication. Both services offer generous free tiers and are much easier to configure than PostgreSQL + custom auth.

## Benefits of This Stack
- **MongoDB Atlas**: 512MB free tier, no setup required, works perfectly with Vercel
- **Clerk**: Handles Google OAuth, email/password, magic links automatically
- **Zero Configuration**: No complex database connections or JWT management
- **Production Ready**: Scalable, secure, and reliable

---

## Step 1: MongoDB Atlas Setup (5 minutes)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose **"Build a database"**

### 1.2 Create Free Cluster
1. Select **"M0 Sandbox"** (FREE tier - 512MB)
2. Choose a **cloud provider** (AWS recommended)
3. Select **region** closest to your users
4. Cluster name: `eventfinder-cluster`
5. Click **"Create"**

### 1.3 Setup Database Access
1. **Database Access** → **Add New Database User**
2. Choose **"Password"** authentication
3. Username: `eventfinder`
4. Password: Click **"Autogenerate Secure Password"** (copy it!)
5. Database User Privileges: **"Read and write to any database"**
6. Click **"Add User"**

### 1.4 Setup Network Access
1. **Network Access** → **Add IP Address**
2. Click **"Allow Access from Anywhere"** (for Vercel)
3. Confirm by clicking **"Add Entry"**

### 1.5 Get Connection String
1. **Clusters** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **4.1 or later**
4. Copy the connection string:
   ```
   mongodb+srv://eventfinder:<password>@eventfinder-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

---

## Step 2: Clerk Authentication Setup (5 minutes)

### 2.1 Create Clerk Account
1. Go to https://clerk.com
2. Sign up with email or GitHub
3. Click **"Create Application"**

### 2.2 Configure Application
1. **Application name**: `EventFinder`
2. **Sign-in options**:
   - ✅ Email address
   - ✅ Google
   - ✅ GitHub (optional)
3. Click **"Create Application"**

### 2.3 Get API Keys
1. Go to **"API Keys"** in the dashboard
2. Copy these values:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 2.4 Configure Domains (for production)
1. Go to **"Domains"**
2. Add your Vercel domain: `your-app.vercel.app`

---

## Step 3: Environment Variables

### 3.1 Add to Vercel Dashboard
Go to your Vercel project → **Settings** → **Environment Variables**

Add these variables:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://eventfinder:YOUR_PASSWORD@eventfinder-cluster.xxxxx.mongodb.net/eventfinder?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# AI API Keys (existing)
OPENAI_API_KEY=your-openai-api-key-here
SERP_API_KEY=your-serp-api-key-here
PERPLEXITY_API_KEY=your-perplexity-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
```

### 3.2 Update .env.example
```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventfinder?retryWrites=true&w=majority

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# AI API Keys
OPENAI_API_KEY=your-openai-api-key-here
SERP_API_KEY=your-serp-api-key-here
PERPLEXITY_API_KEY=your-perplexity-api-key-here
GOOGLE_AI_API_KEY=your-google-ai-api-key-here
```

---

## Step 4: Frontend Integration (Already Done)

The frontend integration is ready in the codebase:

### 4.1 Available API Endpoints
- `POST /api/user/sync` - Sync Clerk user to MongoDB
- `POST /api/search-mongodb` - Save searches to database
- `GET /api/user/search-history/[userId]` - Get user's search history

### 4.2 Database Collections
1. **users** - User profiles from Clerk
2. **user_searches** - Search history with results

---

## Step 5: Testing the Setup

### 5.1 Test Database Connection
Visit: `https://your-app.vercel.app/api/hello`

Should return success if MongoDB is connected.

### 5.2 Test Authentication
1. Go to your app
2. Click sign up/login
3. Should show Clerk auth modal
4. After login, user should be synced to MongoDB

### 5.3 Test Search History
1. Login with Clerk
2. Perform a search
3. Search should be saved to MongoDB
4. View search history (when implemented)

---

## Step 6: Cost & Scaling

### Free Tier Limits
- **MongoDB Atlas**: 512MB storage, shared CPU
- **Clerk**: 10,000 monthly active users
- **Total Cost**: $0/month for most apps

### When to Upgrade
- **MongoDB**: Upgrade when you hit 512MB (~50,000+ searches)
- **Clerk**: Upgrade when you hit 10,000 active users
- **Both scale easily** with usage

---

## Step 7: Production Deployment

### 7.1 Deploy to Vercel
1. Push code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy automatically

### 7.2 Configure Clerk Domains
1. Add production domain in Clerk dashboard
2. Update redirect URLs if needed

### 7.3 MongoDB Security
- IP whitelist (already configured for "anywhere")
- Regular password rotation
- Monitor usage in Atlas dashboard

---

## Troubleshooting

### Common Issues
1. **Connection Error**: Check MongoDB URI format and password
2. **Auth Not Working**: Verify Clerk keys and domain settings
3. **API 500 Errors**: Check Vercel function logs
4. **CORS Issues**: Ensure domains are configured in Clerk

### Debug Steps
1. Check Vercel function logs
2. Verify environment variables are set
3. Test API endpoints individually
4. Check Clerk dashboard for auth events
5. Monitor MongoDB Atlas for connection issues

---

## What's Next

After setup, you'll have:
- ✅ **Working authentication** with Google, email, etc.
- ✅ **Persistent user accounts** in MongoDB
- ✅ **Search history** saved per user
- ✅ **Scalable architecture** for thousands of users
- ✅ **Zero maintenance** databases and auth

This is a **production-ready** setup that will scale with your app!