# 🛡️ Dayboard™ - Family Management Platform

> **© 2025 BentLo Labs LLC. All Rights Reserved.**

**Dayboard™** is a proprietary family management platform developed by **BentLo Labs LLC**. This application provides an all-in-one household command center for modern families.

## ⚖️ Legal Notice

**PROPRIETARY AND CONFIDENTIAL** - This software contains proprietary and confidential information of BentLo Labs LLC. Any reproduction, distribution, or disclosure of this material without express written permission is strictly prohibited.

**Dayboard™** is a trademark of BentLo Labs LLC.

**Copyright Notice:** All software, documentation, and materials are protected by copyright law and owned by BentLo Labs LLC.

For licensing inquiries: legal@bentlolabs.com

## ✨ Features

### 🏠 **Dashboard Hub**
- **Weather Integration**: 6-day forecast with current conditions
- **Household Calendar**: Color-coded events for all household members
- **Meal Planning**: Weekly dinner suggestions and favorites
- **Quick Lists**: Urgent grocery items and daily todos
- **Project Tracking**: Active household projects with progress bars
- **Quick Actions**: Common tasks like adding meals, starting timers

### 🍽️ **Meal Planning**
- **Recipe Library**: 50+ household-tested recipes with ratings
- **Weekly Planner**: Drag-and-drop meal scheduling
- **Favorites Management**: Save and organize preferred dishes
- **Shopping Integration**: Auto-generate grocery lists from meal plans

### 📝 **Smart Lists**
- **Grocery Lists**: Organized by categories (Produce, Dairy, etc.)
- **Todo Management**: Household task tracking with completion status
- **Shopping Lists**: Progress tracking and shared access
- **Real-time Sync**: Updates across all household devices

### 💼 **Work & Project Management**
- **Time Tracking**: Built-in timers for work sessions
- **Project Dashboard**: Visual progress tracking with task breakdowns
- **Schedule Management**: Daily events and meeting coordination
- **Analytics**: Productivity insights and time allocation

### 👨‍👩‍👧‍👦 **Household Profiles**
- **Member Management**: Individual profiles with roles and responsibilities
- **Household Settings**: Shared preferences and configurations
- **Achievement Tracking**: Celebrate household member accomplishments

## 🎨 Design Highlights

- **Feminine Minimalist**: Soft gradients with purple/pink color palette
- **Tablet-Optimized**: Perfect for kitchen counters and Echo Show devices
- **Collapsible Navigation**: Clean sidebar that adapts to your needs
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account (for database)
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/kylewadektw-oss/dayboard_official.git

# Navigate to project directory
cd dayboard_official

# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Stripe keys

# Run development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Supabase** for database and auth
- **PostgreSQL** for data storage
- **Stripe** for subscription payments

### Deployment
- **Vercel** for hosting
- **Supabase** for backend services

## 📋 Project Status

**Current Phase**: ✅ Phase 1 Complete - Core UI & Mock Data

See [PROJECT_ROADMAP.md](./PROJECT_ROADMAP.md) for detailed development timeline and feature roadmap.

### Completed Features
- ✅ Full dashboard with 8 interactive widgets
- ✅ Complete meal planning system
- ✅ Multi-list management (grocery, todo, shopping)
- ✅ Work time tracking and project management
- ✅ Household profile and household management
- ✅ Responsive navigation with collapsible sidebar
- ✅ Enhanced logging dashboard with real-time monitoring
- ✅ Analytics dashboard suite with 7 specialized monitoring pages

### Next Up
- 🚧 Phase 2: Database Integration with Supabase
- 📅 Phase 3: Advanced features and navigation enhancements
- 💰 Phase 4: Premium features and monetization

## 🔍 Understanding Log Types & Notifications

### 💬 Console Messages (Normal)
- **Info**: General information and status updates
- **Debug**: Technical details for development
- *These are expected and help with monitoring app behavior*

### ⚠️ Issues (Need Attention)
- **Warnings**: Potential problems or deprecated code
- **Errors**: Broken functionality that affects users
- *These should be investigated and resolved when possible*

### 🔄 Why Notifications Come and Go
Logs appear and disappear based on user activity, page changes, and system operations. Errors that "fix themselves" often indicate:
- 🔄 Page refresh resolved the issue
- 🌐 Network connectivity improved
- ⏱️ Temporary timing or loading issue

## 🤝 Contributing

This is a personal household management project. While not currently open for contributions, feedback and suggestions are welcome!

## 📄 License

**PROPRIETARY LICENSE** - This project contains proprietary code owned by Kyle Wade (kyle.wade.ktw@gmail.com). Unauthorized copying, distribution, or commercial use is strictly prohibited. See the [DMCA_PROTECTION.md](DMCA_PROTECTION.md) file for full legal terms.

## 🙋‍♀️ Support

For questions or support, please contact kyle.wade.ktw@gmail.com or open an issue in the GitHub repository.

---

Built with ❤️ for households who want to stay organized and connected.
