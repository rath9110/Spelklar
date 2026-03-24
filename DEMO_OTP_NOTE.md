# Demo OTP Mode

## What Changed

In **demo mode**, the app now accepts **ANY 6-digit OTP code**. You don't need to look up the generated code anymore!

## How It Works

When you request an OTP:
1. The server still generates and logs a random code (for reference)
2. But you can type in **any 6-digit number** and it will work
3. Examples: `123456`, `999999`, `000000`, `111111` — all valid!

## When This Applies

Demo mode is active when:
- `NODE_ENV=development` (default locally)
- **OR** SMS credentials (`SMS_USERNAME` / `SMS_PASSWORD`) are not set

Once you deploy to production with:
- `NODE_ENV=production`
- SMS credentials configured

The app switches to **strict mode** where only the correct generated code works (real SMS).

## Benefits

- ✅ Faster testing — just type any code
- ✅ No need to check console for codes
- ✅ Works on production preview (Vercel) without SMS setup
- ✅ Real SMS enabled with one env var change

## Quick Test

```bash
# Local development
npm start

# Then try:
# Phone: +46701234567
# Code: 123456 (or any 6 digits!)
```

## For Production

When you're ready for real SMS:
1. Get SMS credentials from [46elks.com](https://46elks.com)
2. Set on your server:
   ```
   SMS_USERNAME=your-username
   SMS_PASSWORD=your-password
   NODE_ENV=production
   ```
3. Redeploy
4. Now real SMS codes are required

---

**That's it!** Enjoy the frictionless demo experience. 🎉
