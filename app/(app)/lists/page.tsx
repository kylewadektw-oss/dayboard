import { ListsManager } from '@/components/lists/ListsManager';

export default function ListsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <ListsManager />
      </div>
    </div>
  );
}
