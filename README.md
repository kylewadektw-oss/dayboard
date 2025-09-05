# Family Command Center

> A comprehensive family management dashboard built with Next.js, designed for tablets and Echo Show devices.

## ✨ Features

### 🏠 **Dashboard Hub**
- **Weather Integration**: 6-day forecast with current conditions
- **Family Calendar**: Color-coded events for all family members
- **Meal Planning**: Weekly dinner suggestions and favorites
- **Quick Lists**: Urgent grocery items and daily todos
- **Project Tracking**: Active family projects with progress bars
- **Quick Actions**: Common tasks like adding meals, starting timers

### 🍽️ **Meal Planning**
- **Recipe Library**: 50+ family-tested recipes with ratings
- **Weekly Planner**: Drag-and-drop meal scheduling
- **Favorites Management**: Save and organize preferred dishes
- **Shopping Integration**: Auto-generate grocery lists from meal plans

### 📝 **Smart Lists**
- **Grocery Lists**: Organized by categories (Produce, Dairy, etc.)
- **Todo Management**: Family task tracking with completion status
- **Shopping Lists**: Progress tracking and shared access
- **Real-time Sync**: Updates across all family devices

### 💼 **Work & Project Management**
- **Time Tracking**: Built-in timers for work sessions
- **Project Dashboard**: Visual progress tracking with task breakdowns
- **Schedule Management**: Daily events and meeting coordination
- **Analytics**: Productivity insights and time allocation

### 👨‍👩‍👧‍👦 **Family Profiles**
- **Member Management**: Individual profiles with roles and responsibilities
- **Household Settings**: Shared preferences and configurations
- **Achievement Tracking**: Celebrate family member accomplishments

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
- ✅ Family profile and household management
- ✅ Responsive navigation with collapsible sidebar

### Next Up
- 🚧 Phase 2: Database Integration with Supabase
- 📅 Phase 3: Advanced features and navigation enhancements
- 💰 Phase 4: Premium features and monetization

## 🤝 Contributing

This is a personal family management project. While not currently open for contributions, feedback and suggestions are welcome!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♀️ Support

For questions or support, please open an issue in the GitHub repository.

---

Built with ❤️ for families who want to stay organized and connected.
