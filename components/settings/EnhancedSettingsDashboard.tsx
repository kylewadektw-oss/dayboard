/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * Enhanced Settings Dashboard - All features organized by category
 */

'use client';

import React, { useState } from 'react';
import { useUserRole } from '@/hooks/useFeatureAccess';
import {
  ChevronDown,
  ChevronRight,
  Settings,
  Calendar,
  UtensilsCrossed,
  DollarSign,
  Briefcase,
  User,
  Bell,
  Shield,
  Palette,
  Crown,
  Users,
  Heart,
  Film,
  Save,
  Globe,
  Eye,
  Zap,
  Home,
  Clock,
  MapPin,
  Smartphone,
  Lock,
  Database,
  Loader2,
  CheckCircle,
  Sparkles,
  ClipboardList,
  Gamepad2,
  Calculator,
  PiggyBank,
  type LucideIcon
} from 'lucide-react';
import FeatureAccessMatrix from './FeatureAccessMatrix';

interface EnhancedSettingsDashboardProps {
  className?: string;
}

interface SettingsSection {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  subsections: SettingsSubsection[];
  color: string;
  requiredRole?: 'admin' | 'super_admin';
}

interface SettingsItem {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'button' | 'multi-select';
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  requiredRole?: 'admin' | 'super_admin';
  action?: () => void;
}

interface SettingsSubsection {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  settings?: SettingsItem[];
  isSpecial?: boolean;
  specialComponent?: string;
}

interface Setting {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'button' | 'multi-select';
  value?: unknown;
  options?: { value: string; label: string }[];
  action?: () => void;
  requiredRole?: 'admin' | 'super_admin';
}

