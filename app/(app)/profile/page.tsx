import { ProfileManager } from '@/components/profile/ProfileManager';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <ProfileManager />
      </div>
    </div>
  );
}
