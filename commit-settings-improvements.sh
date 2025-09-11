#!/bin/bash

# Commit settings system improvements
git add .
git commit -m "feat: Complete settings system with context provider

- Created SettingsContext with comprehensive provider
- Added convenience hooks for common settings (dark mode, notifications, language, household)
- Integrated SettingsProvider into app layout
- Created settings integration example component
- Provides type-safe settings management throughout application
- Supports both user and household settings with real-time updates"

echo "✅ Settings system improvements committed"
echo "🚀 Ready to push to staging"