const EnhancedSettingsDashboard: React.FC<EnhancedSettingsDashboardProps> = ({
  className = ''
}) => {
  const { isAdmin, isSuperAdmin } = useUserRole();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'dashboard'
  ]);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, unknown>>({
    // Dashboard settings
    'dashboard.widgets.meals': true,
    'dashboard.widgets.calendar': true,
    'dashboard.widgets.weather': true,
    'dashboard.widgets.lists': true,
    'dashboard.widgets.entertainment': true,
    'dashboard.widgets.financial': isAdmin,
    'dashboard.widgets.work': true,
    'dashboard.theme': 'purple-pink',
    'dashboard.layout': 'default',
    'dashboard.auto_refresh': true,
    'dashboard.widget_animations': true,

    // Calendar settings
    'calendar.default_view': 'month',
    'calendar.week_start': 'sunday',
    'calendar.time_format': '12h',
    'calendar.notifications': true,
    'calendar.google_sync': false,
    'calendar.apple_sync': false,
    'calendar.event_reminders': ['15min', '1day'],
    'calendar.all_day_events': true,
    'calendar.recurring_events': true,

    // Meals settings
    'meals.favorites_enabled': true,
    'meals.weekly_planning': true,
    'meals.recipe_library': true,
    'meals.cocktails': true,
    'meals.quick_meals': true,
    'meals.grocery_builder': true,
    'meals.dietary_filters': ['family-friendly'],
    'meals.auto_grocery_lists': true,
    'meals.meal_notifications': true,
    'meals.nutrition_tracking': false,
    'meals.enhanced_mode': false,
    'meals.smart_suggestions': true,

    // Lists settings
    'lists.todo_lists': true,
    'lists.shopping_lists': true,
    'lists.project_management': true,
    'lists.sharing_enabled': true,
    'lists.real_time_collaboration': true,
    'lists.completion_notifications': true,
    'lists.due_date_reminders': true,
    'lists.priority_levels': true,
    'lists.categories': true,
    'lists.templates': true,

    // Entertainment settings
    'entertainment.local_events': true,
    'entertainment.movie_showtimes': true,
    'entertainment.family_polling': true,
    'entertainment.calendar_integration': true,
    'entertainment.location_services': false,
    'entertainment.notification_radius': '25',
    'entertainment.activity_suggestions': true,
    'entertainment.weather_based_activities': true,

    // Financial settings (admin only)
    'financial.budget_tracking': isAdmin,
    'financial.bill_reminders': isAdmin,
    'financial.allowance_tracking': isAdmin,
    'financial.savings_goals': isAdmin,
    'financial.spending_analytics': isAdmin,
    'financial.bank_sync': false,
    'financial.expense_categories': isAdmin,
    'financial.monthly_reports': isAdmin,

    // Work settings
    'work.schedule_integration': true,
    'work.time_tracking': true,
    'work.project_management': true,
    'work.work_life_balance': true,
    'work.break_reminders': true,
    'work.focus_mode': false,
    'work.meeting_integration': true,
    'work.productivity_analytics': true,

    // Profile settings
    'profile.display_name': '',
    'profile.preferred_timezone': 'America/New_York',
    'profile.language': 'en',
    'profile.avatar_public': true,
    'profile.activity_sharing': true,
    'profile.status_updates': true,
    'profile.birthday_reminders': true,

    // Notifications
    'notifications.email_enabled': true,
    'notifications.push_enabled': true,
    'notifications.sms_enabled': false,
    'notifications.daily_digest': true,
    'notifications.weekly_summary': true,
    'notifications.emergency_only': false,
    'notifications.quiet_hours': false,
    'notifications.smart_grouping': true,

    // Privacy & Security
    'privacy.profile_visibility': 'household',
    'privacy.activity_tracking': true,
    'privacy.data_export_enabled': true,
    'privacy.two_factor_auth': false,
    'privacy.session_timeout': '24h',
    'privacy.location_sharing': false,
    'privacy.usage_analytics': true,

    // Display & Accessibility
    'display.theme': 'light',
    'display.color_scheme': 'purple-pink',
    'display.font_size': 'medium',
    'display.high_contrast': false,
    'display.reduced_motion': false,
    'display.hide_disabled_features': false,
    'display.developer_mode': false,
    'display.compact_mode': false,
    'display.animations': true
  });

  const settingsSections: SettingsSection[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Home,
      description:
        'Configure your main dashboard layout, widgets, and appearance',
      color: 'blue',
      subsections: [
        {
          id: 'widgets',
          title: 'Dashboard Widgets',
          icon: Sparkles,
          description: 'Choose which widgets appear on your dashboard',
          settings: [
            {
              id: 'dashboard.widgets.meals',
              label: 'Meals Widget',
              description: "Show meal planning and today's menu",
              type: 'toggle'
            },
            {
              id: 'dashboard.widgets.calendar',
              label: 'Calendar Widget',
              description: 'Show upcoming events and schedule',
              type: 'toggle'
            },
            {
              id: 'dashboard.widgets.weather',
              label: 'Weather Widget',
              description: 'Display current weather and forecast',
              type: 'toggle'
            },
            {
              id: 'dashboard.widgets.lists',
              label: 'Lists Widget',
              description: 'Show active todo and shopping lists',
              type: 'toggle'
            },
            {
              id: 'dashboard.widgets.entertainment',
              label: 'Entertainment Widget',
              description: 'Display local events and activities',
              type: 'toggle'
            },
            {
              id: 'dashboard.widgets.financial',
              label: 'Financial Widget',
              description: 'Show budget and spending overview',
              type: 'toggle',
              requiredRole: 'admin'
            },
            {
              id: 'dashboard.widgets.work',
              label: 'Work Widget',
              description: 'Display work schedule and tasks',
              type: 'toggle'
            }
          ]
        },
        {
          id: 'appearance',
          title: 'Dashboard Appearance',
          icon: Palette,
          description: 'Customize the look and feel of your dashboard',
          settings: [
            {
              id: 'dashboard.theme',
              label: 'Color Theme',
              description: 'Choose your preferred color scheme',
              type: 'select',
              options: [
                { value: 'purple-pink', label: 'Purple Pink (Default)' },
                { value: 'blue-teal', label: 'Blue Teal' },
                { value: 'green-emerald', label: 'Green Emerald' },
                { value: 'orange-amber', label: 'Orange Amber' }
              ]
            },
            {
              id: 'dashboard.layout',
              label: 'Layout Style',
              description: 'Choose how widgets are arranged',
              type: 'select',
              options: [
                { value: 'default', label: 'Default Grid' },
                { value: 'compact', label: 'Compact View' },
                { value: 'spacious', label: 'Spacious Layout' }
              ]
            },
            {
              id: 'dashboard.auto_refresh',
              label: 'Auto Refresh',
              description: 'Automatically refresh dashboard data',
              type: 'toggle'
            },
            {
              id: 'dashboard.widget_animations',
              label: 'Widget Animations',
              description: 'Enable smooth animations for widgets',
              type: 'toggle'
            }
          ]
        }
      ]
    },
    {
      id: 'calendar',
      title: 'Calendar',
      icon: Calendar,
      description: 'Manage calendar settings, views, and integrations',
      color: 'indigo',
      subsections: [
        {
          id: 'view_settings',
          title: 'Calendar Views & Display',
          icon: Eye,
          description: 'Configure how your calendar is displayed',
          settings: [
            {
              id: 'calendar.default_view',
              label: 'Default View',
              description: 'Set your preferred calendar view',
              type: 'select',
              options: [
                { value: 'month', label: 'Month View' },
                { value: 'week', label: 'Week View' },
                { value: 'day', label: 'Day View' },
                { value: 'agenda', label: 'Agenda View' }
              ]
            },
            {
              id: 'calendar.week_start',
              label: 'Week Starts On',
              description: 'Choose the first day of the week',
              type: 'select',
              options: [
                { value: 'sunday', label: 'Sunday' },
                { value: 'monday', label: 'Monday' }
              ]
            },
            {
              id: 'calendar.time_format',
              label: 'Time Format',
              description: 'Choose 12-hour or 24-hour time format',
              type: 'select',
              options: [
                { value: '12h', label: '12-hour (AM/PM)' },
                { value: '24h', label: '24-hour' }
              ]
            },
            {
              id: 'calendar.all_day_events',
              label: 'All-Day Events',
              description: 'Show all-day events at the top of day views',
              type: 'toggle'
            }
          ]
        },
        {
          id: 'integrations',
          title: 'Calendar Integrations & Features',
          icon: Globe,
          description: 'Connect external calendar services and enable features',
          settings: [
            {
              id: 'calendar.google_sync',
              label: 'Google Calendar Sync',
              description: 'Sync events with Google Calendar',
              type: 'toggle'
            },
            {
              id: 'calendar.apple_sync',
              label: 'Apple Calendar Sync',
              description: 'Sync events with Apple Calendar',
              type: 'toggle'
            },
            {
              id: 'calendar.notifications',
              label: 'Event Notifications',
              description: 'Receive notifications for upcoming events',
              type: 'toggle'
            },
            {
              id: 'calendar.event_reminders',
              label: 'Default Reminders',
              description: 'Set default reminder times for new events',
              type: 'multi-select',
              options: [
                { value: '5min', label: '5 minutes before' },
                { value: '15min', label: '15 minutes before' },
                { value: '30min', label: '30 minutes before' },
                { value: '1hour', label: '1 hour before' },
                { value: '1day', label: '1 day before' }
              ]
            },
            {
              id: 'calendar.recurring_events',
              label: 'Recurring Events',
              description: 'Enable creation of recurring events',
              type: 'toggle'
            }
          ]
        }
      ]
    },
    {
      id: 'meals',
      title: 'Meals & Recipe Management',
      icon: UtensilsCrossed,
      description: 'Configure meal planning, recipes, and grocery features',
      color: 'green',
      subsections: [
        {
          id: 'meal_features',
          title: 'Meal Planning Features',
          icon: Calendar,
          description: 'Enable or disable meal planning features',
          settings: [
            {
              id: 'meals.favorites_enabled',
              label: 'Favorites Tab',
              description: 'Save and manage favorite recipes',
              type: 'toggle'
            },
            {
              id: 'meals.weekly_planning',
              label: 'Weekly Meal Planning',
              description: 'Plan meals for the entire week',
              type: 'toggle'
            },
            {
              id: 'meals.recipe_library',
              label: 'Recipe Library',
              description: 'Access full recipe database',
              type: 'toggle'
            },
            {
              id: 'meals.cocktails',
              label: 'Cocktails Section',
              description: 'Manage cocktail recipes',
              type: 'toggle'
            },
            {
              id: 'meals.quick_meals',
              label: 'Quick Meals (≤20 min)',
              description: 'Fast meal options',
              type: 'toggle'
            },
            {
              id: 'meals.grocery_builder',
              label: 'Grocery List Builder',
              description: 'Auto-generate grocery lists from meal plans',
              type: 'toggle'
            },
            {
              id: 'meals.enhanced_mode',
              label: 'Enhanced Mode',
              description: 'Enable AI-powered meal suggestions and insights',
              type: 'toggle'
            }
          ]
        },
        {
          id: 'meal_preferences',
          title: 'Meal Preferences & Smart Features',
          icon: Heart,
          description: 'Set dietary preferences and enable smart features',
          settings: [
            {
              id: 'meals.dietary_filters',
              label: 'Dietary Filters',
              description: 'Filter recipes based on dietary needs',
              type: 'multi-select',
              options: [
                { value: 'vegetarian', label: 'Vegetarian' },
                { value: 'vegan', label: 'Vegan' },
                { value: 'keto', label: 'Keto' },
                { value: 'paleo', label: 'Paleo' },
                { value: 'gluten-free', label: 'Gluten-Free' },
                { value: 'family-friendly', label: 'Family-Friendly' },
                { value: 'quick-easy', label: 'Quick & Easy' },
                { value: 'low-carb', label: 'Low-Carb' },
                { value: 'high-protein', label: 'High-Protein' }
              ]
            },
            {
              id: 'meals.auto_grocery_lists',
              label: 'Auto Grocery Lists',
              description: 'Automatically create grocery lists from meal plans',
              type: 'toggle'
            },
            {
              id: 'meals.meal_notifications',
              label: 'Meal Reminders',
              description: 'Get reminders for meal planning and prep',
              type: 'toggle'
            },
            {
              id: 'meals.nutrition_tracking',
              label: 'Nutrition Tracking',
              description: 'Track nutritional information for meals',
              type: 'toggle'
            },
            {
              id: 'meals.smart_suggestions',
              label: 'Smart Suggestions',
              description: 'Get AI-powered meal recommendations',
              type: 'toggle'
            }
          ]
        }
      ]
    },
    {
      id: 'lists',
      title: 'Lists & Task Management',
      icon: ClipboardList,
      description: 'Manage todo lists, shopping lists, and projects',
      color: 'purple',
      subsections: [
        {
          id: 'list_types',
          title: 'List Types & Features',
          icon: CheckCircle,
          description: 'Enable different types of lists and features',
          settings: [
            {
              id: 'lists.todo_lists',
              label: 'Todo Lists',
              description: 'Create and manage todo lists',
              type: 'toggle'
            },
            {
              id: 'lists.shopping_lists',
              label: 'Shopping Lists',
              description: 'Create grocery and shopping lists',
              type: 'toggle'
            },
            {
              id: 'lists.project_management',
              label: 'Project Lists',
              description: 'Manage home improvement and work projects',
              type: 'toggle'
            },
            {
              id: 'lists.priority_levels',
              label: 'Priority Levels',
              description:
                'Set priority levels for list items (High, Medium, Low)',
              type: 'toggle'
            },
            {
              id: 'lists.categories',
              label: 'List Categories',
              description: 'Organize lists into categories',
              type: 'toggle'
            },
            {
              id: 'lists.templates',
              label: 'List Templates',
              description: 'Create and use reusable list templates',
              type: 'toggle'
            }
          ]
        },
        {
          id: 'collaboration',
          title: 'List Sharing & Collaboration',
          icon: Users,
          description: 'Configure how lists are shared with household members',
          settings: [
            {
              id: 'lists.sharing_enabled',
              label: 'List Sharing',
              description: 'Share lists with other household members',
              type: 'toggle'
            },
            {
              id: 'lists.real_time_collaboration',
              label: 'Real-time Collaboration',
              description: 'Allow simultaneous editing of shared lists',
              type: 'toggle'
            },
            {
              id: 'lists.completion_notifications',
              label: 'Completion Notifications',
              description: 'Notify when list items are completed',
              type: 'toggle'
            },
            {
              id: 'lists.due_date_reminders',
              label: 'Due Date Reminders',
              description: 'Send reminders for items with due dates',
              type: 'toggle'
            }
          ]
        }
      ]
    },
    {
      id: 'entertainment',
      title: 'Entertainment & Activities',
      icon: Gamepad2,
      description: 'Configure entertainment and local events features',
      color: 'pink',
      subsections: [
        {
          id: 'entertainment_features',
          title: 'Entertainment Discovery',
          icon: Film,
          description: 'Enable entertainment discovery features',
          settings: [
            {
              id: 'entertainment.local_events',
              label: 'Local Events',
              description: 'Discover community events and festivals',
              type: 'toggle'
            },
            {
              id: 'entertainment.movie_showtimes',
              label: 'Movie Showtimes',
              description: 'Get local theater showtimes',
              type: 'toggle'
            },
            {
              id: 'entertainment.family_polling',
              label: 'Family Decision Polling',
              description: 'Vote on family activities together',
              type: 'toggle'
            },
            {
              id: 'entertainment.calendar_integration',
              label: 'Calendar Integration',
              description: 'Add entertainment events to calendar',
              type: 'toggle'
            },
            {
              id: 'entertainment.activity_suggestions',
              label: 'Activity Suggestions',
              description: 'Get personalized activity recommendations',
              type: 'toggle'
            },
            {
              id: 'entertainment.weather_based_activities',
              label: 'Weather-Based Activities',
              description: 'Suggest activities based on weather conditions',
              type: 'toggle'
            }
          ]
        },
        {
          id: 'location_services',
          title: 'Location & Preferences',
          icon: MapPin,
          description: 'Configure location-based entertainment options',
          settings: [
            {
              id: 'entertainment.location_services',
              label: 'Location Services',
              description: 'Use your location to find nearby events',
              type: 'toggle'
            },
            {
              id: 'entertainment.notification_radius',
              label: 'Event Notification Radius',
              description: 'Distance for event notifications (miles)',
              type: 'select',
              options: [
                { value: '5', label: '5 miles' },
                { value: '10', label: '10 miles' },
                { value: '25', label: '25 miles' },
                { value: '50', label: '50 miles' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'financial',
      title: 'Financial Management',
      icon: DollarSign,
      description: 'Budget tracking, bills, and financial planning',
      color: 'emerald',
      requiredRole: 'admin',
      subsections: [
        {
          id: 'budget_features',
          title: 'Budget & Expense Tracking',
          icon: Calculator,
          description: 'Configure budget tracking and expense management',
          settings: [
            {
              id: 'financial.budget_tracking',
              label: 'Monthly Budget Tracking',
              description: 'Track household expenses and income',
              type: 'toggle'
            },
            {
              id: 'financial.bill_reminders',
              label: 'Bill Reminders',
              description: 'Get reminders for upcoming bills',
              type: 'toggle'
            },
            {
              id: 'financial.spending_analytics',
              label: 'Spending Analytics',
              description: 'Analyze spending patterns and trends',
              type: 'toggle'
            },
            {
              id: 'financial.expense_categories',
              label: 'Expense Categories',
              description: 'Categorize expenses for better tracking',
              type: 'toggle'
            },
            {
              id: 'financial.monthly_reports',
              label: 'Monthly Reports',
              description: 'Generate monthly financial reports',
              type: 'toggle'
            }
          ]
        },
        {
          id: 'family_finance',
          title: 'Family Financial Features',
          icon: PiggyBank,
          description: 'Manage allowances and family financial goals',
          settings: [
            {
              id: 'financial.allowance_tracking',
              label: 'Kids Allowance Tracking',
              description: "Track children's allowances and chore payments",
              type: 'toggle'
            },
            {
              id: 'financial.savings_goals',
              label: 'Savings Goals',
              description: 'Set and track family savings goals',
              type: 'toggle'
            },
            {
              id: 'financial.bank_sync',
              label: 'Bank Account Sync',
              description:
                'Connect bank accounts for automatic transaction import',
              type: 'toggle'
            }
          ]
        }
      ]
    },
    {
      id: 'work',
      title: 'Work & Productivity',
      icon: Briefcase,
      description: 'Work schedule, productivity, and work-life balance',
      color: 'slate',
      subsections: [
        {
          id: 'work_features',
          title: 'Work Management',
          icon: Clock,
          description: 'Configure work-related features and integrations',
          settings: [
            {
              id: 'work.schedule_integration',
              label: 'Schedule Integration',
              description: 'Sync work schedule with calendar',
              type: 'toggle'
            },
            {
              id: 'work.time_tracking',
              label: 'Time Tracking',
              description: 'Track time spent on work projects',
              type: 'toggle'
            },
            {
              id: 'work.project_management',
              label: 'Work Project Management',
              description: 'Manage work projects and tasks',
              type: 'toggle'
            },
            {
              id: 'work.meeting_integration',
              label: 'Meeting Integration',
              description: 'Integrate with meeting platforms (Zoom, Teams)',
              type: 'toggle'
            },
            {
              id: 'work.productivity_analytics',
              label: 'Productivity Analytics',
              description: 'Track productivity metrics and insights',
              type: 'toggle'
            }
          ]
        },
        {
          id: 'work_life_balance',
          title: 'Work-Life Balance',
          icon: Heart,
          description: 'Features to maintain healthy work-life balance',
          settings: [
            {
              id: 'work.work_life_balance',
              label: 'Work-Life Balance Analytics',
              description: 'Track work hours vs personal time',
              type: 'toggle'
            },
            {
              id: 'work.break_reminders',
              label: 'Break Reminders',
              description: 'Get reminded to take breaks during work',
              type: 'toggle'
            },
            {
              id: 'work.focus_mode',
              label: 'Focus Mode',
              description: 'Minimize distractions during work hours',
              type: 'toggle'
            }
          ]
        }
      ]
    },
    {
      id: 'profile',
      title: 'Profile & Personal Settings',
      icon: User,
      description: 'Personal information, preferences, and privacy settings',
      color: 'orange',
      subsections: [
        {
          id: 'personal_info',
          title: 'Personal Information',
          icon: User,
          description: 'Manage your personal profile information',
          settings: [
            {
              id: 'profile.display_name',
              label: 'Display Name',
              description: 'Your name as shown to other household members',
              type: 'input'
            },
            {
              id: 'profile.preferred_timezone',
              label: 'Timezone',
              description: 'Your local timezone',
              type: 'select',
              options: [
                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                { value: 'America/Chicago', label: 'Central Time (CT)' },
                { value: 'America/Denver', label: 'Mountain Time (MT)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' }
              ]
            },
            {
              id: 'profile.language',
              label: 'Language',
              description: 'Preferred language for the interface',
              type: 'select',
              options: [
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Español' },
                { value: 'fr', label: 'Français' }
              ]
            },
            {
              id: 'profile.birthday_reminders',
              label: 'Birthday Reminders',
              description: 'Receive reminders for household member birthdays',
              type: 'toggle'
            }
          ]
        },
        {
          id: 'privacy_settings',
          title: 'Privacy & Sharing',
          icon: Lock,
          description: 'Control your privacy and data sharing preferences',
          settings: [
            {
              id: 'profile.avatar_public',
              label: 'Public Avatar',
              description: 'Show your profile picture to household members',
              type: 'toggle'
            },
            {
              id: 'profile.activity_sharing',
              label: 'Activity Sharing',
              description: 'Share your activity status with household members',
              type: 'toggle'
            },
            {
              id: 'profile.status_updates',
              label: 'Status Updates',
              description: 'Allow others to see your online/offline status',
              type: 'toggle'
            },
            {
              id: 'privacy.profile_visibility',
              label: 'Profile Visibility',
              description: 'Who can see your profile information',
              type: 'select',
              options: [
                { value: 'household', label: 'Household Members Only' },
                { value: 'admins', label: 'Admins Only' },
                { value: 'private', label: 'Private' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Notifications & Alerts',
      icon: Bell,
      description: 'Configure how and when you receive notifications',
      color: 'red',
      subsections: [
        {
          id: 'notification_types',
          title: 'Notification Methods',
          icon: Smartphone,
          description: 'Choose how you want to receive notifications',
          settings: [
            {
              id: 'notifications.email_enabled',
              label: 'Email Notifications',
              description: 'Receive notifications via email',
              type: 'toggle'
            },
            {
              id: 'notifications.push_enabled',
              label: 'Push Notifications',
              description: 'Receive browser push notifications',
              type: 'toggle'
            },
            {
              id: 'notifications.sms_enabled',
              label: 'SMS Notifications',
              description: 'Receive notifications via text message',
              type: 'toggle'
            },
            {
              id: 'notifications.smart_grouping',
              label: 'Smart Grouping',
              description: 'Group related notifications together',
              type: 'toggle'
            }
          ]
        },
        {
          id: 'notification_frequency',
          title: 'Notification Frequency & Timing',
          icon: Clock,
          description: 'Control how often and when you receive notifications',
          settings: [
            {
              id: 'notifications.daily_digest',
              label: 'Daily Digest',
              description: 'Receive a daily summary of household activity',
              type: 'toggle'
            },
            {
              id: 'notifications.weekly_summary',
              label: 'Weekly Summary',
              description:
                'Get a weekly overview of completed tasks and activities',
              type: 'toggle'
            },
            {
              id: 'notifications.emergency_only',
              label: 'Emergency Only',
              description: 'Only receive notifications for urgent items',
              type: 'toggle'
            },
            {
              id: 'notifications.quiet_hours',
              label: 'Quiet Hours',
              description: 'Disable notifications during specified hours',
              type: 'toggle'
            }
          ]
        }
      ]
    },
    {
      id: 'role_access_management',
      title: 'Role & Access Management',
      icon: Crown,
      description:
        'Control feature access for different user roles in your household',
      color: 'purple',
      requiredRole: 'super_admin',
      subsections: [
        {
          id: 'feature_access_matrix',
          title: 'Feature Access Control',
          icon: Shield,
          description:
            'Configure which features are available to Super Admins, Admins, and Members',
          isSpecial: true,
          specialComponent: 'FeatureAccessMatrix'
        }
      ]
    },
    {
      id: 'privacy_security',
      title: 'Privacy & Security',
      icon: Shield,
      description: 'Manage your privacy and security settings',
      color: 'red',
      subsections: [
        {
          id: 'security_features',
          title: 'Security Features',
          icon: Lock,
          description: 'Configure account security options',
          settings: [
            {
              id: 'privacy.two_factor_auth',
              label: 'Two-Factor Authentication',
              description: 'Add an extra layer of security to your account',
              type: 'toggle'
            },
            {
              id: 'privacy.session_timeout',
              label: 'Session Timeout',
              description: 'Automatically sign out after inactivity',
              type: 'select',
              options: [
                { value: '1h', label: '1 hour' },
                { value: '4h', label: '4 hours' },
                { value: '24h', label: '24 hours' },
                { value: 'never', label: 'Never' }
              ]
            }
          ]
        },
        {
          id: 'data_privacy',
          title: 'Data & Privacy',
          icon: Database,
          description: 'Control your data and privacy preferences',
          settings: [
            {
              id: 'privacy.activity_tracking',
              label: 'Activity Tracking',
              description: 'Allow the app to track your usage for improvements',
              type: 'toggle'
            },
            {
              id: 'privacy.data_export_enabled',
              label: 'Data Export',
              description: 'Enable ability to export your personal data',
              type: 'toggle'
            },
            {
              id: 'privacy.location_sharing',
              label: 'Location Sharing',
              description: 'Share your location with household members',
              type: 'toggle'
            },
            {
              id: 'privacy.usage_analytics',
              label: 'Usage Analytics',
              description:
                'Help improve the app by sharing anonymous usage data',
              type: 'toggle'
            }
          ]
        }
      ]
    },
    {
      id: 'display_accessibility',
      title: 'Display & Accessibility',
      icon: Eye,
      description: 'Customize app appearance and accessibility features',
      color: 'violet',
      subsections: [
        {
          id: 'theme_appearance',
          title: 'Theme & Appearance',
          icon: Palette,
          description: 'Customize how the app looks and feels',
          settings: [
            {
              id: 'display.theme',
              label: 'App Theme',
              description: 'Choose between light, dark, or system theme',
              type: 'select',
              options: [
                { value: 'light', label: 'Light Theme' },
                { value: 'dark', label: 'Dark Theme' },
                { value: 'auto', label: 'Auto (System)' }
              ]
            },
            {
              id: 'display.color_scheme',
              label: 'Color Scheme',
              description: 'Choose your preferred color palette',
              type: 'select',
              options: [
                { value: 'purple-pink', label: 'Purple Pink (Default)' },
                { value: 'blue-teal', label: 'Blue Teal' },
                { value: 'green-emerald', label: 'Green Emerald' },
                { value: 'orange-amber', label: 'Orange Amber' }
              ]
            },
            {
              id: 'display.font_size',
              label: 'Font Size',
              description: 'Adjust text size for better readability',
              type: 'select',
              options: [
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
                { value: 'extra-large', label: 'Extra Large' }
              ]
            },
            {
              id: 'display.compact_mode',
              label: 'Compact Mode',
              description: 'Use a more condensed layout to show more content',
              type: 'toggle'
            },
            {
              id: 'display.animations',
              label: 'Animations',
              description: 'Enable smooth animations throughout the app',
              type: 'toggle'
            }
          ]
        },
        {
          id: 'accessibility_features',
          title: 'Accessibility Features',
          icon: Eye,
          description: 'Features to improve accessibility and usability',
          settings: [
            {
              id: 'display.high_contrast',
              label: 'High Contrast Mode',
              description: 'Increase contrast for better visibility',
              type: 'toggle'
            },
            {
              id: 'display.reduced_motion',
              label: 'Reduced Motion',
              description: 'Minimize animations and transitions',
              type: 'toggle'
            },
            {
              id: 'display.hide_disabled_features',
              label: 'Hide Disabled Features',
              description: 'Hide features that are not available to your role',
              type: 'toggle'
            }
          ]
        },
        {
          id: 'developer_options',
          title: 'Developer Options',
          icon: Zap,
          description: 'Advanced options for development and testing',
          settings: [
            {
              id: 'display.developer_mode',
              label: 'Developer Mode',
              description: 'Show features currently in development',
              type: 'toggle'
            }
          ]
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const updateSetting = (settingId: string, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [settingId]: value
    }));
  };

  const saveAllSettings = async () => {
    setSaving(true);
    // Simulate saving delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    // In a real app, this would make API calls to save the settings
    console.log('Settings saved:', settings);
  };

  const renderSetting = (setting: Setting) => {
    // Check role requirements
    if (setting.requiredRole && !hasRequiredRole(setting.requiredRole)) {
      return null;
    }

    const value = settings[setting.id];

    return (
      <div
        key={setting.id}
        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-900">
              {setting.label}
            </label>
            {setting.requiredRole && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {setting.requiredRole === 'super_admin'
                  ? 'Super Admin'
                  : 'Admin'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
        </div>

        <div className="ml-4 flex-shrink-0">
          {setting.type === 'toggle' && (
            <button
              onClick={() => updateSetting(setting.id, !value)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                value ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
          )}

          {setting.type === 'select' && setting.options && (
            <select
              value={String(value || '')}
              onChange={(e) => updateSetting(setting.id, e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {setting.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {setting.type === 'multi-select' && setting.options && (
            <div className="relative">
              <select
                multiple
                value={Array.isArray(value) ? value : []}
                onChange={(e) => {
                  const selectedValues = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value
                  );
                  updateSetting(setting.id, selectedValues);
                }}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                size={Math.min(setting.options.length, 4)}
              >
                {setting.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {setting.type === 'input' && (
            <input
              type="text"
              value={String(value || '')}
              onChange={(e) => updateSetting(setting.id, e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={setting.description}
            />
          )}

          {setting.type === 'button' && (
            <button
              onClick={setting.action}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {setting.label}
            </button>
          )}
        </div>
      </div>
    );
  };

  const hasRequiredRole = (requiredRole: 'admin' | 'super_admin') => {
    if (requiredRole === 'admin') return isAdmin || isSuperAdmin;
    if (requiredRole === 'super_admin') return isSuperAdmin;
    return true;
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<
      string,
      { bg: string; text: string; border: string; icon: string }
    > = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-900',
        border: 'border-blue-200',
        icon: 'text-blue-600'
      },
      indigo: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-900',
        border: 'border-indigo-200',
        icon: 'text-indigo-600'
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-900',
        border: 'border-green-200',
        icon: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-900',
        border: 'border-purple-200',
        icon: 'text-purple-600'
      },
      pink: {
        bg: 'bg-pink-50',
        text: 'text-pink-900',
        border: 'border-pink-200',
        icon: 'text-pink-600'
      },
      emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-900',
        border: 'border-emerald-200',
        icon: 'text-emerald-600'
      },
      slate: {
        bg: 'bg-slate-50',
        text: 'text-slate-900',
        border: 'border-slate-200',
        icon: 'text-slate-600'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-900',
        border: 'border-orange-200',
        icon: 'text-orange-600'
      },
      red: {
        bg: 'bg-red-50',
        text: 'text-red-900',
        border: 'border-red-200',
        icon: 'text-red-600'
      },
      violet: {
        bg: 'bg-violet-50',
        text: 'text-violet-900',
        border: 'border-violet-200',
        icon: 'text-violet-600'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Enhanced Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Configure all features and preferences for your complete
                Dayboard experience
              </p>
            </div>
          </div>
          <button
            onClick={saveAllSettings}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        {settingsSections.map((section) => {
          // Check if section requires admin role
          if (section.requiredRole && !hasRequiredRole(section.requiredRole)) {
            return null;
          }

          const isExpanded = expandedSections.includes(section.id);
          const colors = getColorClasses(section.color);
          const SectionIcon = section.icon;

          return (
            <div
              key={section.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={`w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${colors.bg} border-b ${colors.border}`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg bg-white border ${colors.border}`}
                  >
                    <SectionIcon className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                  <div className="text-left">
                    <h2 className={`text-lg font-semibold ${colors.text}`}>
                      {section.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {section.description}
                    </p>
                  </div>
                  {section.requiredRole && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      {section.requiredRole === 'super_admin'
                        ? 'Super Admin'
                        : 'Admin Only'}
                    </span>
                  )}
                </div>

                {isExpanded ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {/* Section Content */}
              {isExpanded && (
                <div className="p-6 space-y-6">
                  {section.subsections.map((subsection) => {
                    const SubsectionIcon = subsection.icon;

                    return (
                      <div
                        key={subsection.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center space-x-3 mb-4">
                          <SubsectionIcon className="h-5 w-5 text-gray-600" />
                          <div>
                            <h3 className="text-md font-medium text-gray-900">
                              {subsection.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {subsection.description}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {subsection.isSpecial &&
                          subsection.specialComponent ===
                            'FeatureAccessMatrix' ? (
                            <div className="mt-6">
                              <FeatureAccessMatrix mode="super_admin" />
                            </div>
                          ) : (
                            subsection.settings?.map((setting) =>
                              renderSetting(setting)
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>
            Settings are saved automatically when changed. Use &quot;Save
            All&quot; to persist all changes at once.
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSettingsDashboard;
