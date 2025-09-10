# 🔐 Environment Variables Security Guide

This guide explains how to properly manage environment variables for the Dayboard application.

## 📁 File Structure

- `.env.example` - Template file (safe to commit) - shows required variables without sensitive values
- `.env.local` - Local development environment (never commit)
- `.env` - Current environment file (never commit)

## 🚨 Security Best Practices

### ❌ NEVER COMMIT THESE FILES:
- `.env`
- `.env.local` 
- `.env.production`
- `.env.staging`
- Any file containing actual API keys, secrets, or sensitive data

### ✅ ALWAYS COMMIT THESE FILES:
- `.env.example` - Template with placeholder values
- This security guide

## 🔑 Sensitive Variables to Protect

The following variables contain sensitive data and should never be exposed:

### Critical Secrets:
- `SUPABASE_SERVICE_ROLE_KEY` - Server-only database access
- `GOOGLE_CLIENT_SECRET` - OAuth authentication secret
- `STRIPE_SECRET_KEY` - Payment processing secret
- `STRIPE_WEBHOOK_SECRET` - Webhook verification

### Moderately Sensitive:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Database access key
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - OAuth client identifier
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Maps API access

## 🚀 Deployment Security

### For Vercel (Recommended):
1. Set environment variables in Vercel dashboard
2. Use different values for staging vs production
3. Never include sensitive values in the codebase

### Environment Variable Checklist:
- [ ] Production secrets are set in hosting platform
- [ ] Staging uses separate API keys from production
- [ ] Local development uses test/development keys
- [ ] No `.env` files with secrets are committed to git

## 🛠️ Setup Instructions

### 1. Initial Setup:
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your development values
# DO NOT edit .env directly for committed code
```

### 2. For Team Members:
```bash
# Get the template
cp .env.example .env.local

# Ask team lead for development API keys
# Never share production keys via code or chat
```

### 3. For Production Deployment:
- Set variables in your hosting platform (Vercel, Railway, etc.)
- Use production API keys (not test keys)
- Enable production security features

## 🚨 Emergency Response

If secrets are accidentally committed:
1. Immediately revoke/rotate the exposed keys
2. Remove secrets from git history: `git filter-branch` or `git-secrets`
3. Generate new keys and update deployment platform
4. Audit logs for any unauthorized access

## 📞 Need Help?

- Check Vercel docs for environment variables
- Review Supabase security best practices
- Contact team lead for production key access

---
**Remember: When in doubt, don't commit it!**
