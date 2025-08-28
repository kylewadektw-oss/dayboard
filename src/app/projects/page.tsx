"use client";

import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProjectModal from '../../components/ProjectModal';
import AddProjectModal from '../../components/AddProjectModal';

interface Project {
  id: number;
  title: string;
  status: string;
  dueDate: string;
  assignedTo: string;
  progress: number;
  description?: string;
  notes?: string;
}

const initialProjects: Project[] = [
  { 
    id: 1, 
    title: "Paint Living Room", 
    status: "Planned", 
    dueDate: "2025-09-15", 
    assignedTo: "Kyle", 
    progress: 25,
    description: "Repaint the living room walls with a fresh coat of neutral color paint.",
    notes: "Need to buy primer, paint rollers, and drop cloths. Consider hiring professional for ceiling."
  },
  { 
    id: 2, 
    title: "Install Shelving", 
    status: "In Progress", 
    dueDate: "2025-09-20", 
    assignedTo: "Mindy", 
    progress: 60,
    description: "Install floating shelves in the home office for better organization.",
    notes: "Shelves purchased from IKEA. Need to find wall studs and use proper anchors."
  },
  { 
    id: 3, 
    title: "Garage Cleanup", 
    status: "Completed", 
    dueDate: "2025-08-20", 
    assignedTo: "Household", 
    progress: 100,
    description: "Organize garage space and donate unused items.",
    notes: "Donated 3 boxes to Goodwill. Installed pegboard for tool storage."
  },
  { 
    id: 4, 
    title: "Fix Kitchen Faucet", 
    status: "Planned", 
    dueDate: "2025-09-10", 
    assignedTo: "Kyle", 
    progress: 0,
    description: "Replace leaky kitchen faucet with new stainless steel model.",
    notes: "Faucet model: Moen Arbor 7594ESRS. Need to turn off water main before starting."
  },
  { 
    id: 5, 
    title: "Organize Closets", 
    status: "In Progress", 
    dueDate: "2025-09-25", 
    assignedTo: "Mindy", 
    progress: 40,
    description: "Reorganize master bedroom and guest room closets with new storage solutions.",
    notes: "Purchased drawer organizers and shelf dividers. Need one weekend to complete."
  },
  { 
    id: 6, 
    title: "Garden Weeding", 
    status: "Completed", 
    dueDate: "2025-08-20", 
    assignedTo: "Household", 
    progress: 100,
    description: "Remove weeds from flower beds and apply mulch.",
    notes: "Used organic weed killer. Applied 6 bags of cedar mulch."
  },
];

interface ProjectCardProps {
  project: Project;
  onMove: (projectId: number, newStatus: string) => void;
  onView: (project: Project) => void;
}

