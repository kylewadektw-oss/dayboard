import { WorkManager } from '@/components/work/WorkManager';

export default function WorkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <WorkManager />
      </div>
    </div>
  );
}
