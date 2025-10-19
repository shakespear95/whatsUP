# Email Template Setup - Magic Link + 6-Digit Code

## Overview
Configure Supabase to send emails with **BOTH** a clickable magic link AND a 6-digit code for maximum user flexibility.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Enable Email Provider

1. **Go to Supabase Auth Providers:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/providers
   ```

2. **Enable Email provider:**
   - Find "Email" in the list
   - Toggle to **ENABLED**
   - **Enable email confirmations:** OFF (for faster login)
   - **Secure email change:** ON (recommended)

3. **Click "Save"**

---

### Step 2: Configure Email Templates

1. **Go to Email Templates:**
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/templates
   ```

2. **Select "Magic Link" template**

3. **Replace with this custom template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dein Login-Code für WhatsUP</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .content {
      padding: 40px 30px;
    }
    .code-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 30px;
      border-radius: 12px;
      margin: 30px 0;
    }
    .code-label {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.9;
      margin-bottom: 15px;
    }
    .code {
      font-size: 48px;
      font-weight: bold;
      letter-spacing: 10px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
    .code-validity {
      font-size: 13px;
      opacity: 0.9;
      margin-top: 15px;
    }
    .divider {
      text-align: center;
      margin: 40px 0;
      position: relative;
    }
    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e0e0e0;
    }
    .divider span {
      background: white;
      padding: 0 20px;
      position: relative;
      color: #999;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .info-box h3 {
      margin: 0 0 10px 0;
      color: #667eea;
      font-size: 16px;
    }
    .info-box ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .info-box li {
      margin: 5px 0;
      color: #666;
    }
    .footer {
      text-align: center;
      padding: 30px;
      color: #999;
      font-size: 13px;
      border-top: 1px solid #e0e0e0;
    }
    .security-note {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>🎉 Dein Login-Code</h1>
      <p>Willkommen zurück bei WhatsUP Event Finder!</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p style="font-size: 16px; margin-bottom: 25px;">
        Hallo! 👋
      </p>
      <p style="font-size: 16px; margin-bottom: 25px;">
        Hier ist dein Login-Code, um Events zu entdecken. Du hast <strong>zwei einfache Optionen</strong> zum Anmelden:
      </p>

      <!-- Option 1: 6-Digit Code -->
      <div class="code-box">
        <div class="code-label">📱 Option 1: Code eingeben</div>
        <div class="code">{{ .Token }}</div>
        <div class="code-validity">⏱️ Gültig für 60 Minuten</div>
      </div>

      <div class="info-box">
        <h3>Wie funktioniert es?</h3>
        <ul>
          <li>Kopiere den 6-stelligen Code oben</li>
          <li>Gehe zurück zur WhatsUP App</li>
          <li>Gib den Code ein</li>
          <li>Fertig! 🎉</li>
        </ul>
      </div>

      <!-- Divider -->
      <div class="divider">
        <span>Oder</span>
      </div>

      <!-- Option 2: Magic Link -->
      <div style="text-align: center; margin: 40px 0;">
        <p style="font-size: 16px; margin-bottom: 20px;">
          <strong>🔗 Option 2: Einfach klicken</strong>
        </p>
        <div class="button-container">
          <a href="{{ .ConfirmationURL }}" class="button">
            ✨ Magic Link - Sofort anmelden
          </a>
        </div>
        <p style="font-size: 13px; color: #999; margin-top: 15px;">
          Dieser Link ist 60 Minuten gültig und kann nur einmal verwendet werden.
        </p>
      </div>

      <!-- Security Note -->
      <div class="security-note">
        <strong>🔒 Sicherheitshinweis:</strong> Wenn du diese E-Mail nicht angefordert hast, ignoriere sie einfach. Dein Account ist sicher.
      </div>

      <!-- Help Section -->
      <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 14px; color: #666;">
          <strong>Probleme beim Anmelden?</strong><br>
          • Code funktioniert nicht? Fordere einen neuen an<br>
          • Link abgelaufen? Starte den Login-Prozess erneut<br>
          • Weitere Hilfe? support@whatsup.com
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        <strong>WhatsUP Event Finder</strong><br>
        Entdecke 20+ Events mit KI-Power 🚀
      </p>
      <p style="margin-top: 15px;">
        © 2025 WhatsUP. Alle Rechte vorbehalten.
      </p>
    </div>
  </div>
</body>
</html>
```

4. **Click "Save"**

---

## 🎨 What Users Will See

### Email Preview:

```
┌─────────────────────────────────────────┐
│  🎉 Dein Login-Code                     │
│  Willkommen zurück bei WhatsUP!         │
└─────────────────────────────────────────┘

Hallo! 👋

Hier ist dein Login-Code, um Events zu
entdecken. Du hast zwei einfache Optionen:

┌─────────────────────────────────────────┐
│  📱 Option 1: Code eingeben             │
│                                         │
│         1 2 3 4 5 6                     │
│                                         │
│  ⏱️ Gültig für 60 Minuten               │
└─────────────────────────────────────────┘

Wie funktioniert es?
• Kopiere den 6-stelligen Code
• Gehe zurück zur WhatsUP App
• Gib den Code ein
• Fertig! 🎉

─────────── Oder ───────────

🔗 Option 2: Einfach klicken

[ ✨ Magic Link - Sofort anmelden ]

Dieser Link ist 60 Minuten gültig.

🔒 Sicherheitshinweis: Wenn du diese
E-Mail nicht angefordert hast, ignoriere
sie einfach.
```

---

## 🔧 Template Variables

Supabase provides these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{ .Token }}` | 6-digit OTP code | `123456` |
| `{{ .ConfirmationURL }}` | Magic link URL | `https://...` |
| `{{ .Email }}` | User's email | `user@example.com` |
| `{{ .SiteURL }}` | Your site URL | `https://yourapp.com` |

---

## 🧪 Test the Email

### Test Before Going Live:

1. **Send Test Email** (in Supabase dashboard):
   - Go to Email Templates
   - Click "Send test email"
   - Enter your email
   - Check inbox

2. **Verify Email Contains:**
   - ✅ 6-digit code visible
   - ✅ Magic link button works
   - ✅ Both options clearly explained
   - ✅ Good mobile rendering

3. **Test Both Login Methods:**
   - **Method 1:** Copy code → paste in app → works
   - **Method 2:** Click magic link → redirects → logged in

---

## 📱 Mobile Optimization

The email template is fully responsive:

### Desktop View:
- Full-width layout (600px max)
- Large code display (48px)
- Prominent button

### Mobile View:
- Adapts to screen width
- Touch-friendly button
- Easy-to-read code
- Scrollable content

---

## 🎨 Customization Options

### Change Colors:
```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your brand colors: */
background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
```

### Change Code Style:
```css
.code {
  font-size: 48px; /* Make bigger: 56px */
  letter-spacing: 10px; /* More spacing: 15px */
  font-family: 'Courier New', monospace; /* Change font */
}
```

### Add Your Logo:
```html
<div class="header">
  <img src="https://yourcdn.com/logo.png" alt="Logo" style="max-width: 150px; margin-bottom: 20px;">
  <h1>🎉 Dein Login-Code</h1>
</div>
```

---

## 🔐 Security Best Practices

### Token Expiration:
```typescript
// In Supabase Auth Settings → Email
{
  "token_expiry": 3600 // 60 minutes (default)
}

// Can change to:
{
  "token_expiry": 300 // 5 minutes (more secure)
}
```

### Rate Limiting:
```typescript
// Supabase automatically rate limits:
// - 4 OTP emails per hour per email address
// - Prevents abuse
```

### Security Warnings in Email:
```html
<div class="security-note">
  🔒 Wenn du diese E-Mail nicht angefordert hast,
  ignoriere sie einfach. Dein Account ist sicher.
</div>
```

---

## 📊 Email Deliverability

### Improve Delivery Rates:

1. **Configure SMTP** (optional, for production):
   - Supabase Auth Settings → Email
   - Add custom SMTP server
   - Use SendGrid, Mailgun, or AWS SES

2. **SPF/DKIM Records:**
   - Add to your domain DNS
   - Improves deliverability
   - Reduces spam flags

3. **Test with Different Providers:**
   - Gmail ✅ Usually works
   - Outlook ✅ Usually works
   - Yahoo ⚠️ Sometimes slow
   - Corporate emails ⚠️ May be blocked

---

## 🐛 Troubleshooting

### Issue: Email not received

**Solutions:**
1. Check spam folder
2. Verify email is correct
3. Check Supabase email logs:
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/logs
   ```
4. Resend code (wait 60 seconds between requests)

### Issue: Code doesn't work

**Solutions:**
1. Check if code expired (60 minutes)
2. Ensure code is correct (6 digits)
3. Request new code
4. Check Supabase logs for errors

### Issue: Magic link doesn't work

**Solutions:**
1. Check redirect URL is configured:
   ```
   https://supabase.com/dashboard/project/ozezwaqtumofuybazkvo/auth/url-configuration
   ```
2. Ensure link hasn't expired
3. Try code method instead
4. Check browser isn't blocking cookies

---

## 🚀 Production Checklist

Before going live with email auth:

- [ ] Email provider enabled in Supabase
- [ ] Custom email template uploaded
- [ ] Test email sent and received
- [ ] Code login tested (6-digit)
- [ ] Magic link tested (click)
- [ ] Mobile rendering checked
- [ ] Spam folder checked
- [ ] Rate limiting understood
- [ ] Security warnings included
- [ ] Support email added
- [ ] Logo/branding added (optional)
- [ ] Custom SMTP configured (optional)

---

## 📈 Monitoring

### Track Email Success:

```typescript
// In Supabase dashboard
Auth → Logs → Filter by:
- "otp_sent" (email sent successfully)
- "otp_verified" (code verified)
- "magic_link_clicked" (link clicked)
```

### Success Metrics:
- **Email delivery rate:** Target 95%+
- **Code entry rate:** Track % who use code vs link
- **Time to verify:** Average time from send to verify
- **Error rate:** Failed verifications

---

## 💡 User Experience Tips

### Best Practices:

1. **Show Both Options Clearly:**
   - Don't hide the code option
   - Don't hide the link option
   - Let users choose their preference

2. **Explain What Happens:**
   - "Check your email for a code"
   - "You can use the code OR click the link"
   - Clear instructions in UI

3. **Provide Fallbacks:**
   - "Didn't receive email? Resend code"
   - "Code not working? Try the magic link"
   - "Need help? Contact support"

4. **Make It Fast:**
   - Code entry is fastest (10 seconds)
   - Magic link is easiest (1 click)
   - Both should complete in <30 seconds

---

## 🔄 Alternative: Text-Only Email

If HTML doesn't work, use plain text:

```
Hallo!

Dein WhatsUP Login-Code: 123456

Du hast zwei Optionen zum Anmelden:

Option 1 - Code eingeben:
1. Gehe zur WhatsUP App
2. Gib den Code ein: 123456
3. Fertig!

Option 2 - Magic Link:
Klicke hier: https://yourapp.com/auth/callback?token=...

Der Code ist 60 Minuten gültig.

Sicherheitshinweis: Wenn du diese E-Mail nicht
angefordert hast, ignoriere sie einfach.

WhatsUP Event Finder
support@whatsup.com
```

---

## 📚 Related Documentation

- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth/auth-email
- **Email Templates Guide:** https://supabase.com/docs/guides/auth/auth-email-templates
- **OTP Documentation:** https://supabase.com/docs/reference/javascript/auth-signinwithotp

---

**Created:** 2025-01-15
**Status:** ✅ Ready to Implement
**Email Format:** HTML + Plain Text Fallback
**User Options:** 6-Digit Code OR Magic Link
