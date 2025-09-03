# dayboard

A modern household command center that organizes calendars, meals, grocery lists, weather, and family updates into one elegant dashboard. Built with Next.js, Supabase, and Vercel.

> ✅ **Production Status**: Latest deployment includes enhanced profile system with photo uploads, household management, and embedded location maps.

## Features

- 🏠 **Household Management**: Create and manage household invitations with unique codes
- 👤 **Enhanced Profiles**: Photo uploads, date of birth with auto-age calculation, professional info
- 👨‍👩‍👧‍👦 **Family & Pets**: Track household dependents including children and pets
- 🗺️ **Location Maps**: Embedded interactive maps for household addresses
- 🔐 **Secure Credentials**: Encrypted storage for household passwords and accounts
- ✏️ **Modern UI**: Consistent edit buttons and smooth animations throughout
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/kylewadektw-oss/dayboard.git
cd dayboard
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
- **Supabase**: Add your Supabase URL and anon key
- **Google Maps** (Optional): Add your Google Maps API key for embedded maps
  - Get your API key from [Google Cloud Console](https://developers.google.com/maps/documentation/embed/get-api-key)
  - Enable "Maps Embed API" in your Google Cloud project
  - Without this key, maps will show a fallback with a link to Google Maps

### 3. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
