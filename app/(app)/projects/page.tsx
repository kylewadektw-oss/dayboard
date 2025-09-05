import { ProjectsManager } from '@/components/projects/ProjectsManager';

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <ProjectsManager />
      </div>
    </div>
  );
}
