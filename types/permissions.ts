// Permissions system for Dayboard
export type PermissionKey = 
  // Household Management
  | 'household_management'
  | 'invite_members'
  | 'remove_members'
  | 'edit_household_settings'
  | 'manage_household_roles'
  | 'view_household_analytics'
  
  // Calendar & Scheduling
  | 'calendar_view'
  | 'calendar_edit'
  | 'schedule_events'
  | 'manage_recurring_events'
  | 'view_family_calendar'
  | 'sync_external_calendars'
  
  // Tasks & Chores
  | 'create_tasks'
  | 'assign_tasks'
  | 'mark_tasks_complete'
  | 'view_task_history'
  | 'manage_chore_rotation'
  | 'set_task_rewards'
  
  // Meal Planning
  | 'meal_planning'
  | 'grocery_list_management'
  | 'recipe_management'
  | 'dietary_restrictions_view'
  | 'cooking_schedule'
  | 'meal_prep_planning'
  
  // Finance & Budgeting
  | 'expense_tracking'
  | 'budget_management'
  | 'bill_reminders'
  | 'shared_account_access'
  | 'financial_reports'
  | 'allowance_management'
  
  // Children & Education
  | 'school_schedule_access'
  | 'homework_tracking'
  | 'extracurricular_management'
  | 'screen_time_controls'
  | 'bedtime_enforcement'
  | 'chore_assignment_kids'
  
  // Health & Wellness
  | 'medical_appointment_scheduling'
  | 'medication_reminders'
  | 'health_record_access'
  | 'fitness_goal_tracking'
  | 'mental_health_check_ins'
  | 'emergency_contact_management'
  
  // Home Management
  | 'maintenance_scheduling'
  | 'utility_management'
  | 'inventory_tracking'
  | 'cleaning_schedule'
  | 'guest_access_control'
  | 'security_system_access'
  
  // Communication
  | 'family_messaging'
  | 'announcement_posting'
  | 'photo_sharing'
  | 'video_calling'
  | 'emergency_alerts'
  | 'school_communication'
  
  // Entertainment & Travel
  | 'activity_planning'
  | 'vacation_planning'
  | 'movie_night_scheduling'
  | 'game_time_management'
  | 'social_event_coordination'
  | 'birthday_party_planning'
  
  // Privacy & Security
  | 'location_sharing'
  | 'data_export'
  | 'privacy_settings'
  | 'notification_management'
  | 'device_management'
  | 'parental_controls'

export interface PermissionMeta { 
  key: PermissionKey; 
  description: string; 
  group: string; 
  title: string; 
}

export const PERMISSION_GROUPS = [
  'Household Management',
  'Calendar & Scheduling', 
  'Tasks & Chores',
  'Meal Planning',
  'Finance & Budgeting',
  'Children & Education',
  'Health & Wellness',
  'Home Management',
  'Communication',
  'Entertainment & Travel',
  'Privacy & Security'
];

