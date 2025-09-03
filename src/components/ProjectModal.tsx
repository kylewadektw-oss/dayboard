'use client';

import { useState } from 'react';

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

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  onDelete: (projectId: number) => void;
}

export default function ProjectModal({ project, isOpen, onClose, onSave, onDelete }: ProjectModalProps) {
  const [editedProject, setEditedProject] = useState<Project | null>(project);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen || !project) return null;

  const handleSave = () => {
    if (editedProject) {
      onSave(editedProject);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      onDelete(project.id);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planned": return "bg-blue-100 text-blue-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const isOverdue = new Date(project.dueDate) < new Date() && project.status !== "Completed";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedProject?.title || ''}
                onChange={(e) => setEditedProject(prev => prev ? {...prev, title: e.target.value} : null)}
                className="text-2xl font-bold text-gray-900 w-full border border-gray-300 rounded px-3 py-2"
              />
            ) : (
              <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
              {isOverdue && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  ⚠️ Overdue
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedProject?.dueDate || ''}
                  onChange={(e) => setEditedProject(prev => prev ? {...prev, dueDate: e.target.value} : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              ) : (
                <p className={`text-gray-900 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                  📅 {formatDate(project.dueDate)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              {isEditing ? (
                <select
                  value={editedProject?.assignedTo || ''}
                  onChange={(e) => setEditedProject(prev => prev ? {...prev, assignedTo: e.target.value} : null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="Kyle">Kyle</option>
                  <option value="Mindy">Mindy</option>
                  <option value="Household">Household</option>
                </select>
              ) : (
                <p className="text-gray-900">👤 {project.assignedTo}</p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Progress</label>
              <span className="text-sm font-bold text-gray-900">{editedProject?.progress || project.progress}%</span>
            </div>
            {isEditing ? (
              <input
                type="range"
                min="0"
                max="100"
                value={editedProject?.progress || 0}
                onChange={(e) => setEditedProject(prev => prev ? {...prev, progress: parseInt(e.target.value)} : null)}
                className="w-full"
              />
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`${getProgressColor(project.progress)} h-4 rounded-full transition-all duration-300`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            {isEditing ? (
              <textarea
                value={editedProject?.description || ''}
                onChange={(e) => setEditedProject(prev => prev ? {...prev, description: e.target.value} : null)}
                placeholder="Project description..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                {project.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            {isEditing ? (
              <textarea
                value={editedProject?.notes || ''}
                onChange={(e) => setEditedProject(prev => prev ? {...prev, notes: e.target.value} : null)}
                placeholder="Project notes..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            ) : (
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">
                {project.notes || 'No notes added yet.'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 font-medium transition-colors"
          >
            🗑️ Delete Project
          </button>

          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setEditedProject(project);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setEditedProject(project);
                  setIsEditing(true);
                }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="text-sm font-medium">Edit Project</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
