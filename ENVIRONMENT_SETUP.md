# Environment Configuration Guide

This project uses multiple environment configurations to support development, staging, and production deployments.

## Environment Files

- **`.env`** - Template file with all required environment variables (committed to git)
- **`.env.local`** - Local development environment (never committed to git)
- **`.env.staging`** - Staging environment configuration (committed to git)
- **`.env.production`** - Production environment configuration (committed to git)

## Environment-Specific Scripts

### Development (Local)
Uses `.env.local` automatically:
```bash
npm run dev              # Start development server with local env
npm run supabase:start   # Start local Supabase instance
```

### Staging
Uses `.env.staging`:
```bash
npm run build:staging    # Build with staging environment
npm run start:staging    # Start with staging environment
```

### Production
Uses `.env.production`:
```bash
npm run build:production # Build with production environment
npm run start:production # Start with production environment
```

### Utility Scripts
```bash
npm run env:check        # Check current environment variables
```

## Environment Setup Instructions

### 1. Development Setup
1. Copy `.env` to `.env.local`
2. Update `.env.local` with your local development values
3. Start local Supabase: `npm run supabase:start`
4. Run development server: `npm run dev`

### 2. Staging Setup
1. Update `.env.staging` with your staging environment values
2. Deploy to your staging environment (e.g., Vercel preview branch)
3. Set environment variables in your hosting platform

### 3. Production Setup
1. Update `.env.production` with your production values
2. **Important**: Replace test Stripe keys with live keys in production
3. Deploy to your production environment
4. Set environment variables in your hosting platform

## Key Differences Between Environments

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `NODE_ENV` | development | production | production |
| `NEXT_PUBLIC_DEBUG_MODE` | true | false | false |
| `NEXT_PUBLIC_SUPABASE_URL` | Local (127.0.0.1) | Remote | Remote |
| `STRIPE_*` | Test keys | Test keys | **Live keys** |
| `NEXT_PUBLIC_APP_NAME` | "Dayboard (Dev)" | "Dayboard (Staging)" | "Dayboard" |

## Security Notes

- Never commit `.env.local` - it contains your local development secrets
- `.env.staging` and `.env.production` can be committed as they should only contain non-sensitive configuration
- Always use test Stripe keys in development and staging
- Only use live Stripe keys in production
- Keep service role keys secure and never expose them in client-side code

## Deployment Checklist

### Staging Deployment
- [x] Update `.env.staging` with correct URLs
- [x] Fix package manager lock file conflicts
- [x] Remove duplicate route conflicts
- [x] **SUCCESSFUL DEPLOYMENT** - Build completed and deployed to Vercel ✅
- [x] Simplify auth to Google OAuth only (removed email/password signin)
- [ ] Configure Google OAuth provider in Supabase
- [ ] Verify Stripe test keys are being used
- [ ] Test all functionality in staging environment
- [ ] Verify database migrations are applied

### Production Deployment
- [ ] Update `.env.production` with production URLs
- [ ] **Replace Stripe keys with live production keys**
- [ ] Set up proper webhook endpoints
- [ ] Verify SSL certificates
- [ ] Test payment flows with real transactions
- [ ] Set up monitoring and error tracking
