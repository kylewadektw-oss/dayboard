const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function initializeComprehensiveSettings() {
  console.log('🚀 Initializing Comprehensive Settings System...\n');

  try {
    // Enhanced Settings Categories
    const settingsCategories = [
      {
        category_key: 'member',
        display_name: 'Personal',
        description: 'Your personal preferences and account settings',
        icon: 'User',
        sort_order: 1,
        required_role: 'member'
      },
      {
        category_key: 'admin',
        display_name: 'Household',
        description: 'Household management and member permissions',
        icon: 'Home',
        sort_order: 2,
        required_role: 'admin'
      },
      {
        category_key: 'super_admin',
        display_name: 'System',
        description: 'System-wide controls and global settings',
        icon: 'Crown',
        sort_order: 3,
        required_role: 'super_admin'
      }
    ];

    // Enhanced Settings Items
    const settingsItems = [
      // Member Settings
      {
        category_key: 'member',
        setting_key: 'email_notifications',
        display_name: 'Email Notifications',
        description: 'Receive notifications via email',
        setting_type: 'boolean',
        default_value: true,
        required_role: 'member',
        sort_order: 1
      },
      {
        category_key: 'member',
        setting_key: 'push_notifications',
        display_name: 'Push Notifications',
        description: 'Receive push notifications on your device',
        setting_type: 'boolean',
        default_value: true,
        required_role: 'member',
        sort_order: 2
      },
      {
        category_key: 'member',
        setting_key: 'dark_mode',
        display_name: 'Dark Mode',
        description: 'Use dark theme interface',
        setting_type: 'boolean',
        default_value: false,
        required_role: 'member',
        sort_order: 3
      },
      {
        category_key: 'member',
        setting_key: 'language',
        display_name: 'Language',
        description: 'Your preferred language',
        setting_type: 'select',
        default_value: 'en',
        options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Español' },
          { value: 'fr', label: 'Français' },
          { value: 'de', label: 'Deutsch' }
        ],
        required_role: 'member',
        sort_order: 4
      },
      {
        category_key: 'member',
        setting_key: 'timezone',
        display_name: 'Timezone',
        description: 'Your preferred timezone',
        setting_type: 'select',
        default_value: 'UTC',
        options: [
          { value: 'UTC', label: 'UTC' },
          { value: 'America/New_York', label: 'Eastern Time' },
          { value: 'America/Chicago', label: 'Central Time' },
          { value: 'America/Denver', label: 'Mountain Time' },
          { value: 'America/Los_Angeles', label: 'Pacific Time' }
        ],
        required_role: 'member',
        sort_order: 5
      },
      {
        category_key: 'member',
        setting_key: 'date_format',
        display_name: 'Date Format',
        description: 'How dates are displayed',
        setting_type: 'select',
        default_value: 'MM/DD/YYYY',
        options: [
          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
        ],
        required_role: 'member',
        sort_order: 6
      },
      {
        category_key: 'member',
        setting_key: 'notification_frequency',
        display_name: 'Notification Frequency',
        description: 'How often to receive digest notifications',
        setting_type: 'select',
        default_value: 'daily',
        options: [
          { value: 'realtime', label: 'Real-time' },
          { value: 'hourly', label: 'Hourly' },
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'never', label: 'Never' }
        ],
        required_role: 'member',
        sort_order: 7
      },

      // Admin Settings
      {
        category_key: 'admin',
        setting_key: 'household_name',
        display_name: 'Household Name',
        description: 'Display name for your household',
        setting_type: 'string',
        default_value: '',
        required_role: 'admin',
        sort_order: 1
      },
      {
        category_key: 'admin',
        setting_key: 'household_description',
        display_name: 'Household Description',
        description: 'Brief description of your household',
        setting_type: 'text',
        default_value: '',
        required_role: 'admin',
        sort_order: 2
      },
      {
        category_key: 'admin',
        setting_key: 'invite_notifications',
        display_name: 'Invitation Notifications',
        description: 'Notify when new members join',
        setting_type: 'boolean',
        default_value: true,
        required_role: 'admin',
        sort_order: 3
      },
      {
        category_key: 'admin',
        setting_key: 'auto_assign_chores',
        display_name: 'Auto-assign Chores',
        description: 'Automatically distribute chores to members',
        setting_type: 'boolean',
        default_value: false,
        required_role: 'admin',
        sort_order: 4
      },
      {
        category_key: 'admin',
        setting_key: 'member_permissions',
        display_name: 'Default Member Permissions',
        description: 'Default permissions for new members',
        setting_type: 'multi_select',
        default_value: ['dashboard', 'meals', 'lists'],
        options: [
          { value: 'dashboard', label: 'Dashboard' },
          { value: 'meals', label: 'Meals' },
          { value: 'lists', label: 'Lists' },
          { value: 'work', label: 'Work' },
          { value: 'projects', label: 'Projects' }
        ],
        required_role: 'admin',
        sort_order: 5
      },
      {
        category_key: 'admin',
        setting_key: 'data_retention_days',
        display_name: 'Data Retention (Days)',
        description: 'How long to keep household data',
        setting_type: 'number',
        default_value: 365,
        required_role: 'admin',
        sort_order: 6
      },

      // Super Admin Settings
      {
        category_key: 'super_admin',
        setting_key: 'maintenance_mode',
        display_name: 'Maintenance Mode',
        description: 'Enable system maintenance mode',
        setting_type: 'boolean',
        default_value: false,
        required_role: 'super_admin',
        sort_order: 1
      },
      {
        category_key: 'super_admin',
        setting_key: 'registration_enabled',
        display_name: 'User Registration',
        description: 'Allow new user registrations',
        setting_type: 'boolean',
        default_value: true,
        required_role: 'super_admin',
        sort_order: 2
      },
      {
        category_key: 'super_admin',
        setting_key: 'max_households_per_user',
        display_name: 'Max Households per User',
        description: 'Maximum number of households a user can join',
        setting_type: 'number',
        default_value: 3,
        required_role: 'super_admin',
        sort_order: 3
      },
      {
        category_key: 'super_admin',
        setting_key: 'max_members_per_household',
        display_name: 'Max Members per Household',
        description: 'Maximum number of members in a household',
        setting_type: 'number',
        default_value: 10,
        required_role: 'super_admin',
        sort_order: 4
      },
      {
        category_key: 'super_admin',
        setting_key: 'session_timeout_minutes',
        display_name: 'Session Timeout (Minutes)',
        description: 'How long before users are logged out',
        setting_type: 'number',
        default_value: 480,
        required_role: 'super_admin',
        sort_order: 5
      },
      {
        category_key: 'super_admin',
        setting_key: 'logging_level',
        display_name: 'Logging Level',
        description: 'System logging verbosity',
        setting_type: 'select',
        default_value: 'info',
        options: [
          { value: 'error', label: 'Error Only' },
          { value: 'warn', label: 'Warnings & Errors' },
          { value: 'info', label: 'Info, Warnings & Errors' },
          { value: 'debug', label: 'Debug (All)' }
        ],
        required_role: 'super_admin',
        sort_order: 6
      },
      {
        category_key: 'super_admin',
        setting_key: 'backup_frequency',
        display_name: 'Backup Frequency',
        description: 'How often to backup system data',
        setting_type: 'select',
        default_value: 'daily',
        options: [
          { value: 'hourly', label: 'Every Hour' },
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' }
        ],
        required_role: 'super_admin',
        sort_order: 7
      }
    ];

    // Insert/Update Categories
    console.log('📝 Updating settings categories...');
    for (const category of settingsCategories) {
      const { error } = await supabase
        .from('settings_categories')
        .upsert(category, { onConflict: 'category_key' });

      if (error) {
        console.log(
          `❌ Error updating category ${category.category_key}:`,
          error.message
        );
      } else {
        console.log(`✅ Updated category: ${category.display_name}`);
      }
    }

    // Insert/Update Settings Items
    console.log('\n⚙️ Updating settings items...');
    for (const item of settingsItems) {
      const { error } = await supabase
        .from('settings_items')
        .upsert(item, { onConflict: 'category_key,setting_key' });

      if (error) {
        console.log(
          `❌ Error updating item ${item.setting_key}:`,
          error.message
        );
      } else {
        console.log(`✅ Updated setting: ${item.display_name}`);
      }
    }

    console.log('\n🎉 Settings system initialization complete!');
    console.log('\n📊 Summary:');
    console.log(`- ${settingsCategories.length} categories configured`);
    console.log(`- ${settingsItems.length} settings items configured`);
    console.log('- Member settings: Personal preferences');
    console.log('- Admin settings: Household management');
    console.log('- Super admin settings: System controls');
  } catch (error) {
    console.error('❌ Error initializing settings:', error.message);
  }
}

initializeComprehensiveSettings();