function ProjectCard({ project, onMove, onView }: ProjectCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'project',
    item: { id: project.id, status: project.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planned":
        return "border-l-4 border-blue-500";
      case "In Progress":
        return "border-l-4 border-yellow-500";
      case "Completed":
        return "border-l-4 border-green-500";
      default:
        return "border-l-4 border-gray-500";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isOverdue = new Date(project.dueDate) < new Date() && project.status !== "Completed";

  return (
    <div
      ref={drag as unknown as React.RefObject<HTMLDivElement>}
      className={`min-w-[280px] bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-grab active:cursor-grabbing flex-shrink-0 ${getStatusColor(project.status)} ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      } ${isOverdue ? 'ring-2 ring-red-300' : ''}`}
      style={{ transform: isDragging ? 'rotate(5deg)' : 'rotate(0deg)' }}
    >
      {/* Drag Handle Indicator */}
      <div className="flex justify-center pt-2">
        <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
      </div>
      
      {/* Card Header */}
      <div className="p-5 pb-3">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
          {project.title}
        </h3>
        
        {/* Project Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-base">📅</span>
            <span className={isOverdue ? 'text-red-600 font-semibold' : ''}>
              Due: {formatDate(project.dueDate)}
            </span>
            {isOverdue && <span className="text-red-500">⚠️</span>}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-base">👤</span>
            <span>{project.assignedTo}</span>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{project.progress}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`${getProgressColor(project.progress)} h-3 rounded-full transition-all duration-300`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 pb-5">
        <button 
          onClick={() => onView(project)}
          className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          View Details →
        </button>
      </div>
    </div>
  );
}

interface DropZoneProps {
  status: string;
  children: React.ReactNode;
  onDrop: (projectId: number, newStatus: string) => void;
}

function DropZone({ status, children, onDrop }: DropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'project',
    drop: (item: { id: number; status: string }) => {
      if (item.status !== status) {
        onDrop(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const getDropZoneStyles = () => {
    if (isOver && canDrop) {
      switch (status) {
        case "Planned":
          return "bg-blue-50 border-blue-300";
        case "In Progress":
          return "bg-yellow-50 border-yellow-300";
        case "Completed":
          return "bg-green-50 border-green-300";
        default:
          return "bg-gray-50 border-gray-300";
      }
    }
    return "";
  };

  return (
    <div
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-200 rounded-2xl border-2 border-dashed border-transparent p-4 ${getDropZoneStyles()}`}
    >
      {children}
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [nextId, setNextId] = useState(7); // For generating new project IDs
  
  const statuses = ["Planned", "In Progress", "Completed"];

  const moveProject = (projectId: number, newStatus: string) => {
    setProjects(prevProjects =>
      prevProjects.map(project => {
        if (project.id === projectId) {
          // Auto-update progress based on status
          let newProgress = project.progress;
          if (newStatus === "Planned" && project.progress > 0) {
            newProgress = Math.min(project.progress, 25);
          } else if (newStatus === "In Progress") {
            newProgress = project.progress === 0 ? 25 : Math.max(project.progress, 25);
            newProgress = Math.min(newProgress, 99);
          } else if (newStatus === "Completed") {
            newProgress = 100;
          }
          
          return {
            ...project,
            status: newStatus,
            progress: newProgress
          };
        }
        return project;
      })
    );
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (updatedProject: Project) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
    setIsProjectModalOpen(false);
  };

  const handleDeleteProject = (projectId: number) => {
    setProjects(prevProjects =>
      prevProjects.filter(project => project.id !== projectId)
    );
    setIsProjectModalOpen(false);
  };

  const handleAddProject = (newProjectData: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...newProjectData,
      id: nextId
    };
    setProjects(prevProjects => [...prevProjects, newProject]);
    setNextId(prev => prev + 1);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏠 Home Projects</h1>
          <p className="text-gray-600 mb-4">Track household projects, renovations, and improvements</p>
          
          {/* Drag and Drop Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Drag and drop project cards between columns to update their status
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {projects.filter(p => p.status === "Planned").length}
              </div>
              <div className="text-sm text-gray-500">Planned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {projects.filter(p => p.status === "In Progress").length}
              </div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {projects.filter(p => p.status === "Completed").length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>

        {/* Project Sections */}
        {statuses.map((status) => {
          const statusProjects = projects.filter((p) => p.status === status);
          
          return (
            <div key={status} className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">{status}</h2>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                  {statusProjects.length}
                </span>
              </div>
              
              {/* Drop Zone with Sliding Tiles Container */}
              <DropZone status={status} onDrop={moveProject}>
                <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide min-h-[200px]">
                  {statusProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onMove={moveProject}
                      onView={handleViewProject}
                    />
                  ))}

                  {/* Add New Project Card */}
                  <div 
                    onClick={() => setIsAddModalOpen(true)}
                    className="min-w-[280px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center flex-shrink-0 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                  >
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">➕</div>
                      <div className="text-gray-600 font-medium">Add New Project</div>
                    </div>
                  </div>
                </div>
              </DropZone>
            </div>
          );
        })}

        {/* Empty State (if no projects) */}
        {projects.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-6">Start tracking your home improvement projects</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Project
            </button>
          </div>
        )}

        {/* Modals */}
        <ProjectModal
          project={selectedProject}
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
        />

        <AddProjectModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddProject}
        />
      </div>
    </DndProvider>
  );
}
