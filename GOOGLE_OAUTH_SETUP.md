# Google OAuth Setup Guide

Follow these steps to set up Google OAuth for your EventFinder application.

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Name your project (e.g., "EventFinder OAuth")

## 2. Enable Google+ API

1. In the Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" and enable it
3. Also enable "People API" for better user profile access

## 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type (unless you have a Google Workspace account)
3. Fill in the required information:
   - **App name**: EventFinder
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes (optional for basic profile access):
   - `openid`
   - `email`
   - `profile`
5. Add test users if needed
6. Save and continue

## 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Configure the settings:
   - **Name**: EventFinder Web Client
   - **Authorized JavaScript origins**:
     - `https://eventfinder-react-7bb5t9n7n-shakespears-projects.vercel.app`
     - `http://localhost:3000` (for local development)
   - **Authorized redirect URIs**:
     - `https://eventfinder-react-7bb5t9n7n-shakespears-projects.vercel.app/api/auth/google/callback`
     - `http://localhost:3000/api/auth/google/callback` (for local development)

5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

## 5. Update Environment Variables

### For Local Development (.env.local):
```env
GOOGLE_CLIENT_ID=your-client-id-from-step-4
GOOGLE_CLIENT_SECRET=your-client-secret-from-step-4
REACT_APP_GOOGLE_CLIENT_ID=your-client-id-from-step-4
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### For Production (Vercel):
1. Add Vercel secrets:
```bash
vercel secrets add google-client-id "your-client-id-from-step-4"
vercel secrets add google-client-secret "your-client-secret-from-step-4"
```

2. The `vercel.json` is already configured to use these secrets.

## 6. Test the Integration

1. Start your development server: `npm start`
2. Open your app in the browser
3. Try to sign in with Google
4. You should see the Google OAuth popup

## 7. Deploy to Production

```bash
vercel --prod
```

## Common Issues & Solutions

### Issue: "redirect_uri_mismatch"
**Solution**: Make sure the redirect URIs in your Google Cloud Console match exactly with your domain.

### Issue: "Invalid client_id"
**Solution**: Double-check that your client ID is correctly set in both the backend and frontend environment variables.

### Issue: "Access blocked"
**Solution**: Add your email as a test user in the OAuth consent screen settings.

### Issue: "This app isn't verified"
**Solution**: This is normal for apps in development. Click "Advanced" > "Go to EventFinder (unsafe)" to continue testing.

## Security Notes

1. **Never expose your Client Secret** in frontend code
2. **Use HTTPS in production** - OAuth requires secure connections
3. **Validate tokens server-side** - Always verify Google tokens on your backend
4. **Set appropriate scopes** - Only request the permissions you need

## Production Checklist

- [ ] OAuth consent screen is configured
- [ ] Authorized domains are set correctly
- [ ] Client ID and Secret are added to Vercel secrets
- [ ] App is deployed and accessible via HTTPS
- [ ] Google Sign-In button appears and works
- [ ] User profile information is correctly retrieved
- [ ] JWT tokens are properly generated after Google login

Your Google OAuth integration is now ready! 🎉