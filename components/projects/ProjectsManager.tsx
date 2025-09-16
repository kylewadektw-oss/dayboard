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

'use client';

import { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Grid3X3,
  List,
  CheckCircle,
  Circle,
  Timer,
  Target,
  TrendingUp,
  User,
  Users
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'planning';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  dueDate?: string;
  timeSpent: number; // in minutes
  estimatedTime: number; // in minutes
  category: string;
  color: string;
  tags: string[];
  assignee?: string;
  tasks: ProjectTask[];
}

interface ProjectTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
}

const mockProjects: Project[] = [
  {
    id: 'p1',
    title: 'Kitchen Renovation Planning',
    description:
      'Research contractors, finalize design, create budget spreadsheet',
    status: 'active',
    priority: 'high',
    progress: 65,
    dueDate: '2024-12-15',
    timeSpent: 480,
    estimatedTime: 720,
    category: 'Home',
    color: 'from-pink-400 to-rose-500',
    tags: ['home', 'renovation', 'budget'],
    assignee: 'Mom',
    tasks: [
      { id: 't1', title: 'Research 3 contractors', completed: true },
      { id: 't2', title: 'Finalize cabinet design', completed: true },
      {
        id: 't3',
        title: 'Get final quotes',
        completed: false,
        dueDate: '2024-12-10'
      },
      {
        id: 't4',
        title: 'Order materials',
        completed: false,
        dueDate: '2024-12-15'
      }
    ]
  },
  {
    id: 'p2',
    title: 'Holiday Party Planning',
    description: 'Organize annual family holiday gathering',
    status: 'active',
    priority: 'medium',
    progress: 40,
    dueDate: '2024-12-20',
    timeSpent: 180,
    estimatedTime: 360,
    category: 'Events',
    color: 'from-green-400 to-emerald-500',
    tags: ['holiday', 'family', 'party'],
    assignee: 'Mom',
    tasks: [
      { id: 't5', title: 'Send invitations', completed: true },
      { id: 't6', title: 'Plan menu', completed: false },
      { id: 't7', title: 'Decorate house', completed: false },
      { id: 't8', title: 'Buy gifts', completed: false }
    ]
  },
  {
    id: 'p3',
    title: 'Kids School Project Support',
    description: 'Help Emma with science fair project on renewable energy',
    status: 'active',
    priority: 'high',
    progress: 80,
    dueDate: '2024-12-12',
    timeSpent: 240,
    estimatedTime: 300,
    category: 'Kids',
    color: 'from-blue-400 to-cyan-500',
    tags: ['school', 'science', 'emma'],
    assignee: 'Dad',
    tasks: [
      { id: 't9', title: 'Research renewable energy', completed: true },
      { id: 't10', title: 'Build wind turbine model', completed: true },
      {
        id: 't11',
        title: 'Prepare presentation',
        completed: false,
        dueDate: '2024-12-10'
      },
      {
        id: 't12',
        title: 'Practice presentation',
        completed: false,
        dueDate: '2024-12-11'
      }
    ]
  },
  {
    id: 'p4',
    title: 'Family Budget Review',
    description: 'Quarterly budget analysis and savings goals adjustment',
    status: 'planning',
    priority: 'medium',
    progress: 20,
    dueDate: '2024-12-31',
    timeSpent: 60,
    estimatedTime: 240,
    category: 'Finance',
    color: 'from-purple-400 to-indigo-500',
    tags: ['budget', 'finance', 'savings'],
    assignee: 'Both',
    tasks: [
      { id: 't13', title: 'Gather all receipts', completed: true },
      { id: 't14', title: 'Update spreadsheet', completed: false },
      { id: 't15', title: 'Review investment portfolio', completed: false },
      { id: 't16', title: 'Set Q1 goals', completed: false }
    ]
  },
  {
    id: 'p5',
    title: 'Garage Organization',
    description: 'Deep clean and organize garage for winter storage',
    status: 'completed',
    priority: 'low',
    progress: 100,
    timeSpent: 360,
    estimatedTime: 360,
    category: 'Home',
    color: 'from-gray-400 to-slate-500',
    tags: ['organization', 'cleaning', 'storage'],
    assignee: 'Dad',
    tasks: [
      { id: 't17', title: 'Clear out old items', completed: true },
      { id: 't18', title: 'Install shelving', completed: true },
      { id: 't19', title: 'Label storage bins', completed: true },
      { id: 't20', title: 'Sweep and clean', completed: true }
    ]
  },
  {
    id: 'p6',
    title: 'Vacation Planning - Spring Break',
    description: 'Plan and book family spring break vacation',
    status: 'paused',
    priority: 'low',
    progress: 30,
    dueDate: '2025-02-01',
    timeSpent: 120,
    estimatedTime: 480,
    category: 'Travel',
    color: 'from-yellow-400 to-orange-500',
    tags: ['vacation', 'travel', 'family'],
    assignee: 'Mom',
    tasks: [
      { id: 't21', title: 'Research destinations', completed: true },
      { id: 't22', title: 'Check school calendar', completed: true },
      { id: 't23', title: 'Compare flight prices', completed: false },
      { id: 't24', title: 'Book accommodation', completed: false }
    ]
  }
];