export const PERMISSION_METADATA: PermissionMeta[] = [
  // Household Management
  { key: 'household_management', description: 'Manage overall household settings and configurations', group: 'Household Management', title: 'Household Management' },
  { key: 'invite_members', description: 'Send invitations to new household members', group: 'Household Management', title: 'Invite Members' },
  { key: 'remove_members', description: 'Remove members from the household', group: 'Household Management', title: 'Remove Members' },
  { key: 'edit_household_settings', description: 'Modify household name, type, and basic settings', group: 'Household Management', title: 'Edit Settings' },
  { key: 'manage_household_roles', description: 'Assign and modify member roles and permissions', group: 'Household Management', title: 'Manage Roles' },
  { key: 'view_household_analytics', description: 'Access household activity and usage analytics', group: 'Household Management', title: 'View Analytics' },
  
  // Calendar & Scheduling
  { key: 'calendar_view', description: 'View family calendar and scheduled events', group: 'Calendar & Scheduling', title: 'Calendar View' },
  { key: 'calendar_edit', description: 'Create, edit, and delete calendar events', group: 'Calendar & Scheduling', title: 'Calendar Edit' },
  { key: 'schedule_events', description: 'Schedule new events and appointments', group: 'Calendar & Scheduling', title: 'Schedule Events' },
  { key: 'manage_recurring_events', description: 'Set up and manage recurring events and reminders', group: 'Calendar & Scheduling', title: 'Recurring Events' },
  { key: 'view_family_calendar', description: 'Access shared family calendar with all member events', group: 'Calendar & Scheduling', title: 'Family Calendar' },
  { key: 'sync_external_calendars', description: 'Connect and sync with Google Calendar, Outlook, etc.', group: 'Calendar & Scheduling', title: 'External Sync' },
  
  // Tasks & Chores
  { key: 'create_tasks', description: 'Create new tasks and to-do items for the household', group: 'Tasks & Chores', title: 'Create Tasks' },
  { key: 'assign_tasks', description: 'Assign tasks to specific household members', group: 'Tasks & Chores', title: 'Assign Tasks' },
  { key: 'mark_tasks_complete', description: 'Mark tasks as completed and track progress', group: 'Tasks & Chores', title: 'Complete Tasks' },
  { key: 'view_task_history', description: 'View completed task history and performance metrics', group: 'Tasks & Chores', title: 'Task History' },
  { key: 'manage_chore_rotation', description: 'Set up automatic chore rotation schedules', group: 'Tasks & Chores', title: 'Chore Rotation' },
  { key: 'set_task_rewards', description: 'Configure rewards and incentives for task completion', group: 'Tasks & Chores', title: 'Task Rewards' },
  
  // Meal Planning
  { key: 'meal_planning', description: 'Plan weekly meals and create meal schedules', group: 'Meal Planning', title: 'Meal Planning' },
  { key: 'grocery_list_management', description: 'Create and manage shared grocery shopping lists', group: 'Meal Planning', title: 'Grocery Lists' },
  { key: 'recipe_management', description: 'Save, organize, and share family recipes', group: 'Meal Planning', title: 'Recipe Management' },
  { key: 'dietary_restrictions_view', description: 'View and manage family dietary restrictions and allergies', group: 'Meal Planning', title: 'Dietary Restrictions' },
  { key: 'cooking_schedule', description: 'Schedule who cooks when and meal prep times', group: 'Meal Planning', title: 'Cooking Schedule' },
  { key: 'meal_prep_planning', description: 'Plan and schedule meal preparation activities', group: 'Meal Planning', title: 'Meal Prep Planning' },
  
  // Finance & Budgeting
  { key: 'expense_tracking', description: 'Track household expenses and spending categories', group: 'Finance & Budgeting', title: 'Expense Tracking' },
  { key: 'budget_management', description: 'Create and manage household budgets', group: 'Finance & Budgeting', title: 'Budget Management' },
  { key: 'bill_reminders', description: 'Set up and manage bill payment reminders', group: 'Finance & Budgeting', title: 'Bill Reminders' },
  { key: 'shared_account_access', description: 'Access shared financial account information', group: 'Finance & Budgeting', title: 'Account Access' },
  { key: 'financial_reports', description: 'Generate and view financial reports and summaries', group: 'Finance & Budgeting', title: 'Financial Reports' },
  { key: 'allowance_management', description: 'Manage children\'s allowances and spending money', group: 'Finance & Budgeting', title: 'Allowance Management' },
  
  // Children & Education
  { key: 'school_schedule_access', description: 'View children\'s school schedules and important dates', group: 'Children & Education', title: 'School Schedule' },
  { key: 'homework_tracking', description: 'Track homework assignments and completion status', group: 'Children & Education', title: 'Homework Tracking' },
  { key: 'extracurricular_management', description: 'Manage sports, clubs, and after-school activities', group: 'Children & Education', title: 'Extracurriculars' },
  { key: 'screen_time_controls', description: 'Set and enforce screen time limits for children', group: 'Children & Education', title: 'Screen Time Controls' },
  { key: 'bedtime_enforcement', description: 'Set and monitor bedtime schedules for children', group: 'Children & Education', title: 'Bedtime Enforcement' },
  { key: 'chore_assignment_kids', description: 'Assign age-appropriate chores to children', group: 'Children & Education', title: 'Kids Chore Assignment' },
  
  // Health & Wellness
  { key: 'medical_appointment_scheduling', description: 'Schedule and manage medical appointments for family', group: 'Health & Wellness', title: 'Medical Appointments' },
  { key: 'medication_reminders', description: 'Set up medication reminders and tracking', group: 'Health & Wellness', title: 'Medication Reminders' },
  { key: 'health_record_access', description: 'Access and manage family health records', group: 'Health & Wellness', title: 'Health Records' },
  { key: 'fitness_goal_tracking', description: 'Track family fitness goals and activities', group: 'Health & Wellness', title: 'Fitness Tracking' },
  { key: 'mental_health_check_ins', description: 'Schedule and track mental health check-ins', group: 'Health & Wellness', title: 'Mental Health Check-ins' },
  { key: 'emergency_contact_management', description: 'Manage emergency contacts and medical information', group: 'Health & Wellness', title: 'Emergency Contacts' },
  
  // Home Management
  { key: 'maintenance_scheduling', description: 'Schedule home maintenance tasks and repairs', group: 'Home Management', title: 'Maintenance Scheduling' },
  { key: 'utility_management', description: 'Track utility usage and manage service accounts', group: 'Home Management', title: 'Utility Management' },
  { key: 'inventory_tracking', description: 'Track household inventory and supplies', group: 'Home Management', title: 'Inventory Tracking' },
  { key: 'cleaning_schedule', description: 'Create and manage house cleaning schedules', group: 'Home Management', title: 'Cleaning Schedule' },
  { key: 'guest_access_control', description: 'Manage guest access codes and temporary permissions', group: 'Home Management', title: 'Guest Access' },
  { key: 'security_system_access', description: 'Control home security system and monitoring', group: 'Home Management', title: 'Security System' },
  
  // Communication
  { key: 'family_messaging', description: 'Send messages within the family group', group: 'Communication', title: 'Family Messaging' },
  { key: 'announcement_posting', description: 'Post announcements to the family board', group: 'Communication', title: 'Announcements' },
  { key: 'photo_sharing', description: 'Share photos with family members', group: 'Communication', title: 'Photo Sharing' },
  { key: 'video_calling', description: 'Initiate video calls with family members', group: 'Communication', title: 'Video Calling' },
  { key: 'emergency_alerts', description: 'Send and receive emergency alerts', group: 'Communication', title: 'Emergency Alerts' },
  { key: 'school_communication', description: 'Manage communication with schools and teachers', group: 'Communication', title: 'School Communication' },
  
  // Entertainment & Travel
  { key: 'activity_planning', description: 'Plan family activities and outings', group: 'Entertainment & Travel', title: 'Activity Planning' },
  { key: 'vacation_planning', description: 'Plan and organize family vacations', group: 'Entertainment & Travel', title: 'Vacation Planning' },
  { key: 'movie_night_scheduling', description: 'Schedule family movie nights and entertainment', group: 'Entertainment & Travel', title: 'Movie Night' },
  { key: 'game_time_management', description: 'Manage gaming time and family game sessions', group: 'Entertainment & Travel', title: 'Game Time' },
  { key: 'social_event_coordination', description: 'Coordinate social events and gatherings', group: 'Entertainment & Travel', title: 'Social Events' },
  { key: 'birthday_party_planning', description: 'Plan birthday parties and special celebrations', group: 'Entertainment & Travel', title: 'Party Planning' },
  
  // Privacy & Security
  { key: 'location_sharing', description: 'Share location with family members', group: 'Privacy & Security', title: 'Location Sharing' },
  { key: 'data_export', description: 'Export personal and family data', group: 'Privacy & Security', title: 'Data Export' },
  { key: 'privacy_settings', description: 'Manage privacy settings and data sharing preferences', group: 'Privacy & Security', title: 'Privacy Settings' },
  { key: 'notification_management', description: 'Control notification preferences and settings', group: 'Privacy & Security', title: 'Notification Management' },
  { key: 'device_management', description: 'Manage connected devices and access controls', group: 'Privacy & Security', title: 'Device Management' },
  { key: 'parental_controls', description: 'Set up and manage parental controls', group: 'Privacy & Security', title: 'Parental Controls' },
];

export const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_METADATA.map(p => p.key);
