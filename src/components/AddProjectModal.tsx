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

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: Omit<Project, 'id'>) => void;
}

export default function AddProjectModal({ isOpen, onClose, onAdd }: AddProjectModalProps) {
  const [newProject, setNewProject] = useState({
    title: '',
    status: 'Planned',
    dueDate: '',
    assignedTo: 'Kyle',
    progress: 0,
    description: '',
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!newProject.title.trim()) {
      newErrors.title = 'Project title is required';
    }
    
    if (!newProject.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAdd(newProject);
      // Reset form
      setNewProject({
        title: '',
        status: 'Planned',
        dueDate: '',
        assignedTo: 'Kyle',
        progress: 0,
        description: '',
        notes: ''
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setNewProject({
      title: '',
      status: 'Planned',
      dueDate: '',
      assignedTo: 'Kyle',
      progress: 0,
      description: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Project</h2>
            <p className="text-gray-600 mt-1">Create a new home improvement project</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              value={newProject.title}
              onChange={(e) => setNewProject(prev => ({...prev, title: e.target.value}))}
              placeholder="e.g., Paint Living Room"
              className={`w-full border rounded-lg px-3 py-2 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={newProject.status}
                onChange={(e) => setNewProject(prev => ({...prev, status: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={newProject.dueDate}
                onChange={(e) => setNewProject(prev => ({...prev, dueDate: e.target.value}))}
                className={`w-full border rounded-lg px-3 py-2 ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <select
                value={newProject.assignedTo}
                onChange={(e) => setNewProject(prev => ({...prev, assignedTo: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="Kyle">Kyle</option>
                <option value="Mindy">Mindy</option>
                <option value="Household">Household</option>
              </select>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Initial Progress</label>
              <span className="text-sm font-bold text-gray-900">{newProject.progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={newProject.progress}
              onChange={(e) => setNewProject(prev => ({...prev, progress: parseInt(e.target.value)}))}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({...prev, description: e.target.value}))}
              placeholder="Describe what this project involves..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={newProject.notes}
              onChange={(e) => setNewProject(prev => ({...prev, notes: e.target.value}))}
              placeholder="Any additional notes or reminders..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
