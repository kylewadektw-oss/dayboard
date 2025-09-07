/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

/*
 * 📋 PROJECTS WIDGET TYPES - Type Definitions
 * 
 * PURPOSE: TypeScript type definitions for projects widget data structures
 * 
 * TYPES:
 * - [List main type definitions]
 * - [Interface declarations]
 * - [Enum definitions]
 * - [Utility types and generics]
 * 
 * USAGE:
 * ```typescript
 * import type { TypeName } from '@/types/ProjectsWidget';
 * 
 * const example: TypeName = {
 *   // properties
 * };
 * ```
 * 
 * FEATURES:
 * - [Type safety guarantees]
 * - [Validation patterns]
 * - [Extensibility and composition]
 * - [Integration with other types]
 * 
 * TECHNICAL:
 * - [Type system design]
 * - [Runtime validation]
 * - [Performance implications]
 * - [Compatibility considerations]
 */


/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kyle.wade.ktw@gmail.com)
 * 
 * This file is part of Dayboard, a proprietary household command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: kyle.wade.ktw@gmail.com
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

/*
 * 🛡️ DAYBOARD PROPRIETARY CODE
 * 
 * Copyright (c) 2025 Kyle Wade (kylewadektw-oss)
 * 
 * This file is part of Dayboard, a proprietary family command center application.
 * 
 * IMPORTANT NOTICE:
 * This code is proprietary and confidential. Unauthorized copying, distribution,
 * or use by large corporations or competing services is strictly prohibited.
 * 
 * For licensing inquiries: [your-email@domain.com]
 * 
 * Violation of this notice may result in legal action and damages up to $100,000.
 */

import { Wrench, Calendar, Users, Eye, Clock } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  status: 'planned' | 'in-progress' | 'completed';
  dueDate: string;
  assignedTo: string;
  progress: number;
  priority: 'low' | 'medium' | 'high';
}

// Mock project data
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Paint Living Room',
    status: 'planned',
    dueDate: '2025-09-15',
    assignedTo: 'Kyle',
    progress: 0,
    priority: 'medium'
  },
  {
    id: '2', 
    title: 'Install Kitchen Shelving',
    status: 'in-progress',
    dueDate: '2025-09-10',
    assignedTo: 'Kyle & Ashley',
    progress: 60,
    priority: 'high'
  },
  {
    id: '3',
    title: 'Organize Garage',
    status: 'in-progress',
    dueDate: '2025-09-20',
    assignedTo: 'Household',
    progress: 25,
    priority: 'low'
  }
];

const getStatusColor = (status: Project['status']) => {
  switch (status) {
    case 'planned':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in-progress':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getPriorityColor = (priority: Project['priority']) => {
  switch (priority) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

const getDaysUntilDue = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export function ProjectsWidget() {
  // Show projects due soon and in progress
  const priorityProjects = mockProjects
    .filter(project => project.status !== 'completed')
    .sort((a, b) => {
      // Sort by due date, then by priority
      const daysA = getDaysUntilDue(a.dueDate);
      const daysB = getDaysUntilDue(b.dueDate);
      if (daysA !== daysB) return daysA - daysB;
      
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 h-fit">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">Projects</h3>
        <Wrench className="h-4 w-4 text-gray-400" />
      </div>

      {/* Project List */}
      <div className="space-y-3 mb-4">
        {priorityProjects.map((project) => {
          const daysUntilDue = getDaysUntilDue(project.dueDate);
          
          return (
            <div key={project.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {project.title}
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    {project.assignedTo}
                  </div>
                </div>
                <div className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {project.status.replace('-', ' ')}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs font-medium text-gray-700">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Due Date & Priority */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {daysUntilDue === 0 ? 'Due today' : 
                   daysUntilDue === 1 ? 'Due tomorrow' :
                   daysUntilDue > 0 ? `${daysUntilDue} days left` :
                   `${Math.abs(daysUntilDue)} days overdue`}
                </div>
                <div className={`font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority} priority
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button className="w-full py-2 px-3 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center">
          <Wrench className="h-3 w-3 mr-1" />
          Log New Project
        </button>
        
        <button className="w-full py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center">
          <Eye className="h-3 w-3 mr-1" />
          View All Projects
        </button>
      </div>

      {/* Stats */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Active projects</span>
          <span className="font-medium text-gray-700">
            {mockProjects.filter(p => p.status !== 'completed').length}
          </span>
        </div>
      </div>
    </div>
  );
}
