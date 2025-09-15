/**
 * Entertainment Preferences Page
 * User settings for customizing entertainment recommendations
 */

import EntertainmentPreferencesSettings from '@/components/entertainment/EntertainmentPreferencesSettings';

export const metadata = {
  title: 'Entertainment Preferences | Dayboard',
  description: 'Customize your entertainment recommendations and discovery experience',
};

export default function PreferencesPage() {
  return <EntertainmentPreferencesSettings />;
}