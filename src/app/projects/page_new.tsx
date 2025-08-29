"use client";

import { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { supabase } from '../../lib/supabaseClient';

// Updated interface to match Supabase schema
interface Project {
  id: string;
  household_id?: string;
  title: string;
  status?: 'Planned' | 'In Progress' | 'Completed';
  due_date?: string;
  assigned_to?: string;
  progress?: number;
  created_at: string;
  // New Supabase fields
  room?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  category?: 'Renovation' | 'Repair' | 'Organization' | 'Decor';
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  estimated_cost?: number;
  estimated_hours?: number;
  // Legacy fields for modal compatibility
  dueDate?: string;
  assignedTo?: string;
  description?: string;
  notes?: string;
}

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'project',
    item: { id: project.id, status: project.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getStatusColor = (status?: string) => {
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

  const getProgressColor = (progress?: number) => {
    const prog = progress || 0;
    if (prog === 100) return "bg-green-500";
    if (prog >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isOverdue = project.due_date ? new Date(project.due_date) < new Date() && project.status !== "Completed" : false;

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
              Due: {formatDate(project.due_date)}
            </span>
            {isOverdue && <span className="text-red-500">⚠️</span>}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-base">👤</span>
            <span>{project.assigned_to || 'Unassigned'}</span>
          </div>

          {project.room && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-base">🏠</span>
              <span>{project.room}</span>
            </div>
          )}

          {project.priority && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-base">🎯</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                project.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                project.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                project.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {project.priority}
              </span>
            </div>
          )}

          {(project.estimated_cost || project.estimated_hours) && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {project.estimated_cost && (
                <div className="flex items-center gap-1">
                  <span className="text-base">💰</span>
                  <span>${project.estimated_cost}</span>
                </div>
              )}
              {project.estimated_hours && (
                <div className="flex items-center gap-1">
                  <span className="text-base">⏱️</span>
                  <span>{project.estimated_hours}h</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-900">{project.progress || 0}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`${getProgressColor(project.progress)} h-3 rounded-full transition-all duration-300`}
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 pb-5">
        <button 
          onClick={() => alert(`Project: ${project.title}\nStatus: ${project.status}\nProgress: ${project.progress}%\nDue: ${formatDate(project.due_date)}`)}
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
  onDrop: (projectId: string, newStatus: string) => void;
}

function DropZone({ status, children, onDrop }: DropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'project',
    drop: (item: { id: string; status?: string }) => {
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    room: "",
    priority: "",
    category: "",
    difficulty: ""
  });
  
  const statuses = ["Planned", "In Progress", "Completed"];

  // Load projects from Supabase
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Use Supabase client with filters
      let query = supabase.from("home_projects").select("*");

      if (filters.room) query = query.eq("room", filters.room);
      if (filters.priority) query = query.eq("priority", filters.priority);
      if (filters.category) query = query.eq("category", filters.category);
      if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);

      const { data } = await query;
      
      // Convert to our Project interface with legacy field mapping
      const formattedProjects = (data || []).map(p => ({
        ...p,
        dueDate: p.due_date,
        assignedTo: p.assigned_to,
      }));
      setProjects(formattedProjects);
      setError(null);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please check your database connection.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const moveProject = async (projectId: string, newStatus: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      // Auto-update progress based on status
      let newProgress = project.progress || 0;
      if (newStatus === "Planned" && newProgress > 0) {
        newProgress = Math.min(newProgress, 25);
      } else if (newStatus === "In Progress") {
        newProgress = newProgress === 0 ? 25 : Math.max(newProgress, 25);
        newProgress = Math.min(newProgress, 99);
      } else if (newStatus === "Completed") {
        newProgress = 100;
      }

      // Update in database
      await supabase
        .from('home_projects')
        .update({
          status: newStatus,
          progress: newProgress
        })
        .eq('id', projectId);

      // Update local state
      setProjects(prevProjects =>
        prevProjects.map(p =>
          p.id === projectId ? { ...p, status: newStatus as 'Planned' | 'In Progress' | 'Completed', progress: newProgress } : p
        )
      );
    } catch (err) {
      console.error('Error moving project:', err);
      setError('Failed to update project status.');
    }
  };

  // Commented out unused functions to fix ESLint warnings
  // const handleViewProject = (project: Project) => {
  //   // Simple alert for now - TODO: Create proper modal
  //   alert(`Project: ${project.title}\nStatus: ${project.status}\nProgress: ${project.progress}%\nDue: ${project.due_date || 'No due date'}`);
  // };

  // const handleSaveProject = async (updatedProject: Project) => {
  //   try {
  //     const { error } = await supabase
  //       .from('home_projects')
  //       .update({
  //         title: updatedProject.title,
  //         status: updatedProject.status,
  //         due_date: updatedProject.dueDate || updatedProject.due_date,
  //         assigned_to: updatedProject.assignedTo || updatedProject.assigned_to,
  //         progress: updatedProject.progress
  //       })
  //       .eq('id', updatedProject.id);

  //     if (error) throw error;

  //     // Update local state
  //     setProjects(prevProjects =>
  //       prevProjects.map(project =>
  //         project.id === updatedProject.id ? { 
  //           ...updatedProject, 
  //           due_date: updatedProject.dueDate || updatedProject.due_date,
  //           assigned_to: updatedProject.assignedTo || updatedProject.assigned_to
  //         } : project
  //       )
  //     );
  //   } catch (err) {
  //     console.error('Error saving project:', err);
  //     setError('Failed to save project changes.');
  //   }
  // };

  // const handleDeleteProject = async (projectId: string) => {
  //   try {
  //     const { error } = await supabase
  //       .from('home_projects')
  //       .delete()
  //       .eq('id', projectId);

  //     if (error) throw error;
      
  //     // Update local state
  //     setProjects(prevProjects =>
  //       prevProjects.filter(project => project.id !== projectId)
  //     );
  //   } catch (err) {
  //     console.error('Error deleting project:', err);
  //     setError('Failed to delete project.');
  //   }
  // };

  const handleAddProject = async (newProjectData: Omit<Project, 'id' | 'created_at'>) => {
    try {
      const { data: newProject, error } = await supabase
        .from('home_projects')
        .insert({
          title: newProjectData.title,
          status: newProjectData.status,
          due_date: newProjectData.dueDate || newProjectData.due_date,
          assigned_to: newProjectData.assignedTo || newProjectData.assigned_to,
          progress: newProjectData.progress
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state with legacy field mapping
      setProjects(prevProjects => [...prevProjects, {
        ...newProject,
        dueDate: newProject.due_date,
        assignedTo: newProject.assigned_to,
      }]);
    } catch (err) {
      console.error('Error adding project:', err);
      setError('Failed to create new project.');
    }
  };

  const seedSampleProjects = async () => {
    setIsLoading(true);
    try {
      // First, create a household if it doesn't exist
      const householdId = '550e8400-e29b-41d4-a716-446655440000';
      
      // Try to insert household (will be ignored if exists)
      await supabase.from('households').upsert({
        id: householdId,
        name: 'The Smith Family',
        address: '123 Main Street, Anytown, USA',
        members_count: 4
      });

      const sampleProjects = [
        {
          household_id: householdId,
          title: "Kitchen Cabinet Renovation",
          status: "Planned",
          room: "Kitchen",
          priority: "High",
          category: "Renovation",
          difficulty: "Hard",
          estimated_cost: 2500,
          estimated_hours: 40,
          assigned_to: "Mike Smith",
          due_date: "2025-09-15",
          progress: 0,
          description: "Replace all upper kitchen cabinets with modern shaker style doors"
        },
        {
          household_id: householdId,
          title: "Fix Leaky Bathroom Faucet",
          status: "In Progress",
          room: "Bathroom",
          priority: "Medium",
          category: "Repair",
          difficulty: "Easy",
          estimated_cost: 75,
          estimated_hours: 2,
          assigned_to: "Sarah Smith",
          due_date: "2025-08-30",
          progress: 60,
          description: "Replace worn gaskets and O-rings in master bathroom faucet"
        },
        {
          household_id: householdId,
          title: "Organize Garage Storage",
          status: "Planned",
          room: "Garage",
          priority: "Low",
          category: "Organization",
          difficulty: "Medium",
          estimated_cost: 200,
          estimated_hours: 8,
          assigned_to: "Family",
          due_date: "2025-09-30",
          progress: 0,
          description: "Install wall-mounted storage system and organize tools"
        },
        {
          household_id: householdId,
          title: "Install Smart Thermostat",
          status: "Completed",
          room: "Living Room",
          priority: "Medium",
          category: "Renovation",
          difficulty: "Medium",
          estimated_cost: 300,
          estimated_hours: 3,
          assigned_to: "Mike Smith",
          due_date: "2025-08-20",
          progress: 100,
          description: "Replace old thermostat with WiFi-enabled smart thermostat"
        },
        {
          household_id: householdId,
          title: "Paint Bedroom Walls",
          status: "In Progress",
          room: "Bedroom",
          priority: "Medium",
          category: "Decor",
          difficulty: "Medium",
          estimated_cost: 150,
          estimated_hours: 12,
          assigned_to: "Sarah Smith",
          due_date: "2025-09-10",
          progress: 25,
          description: "Paint master bedroom with new calming blue color scheme"
        },
        {
          household_id: householdId,
          title: "Build Outdoor Deck",
          status: "Planned",
          room: "Outdoor",
          priority: "Critical",
          category: "Renovation",
          difficulty: "Hard",
          estimated_cost: 5000,
          estimated_hours: 80,
          assigned_to: "Mike Smith",
          due_date: "2025-10-31",
          progress: 0,
          description: "Construct 12x16 composite deck with railing and steps"
        },
        {
          household_id: householdId,
          title: "Organize Kids Closets",
          status: "Planned",
          room: "Bedroom",
          priority: "Low",
          category: "Organization",
          difficulty: "Easy",
          estimated_cost: 100,
          estimated_hours: 4,
          assigned_to: "Sarah Smith",
          due_date: "2025-09-05",
          progress: 0,
          description: "Install closet organizers in both kids bedrooms"
        },
        {
          household_id: householdId,
          title: "Replace Living Room Light Fixture",
          status: "In Progress",
          room: "Living Room",
          priority: "High",
          category: "Decor",
          difficulty: "Easy",
          estimated_cost: 250,
          estimated_hours: 2,
          assigned_to: "Mike Smith",
          due_date: "2025-09-01",
          progress: 75,
          description: "Install modern chandelier to replace old ceiling fan"
        }
      ];

      // Insert projects using Supabase client
      const { error } = await supabase.from('home_projects').upsert(sampleProjects);
      if (error) throw error;

      // Refresh the projects list
      await loadProjects();
      
      console.log('✅ Sample projects added successfully!');
    } catch (err) {
      console.error('Error seeding sample data:', err);
      setError('Failed to add sample projects: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏠 Home Projects</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span>❌</span>
              <p>{error}</p>
            </div>
            <button 
              onClick={loadProjects}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🏠 Home Projects</h1>
              <p className="text-gray-600">Track household projects, renovations, and improvements</p>
            </div>
            <div className="flex gap-3">
              {projects.length === 0 && (
                <button
                  onClick={seedSampleProjects}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? '⏳ Adding...' : '🌱 Add Sample Projects'}
                </button>
              )}
              <button 
                onClick={() => {
                  const title = prompt('Enter project title:');
                  if (title) {
                    handleAddProject({
                      title,
                      status: 'Planned',
                      progress: 0
                    });
                  }
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ➕ Add Project
              </button>
            </div>
          </div>
          
          {/* Database Status Indicator */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800">
              ✅ <strong>Connected to Supabase Database</strong> - Your projects are now persistently stored
            </p>
          </div>
          
          {/* Drag and Drop Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Drag and drop project cards between columns to update their status
            </p>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filter Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Room Filter */}
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.room}
                onChange={(e) => setFilters({ ...filters, room: e.target.value })}
              >
                <option value="">All Rooms</option>
                <option value="Kitchen">🍳 Kitchen</option>
                <option value="Living Room">🛋️ Living Room</option>
                <option value="Bedroom">🛏️ Bedroom</option>
                <option value="Bathroom">🚿 Bathroom</option>
                <option value="Garage">🚗 Garage</option>
                <option value="Outdoor">🌳 Outdoor</option>
                <option value="Basement">🏠 Basement</option>
                <option value="Attic">🏠 Attic</option>
              </select>

              {/* Priority Filter */}
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <option value="">All Priorities</option>
                <option value="Low">🟢 Low</option>
                <option value="Medium">🟡 Medium</option>
                <option value="High">🟠 High</option>
                <option value="Critical">🔴 Critical</option>
              </select>

              {/* Category Filter */}
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                <option value="Renovation">🔨 Renovation</option>
                <option value="Repair">🔧 Repair</option>
                <option value="Organization">📦 Organization</option>
                <option value="Decor">🎨 Decor</option>
              </select>

              {/* Difficulty Filter */}
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              >
                <option value="">All Difficulties</option>
                <option value="Easy">⭐ Easy</option>
                <option value="Medium">⭐⭐ Medium</option>
                <option value="Hard">⭐⭐⭐ Hard</option>
              </select>
            </div>

            {/* Active Filters Display */}
            {(filters.room || filters.priority || filters.category || filters.difficulty) && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Active filters:</span>
                {filters.room && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    Room: {filters.room}
                  </span>
                )}
                {filters.priority && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                    Priority: {filters.priority}
                  </span>
                )}
                {filters.category && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                    Category: {filters.category}
                  </span>
                )}
                {filters.difficulty && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    Difficulty: {filters.difficulty}
                  </span>
                )}
                <button
                  onClick={() => setFilters({ room: "", priority: "", category: "", difficulty: "" })}
                  className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs hover:bg-gray-200"
                >
                  Clear all
                </button>
              </div>
            )}
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
                    />
                  ))}

                  {/* Add New Project Card */}
                  <div 
                    onClick={() => {
                      const title = prompt('Enter project title:');
                      if (title) {
                        handleAddProject({
                          title,
                          status: status as 'Planned' | 'In Progress' | 'Completed',
                          progress: 0
                        });
                      }
                    }}
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
              onClick={() => {
                const title = prompt('Enter project title:');
                if (title) {
                  handleAddProject({
                    title,
                    status: 'Planned',
                    progress: 0
                  });
                }
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create Your First Project
            </button>
          </div>
        )}

        {/* Modals - Temporarily removed for now */}
        {/* TODO: Create compatible modals or update existing ones */}
      </div>
    </DndProvider>
  );
}