export default function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'tiles' | 'list'>('tiles');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTimerProject, setActiveTimerProject] = useState<string | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState(0);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && activeTimerProject) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTimerProject]);

  const startTimer = (projectId: string) => {
    setActiveTimerProject(projectId);
    setIsTimerRunning(true);
    setCurrentTime(0);

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, status: 'active' as const } : p
      )
    );
  };

  const stopTimer = () => {
    if (activeTimerProject && currentTime > 0) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeTimerProject
            ? { ...p, timeSpent: p.timeSpent + Math.floor(currentTime / 60) }
            : p
        )
      );
    }
    setIsTimerRunning(false);
    setActiveTimerProject(null);
    setCurrentTime(0);
  };

  const toggleTaskCompletion = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === projectId) {
          const updatedTasks = project.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          const completedTasks = updatedTasks.filter((t) => t.completed).length;
          const progress = Math.round(
            (completedTasks / updatedTasks.length) * 100
          );

          return {
            ...project,
            tasks: updatedTasks,
            progress,
            status: progress === 100 ? ('completed' as const) : project.status
          };
        }
        return project;
      })
    );
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredProjects = projects.filter((project) => {
    const statusMatch =
      statusFilter === 'all' || project.status === statusFilter;
    const categoryMatch =
      categoryFilter === 'all' || project.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const categories = Array.from(new Set(projects.map((p) => p.category)));
  const statuses = ['all', 'active', 'planning', 'paused', 'completed'];

  const nextSlide = () => {
    setCurrentIndex(
      (prev) => (prev + 1) % Math.max(1, filteredProjects.length - 2)
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : Math.max(0, filteredProjects.length - 3)
    );
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Project Management
          </h1>
          <p className="text-gray-600">
            Track family projects, goals, and time spent
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer Display */}
          {isTimerRunning && activeTimerProject && (
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-200">
              <Timer className="h-4 w-4 text-green-600" />
              <span className="font-mono text-lg text-green-600">
                {formatTimerTime(currentTime)}
              </span>
              <button
                onClick={stopTimer}
                className="text-red-600 hover:text-red-700"
              >
                <Pause className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* View Toggle */}
          <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setViewMode('tiles')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'tiles'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter((p) => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter((p) => p.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Time Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatTime(
                  projects.reduce((total, p) => total + p.timeSpent, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  projects.reduce((total, p) => total + p.progress, 0) /
                    projects.length
                )}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {viewMode === 'tiles' ? (
        <div className="relative">
          {/* Sliding Tiles Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              {filteredProjects.slice(0, -2).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              disabled={
                currentIndex >= Math.max(0, filteredProjects.length - 3)
              }
              className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Project Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects
              .slice(currentIndex, currentIndex + 3)
              .map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Project Header */}
                  <div
                    className={`bg-gradient-to-r ${project.color} p-4 text-white`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg leading-tight">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`}
                        ></div>
                        {project.status !== 'completed' && !isTimerRunning && (
                          <button
                            onClick={() => startTimer(project.id)}
                            className="p-1 hover:bg-white/20 rounded-md transition-colors"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {activeTimerProject === project.id && (
                          <div className="text-xs bg-white/20 rounded px-2 py-1">
                            {formatTimerTime(currentTime)}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-white/90">
                      {project.description}
                    </p>
                  </div>

                  {/* Project Details */}
                  <div className="p-4 space-y-4">
                    {/* Status and Assignee */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        {project.assignee === 'Both' ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        {project.assignee}
                      </div>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r ${project.color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Time Tracking */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTime(project.timeSpent)} /{' '}
                          {formatTime(project.estimatedTime)}
                        </span>
                      </div>
                      {project.dueDate && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(project.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tasks */}
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Tasks
                      </p>
                      <div className="space-y-2">
                        {project.tasks.slice(0, 3).map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center gap-2"
                          >
                            <button
                              onClick={() =>
                                toggleTaskCompletion(project.id, task.id)
                              }
                              className="flex-shrink-0"
                            >
                              {task.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                            <span
                              className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                            >
                              {task.title}
                            </span>
                          </div>
                        ))}
                        {project.tasks.length > 3 && (
                          <p className="text-xs text-gray-500 ml-6">
                            +{project.tasks.length - 3} more tasks
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-6">
                {/* Project Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </span>
                      <div
                        className={`w-3 h-3 rounded-full ${getPriorityColor(project.priority)}`}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Progress
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${project.color} h-2 rounded-full`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {project.progress}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Time Spent
                      </p>
                      <p className="text-sm font-medium">
                        {formatTime(project.timeSpent)} /{' '}
                        {formatTime(project.estimatedTime)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Due Date
                      </p>
                      <p className="text-sm font-medium">
                        {project.dueDate
                          ? new Date(project.dueDate).toLocaleDateString()
                          : 'No due date'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Assignee
                      </p>
                      <div className="flex items-center gap-1">
                        {project.assignee === 'Both' ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {project.assignee}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tasks Overview */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {project.tasks.filter((t) => t.completed).length} /{' '}
                        {project.tasks.length} tasks completed
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {project.status !== 'completed' && !isTimerRunning && (
                        <button
                          onClick={() => startTimer(project.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <Play className="h-4 w-4" />
                          Start Timer
                        </button>
                      )}
                      {activeTimerProject === project.id && (
                        <div className="flex items-center gap-2 bg-green-100 text-green-700 rounded-lg px-3 py-1.5">
                          <Timer className="h-4 w-4" />
                          <span className="font-mono">
                            {formatTimerTime(currentTime)}
                          </span>
                          <button onClick={stopTimer}>
                            <Pause className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters or create a new project
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Plus className="h-4 w-4" />
            Add New Project
          </button>
        </div>
      )}
    </div>
  );
}
