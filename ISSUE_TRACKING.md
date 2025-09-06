# Issue Tracking and Logging Guide

## Current Issue Logging Locations

### 1. Browser Console
- **Authentication issues**: Check browser dev tools console (F12)
- **OAuth errors**: Look for CSP violations, PKCE errors, etc.
- **Client-side JavaScript errors**: All `console.log`, `console.error` statements

### 2. Next.js Development Server
- **Terminal output**: Server-side errors, compilation issues
- **Location**: VS Code terminal running `npm run dev`
- **Types**: Build errors, API route errors, middleware issues

### 3. Supabase Dashboard
- **Auth logs**: https://supabase.com/dashboard/project/csbwewirwzeitavhvykr/auth/logs
- **API logs**: https://supabase.com/dashboard/project/csbwewirwzeitavhvykr/logs
- **Real-time logs**: Database operations, auth events

### 4. VS Code Problems Panel
- **TypeScript errors**: View → Problems (Ctrl+Shift+M / Cmd+Shift+M)
- **ESLint warnings**: Code quality issues
- **Build-time errors**: Compilation failures

## Setting Up Better Issue Tracking

### Option 1: VS Code Extensions (Recommended for Development)
- **Error Lens**: Shows errors inline in code
- **Console Ninja**: Enhanced console logging
- **GitLens**: Git blame and history for tracking when issues were introduced

### Option 2: Application Monitoring (Recommended for Production)
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and error tracking
- **Vercel Analytics**: If deploying to Vercel

### Option 3: Simple Logging System
- **File-based logging**: Create log files for different issue types
- **Structured logging**: JSON format for easy parsing
- **Log rotation**: Prevent log files from growing too large

## Current Issues We're Tracking

### 1. Google OAuth Configuration
- **Status**: 🔄 In Progress
- **Issue**: PKCE code challenge errors
- **Location**: Browser console, auth callback
- **Files**: `/app/auth/callback/route.ts`, OAuth components

### 2. CSP (Content Security Policy)
- **Status**: ✅ Resolved (Disabled for development)
- **Issue**: Blocking Google OAuth JavaScript
- **Location**: Browser console
- **Files**: `next.config.js`

### 3. Environment Variables
- **Status**: ✅ Verified
- **Issue**: All required env vars present
- **Location**: `.env.local`

## Immediate Actions for Better Issue Tracking

1. **Enable VS Code Problems Panel**
2. **Install Error Lens extension**
3. **Set up Sentry for production monitoring**
4. **Create structured logging system**
