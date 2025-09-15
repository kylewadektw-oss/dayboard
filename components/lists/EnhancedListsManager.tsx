'use client';

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  Plus, 
  Search, 
  CheckSquare, 
  Square, 
  Trash2,
  Play,
  Pause,
  Timer,
  Target,
  TrendingUp,
  User,
  Users,
  Clock,
  Calendar,
  Filter,
  Grid3X3,
  List as ListIcon,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input/Input';
import { Badge } from '@/components/ui/badge/Badge';
import { createOptimizedDebounce } from '@/utils/performance';

// 🚀 PERFORMANCE: Memoize static configurations
const LIST_TYPES = {
  // 🛒 Household & Food
  grocery: { icon: '🛒', label: 'Grocery List', color: '#22c55e', category: 'Household & Food', isProject: false },
  chores: { icon: '✅', label: 'Chores', color: '#06b6d4', category: 'Home & Projects', isProject: false },
  goals: { icon: '🎯', label: 'Goals', color: '#f59e0b', category: 'Personal & Growth', isProject: false },
  books: { icon: '📚', label: 'Books to Read', color: '#6366f1', category: 'Entertainment & Learning', isProject: false },
  gifts: { icon: '🎁', label: 'Gift Ideas', color: '#f59e0b', category: 'Gifting & Special Occasions', isProject: false },
  
  // 🏠 Project Categories
  home_project: { icon: '🏠', label: 'Home Project', color: '#f97316', category: 'Projects & Planning', isProject: true },
  work_project: { icon: '💼', label: 'Work Project', color: '#3b82f6', category: 'Projects & Planning', isProject: true },
  diy_project: { icon: '🔨', label: 'DIY Project', color: '#84cc16', category: 'Projects & Planning', isProject: true },
  event_planning: { icon: '🎉', label: 'Event Planning', color: '#ec4899', category: 'Projects & Planning', isProject: true },
  kids_project: { icon: '👨‍👩‍👧‍👦', label: 'Kids Project', color: '#8b5cf6', category: 'Projects & Planning', isProject: true },
  finance_project: { icon: '💰', label: 'Finance Project', color: '#10b981', category: 'Projects & Planning', isProject: true },
  travel_planning: { icon: '✈️', label: 'Travel Planning', color: '#06b6d4', category: 'Projects & Planning', isProject: true }
} as const;

// Categories feature coming soon
// const CATEGORIES = Array.from(new Set(Object.values(LIST_TYPES).map(type => type.category)));

interface List {
  id: number;
  title: string;
  type: string;
  description?: string;
  icon?: string;
  color?: string;
  item_count: number;
  checked_count: number;
  last_updated: string;
  
  // Project-specific fields
  status?: 'active' | 'paused' | 'completed' | 'planning';
  priority?: 'low' | 'medium' | 'high';
  progress?: number;
  dueDate?: string;
  timeSpent?: number; // in minutes
  estimatedTime?: number; // in minutes
  assignee?: string;
  tags?: string[];
}

interface ListItem {
  id: number;
  content: string;
  details: {
    notes?: string;
    attachments?: string[];
    subtasks?: Array<{ id: string; text: string; completed: boolean }>;
    estimatedTime?: number;
    actualTime?: number;
    quantity?: string;
    category?: string;
  } | null;
  checked: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  due_date?: string;
  priority?: string;
  category?: string;
  tags: string[];
  created_by_name?: string;
  assigned_to_name?: string;
}

// 🚀 PERFORMANCE: Memoized ListCard component
const ListCard = memo(({ 
  list, 
  listConfig, 
  progress, 
  onSelect,
  onStartTimer,
  isTimerRunning,
  activeTimerProject
}: { 
  list: List; 
  listConfig: typeof LIST_TYPES[keyof typeof LIST_TYPES]; 
  progress: number; 
  onSelect: (list: List) => void;
  onStartTimer?: (listId: string) => void;
  isTimerRunning?: boolean;
  activeTimerProject?: string | null;
}) => {
  const isProject = listConfig?.isProject;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <div onClick={() => onSelect(list)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{list.icon || listConfig?.icon}</span>
              <div className="flex-1">
                <CardTitle className="text-lg">{list.title}</CardTitle>
                {list.description && (
                  <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                )}
              </div>
            </div>
            {isProject && list.priority && (
              <div className={`w-3 h-3 rounded-full ${getPriorityColor(list.priority)}`}></div>
            )}
          </div>
          
          {/* Project Status & Assignee */}
          {isProject && (
            <div className="flex items-center justify-between mt-3">
              {list.status && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(list.status)}`}>
                  {list.status}
                </span>
              )}
              {list.assignee && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  {list.assignee === 'Both' ? <Users className="h-3 w-3" /> : <User className="h-3 w-3" />}
                  <span className="text-xs">{list.assignee}</span>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span>{list.item_count} {isProject ? 'tasks' : 'items'}</span>
            <span>{list.checked_count} completed</span>
          </div>
          
          {list.item_count > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Project-specific info */}
          {isProject && (
            <div className="space-y-2 mb-3">
              {list.timeSpent !== undefined && list.estimatedTime && (
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Time: {formatTime(list.timeSpent)} / {formatTime(list.estimatedTime)}</span>
                  </div>
                </div>
              )}
              
              {list.dueDate && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Calendar className="h-3 w-3" />
                  <span>Due: {new Date(list.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {list.tags && list.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {list.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                >
                  {tag}
                </span>
              ))}
              {list.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{list.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Project Timer Controls */}
          {isProject && onStartTimer && (
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-gray-500">
                Updated {new Date(list.last_updated).toLocaleDateString()}
              </div>
              {list.status !== 'completed' && !isTimerRunning && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartTimer(list.id.toString());
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                >
                  <Play className="h-3 w-3" />
                  Start
                </button>
              )}
              {activeTimerProject === list.id.toString() && (
                <div className="flex items-center gap-1 bg-green-100 text-green-700 rounded px-2 py-1">
                  <Timer className="h-3 w-3" />
                  <span className="text-xs">Running</span>
                </div>
              )}
            </div>
          )}
          
          {!isProject && (
            <div className="text-xs text-gray-500">
              Updated {new Date(list.last_updated).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
});

ListCard.displayName = 'ListCard';

// 🚀 PERFORMANCE: Memoized ListItem component
const ListItemCard = memo(({ 
  item, 
  onToggle, 
  onDelete 
}: { 
  item: ListItem; 
  onToggle: (id: number, checked: boolean) => void;
  onDelete?: (id: number) => void;
}) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 flex-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(item.id, item.checked)}
        >
          {item.checked ? (
            <CheckSquare className="w-5 h-5 text-green-600" />
          ) : (
            <Square className="w-5 h-5 text-gray-400" />
          )}
        </Button>
        
        <div className="flex-1">
          <div className={`text-lg ${item.checked ? 'line-through text-gray-500' : ''}`}>
            {item.content}
          </div>
          
          {item.details?.quantity && (
            <div className="text-sm text-gray-600 mt-1">
              Quantity: {item.details.quantity}
            </div>
          )}
          
          {item.tags.length > 0 && (
            <div className="flex space-x-1 mt-2">
              {item.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {onDelete && (
        <Button 
          variant="ghost" 
          size="sm"
          className="text-red-600 hover:text-red-800"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  </Card>
));

ListItemCard.displayName = 'ListItemCard';

function EnhancedListsManager() {
  const [lists, setLists] = useState<List[]>([]);
  const [selectedList, setSelectedList] = useState<List | null>(null);
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  
  // Project-specific state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTimerProject, setActiveTimerProject] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && activeTimerProject) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTimerProject]);

  // Project timer functions
  const startTimer = useCallback((listId: string) => {
    setActiveTimerProject(listId);
    setIsTimerRunning(true);
    setCurrentTime(0);
    
    setLists(prev => prev.map(list => 
      list.id === parseInt(listId) 
        ? { ...list, status: 'active' as const }
        : list
    ));
  }, []);

  const stopTimer = useCallback(() => {
    if (activeTimerProject && currentTime > 0) {
      setLists(prev => prev.map(list => 
        list.id === parseInt(activeTimerProject) 
          ? { ...list, timeSpent: (list.timeSpent || 0) + Math.floor(currentTime / 60) }
          : list
      ));
    }
    setIsTimerRunning(false);
    setActiveTimerProject(null);
    setCurrentTime(0);
  }, [activeTimerProject, currentTime]);

  const formatTimerTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 🚀 PERFORMANCE: Memoize mock data to prevent recreation
  const mockLists = useMemo<List[]>(() => [
    {
      id: 1,
      title: 'Weekly Groceries',
      type: 'grocery',
      description: 'Our weekly grocery shopping list',
      icon: '🛒',
      color: '#22c55e',
      item_count: 8,
      checked_count: 3,
      last_updated: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Family Chores',
      type: 'chores',
      description: 'Weekly household tasks',
      icon: '✅',
      color: '#06b6d4',
      item_count: 12,
      checked_count: 7,
      last_updated: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Life Goals',
      type: 'goals',
      description: 'Our family aspirations',
      icon: '🎯',
      color: '#f59e0b',
      item_count: 5,
      checked_count: 2,
      last_updated: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Kitchen Renovation Planning',
      type: 'home_project',
      description: 'Research contractors, finalize design, create budget spreadsheet',
      icon: '🏠',
      color: '#f97316',
      item_count: 4,
      checked_count: 2,
      last_updated: new Date().toISOString(),
      status: 'active',
      priority: 'high',
      progress: 65,
      dueDate: '2024-12-15',
      timeSpent: 480,
      estimatedTime: 720,
      assignee: 'Mom',
      tags: ['home', 'renovation', 'budget']
    },
    {
      id: 5,
      title: 'Holiday Party Planning',
      type: 'event_planning',
      description: 'Organize annual family holiday gathering',
      icon: '🎉',
      color: '#ec4899',
      item_count: 4,
      checked_count: 1,
      last_updated: new Date().toISOString(),
      status: 'active',
      priority: 'medium',
      progress: 40,
      dueDate: '2024-12-20',
      timeSpent: 180,
      estimatedTime: 360,
      assignee: 'Mom',
      tags: ['holiday', 'family', 'party']
    },
    {
      id: 6,
      title: 'Kids School Project Support',
      type: 'kids_project',
      description: 'Help Emma with science fair project on renewable energy',
      icon: '👨‍👩‍👧‍👦',
      color: '#8b5cf6',
      item_count: 4,
      checked_count: 2,
      last_updated: new Date().toISOString(),
      status: 'active',
      priority: 'high',
      progress: 80,
      dueDate: '2024-12-12',
      timeSpent: 240,
      estimatedTime: 300,
      assignee: 'Dad',
      tags: ['school', 'science', 'emma']
    }
  ], []);

  const mockItems = useMemo<ListItem[]>(() => [
    {
      id: 1,
      content: 'Buy organic bananas',
      details: { quantity: '2 bunches', category: 'Produce' },
      checked: false,
      position: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['produce', 'organic']
    },
    {
      id: 2,
      content: 'Milk (whole, organic)',
      details: { quantity: '1 gallon', category: 'Dairy' },
      checked: true,
      position: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['dairy', 'organic']
    }
  ], []);

  // 🚀 PERFORMANCE: Load data only once with useEffect
  useEffect(() => {
    setLists(mockLists);
    setLoading(false);
  }, [mockLists]);

  // 🚀 PERFORMANCE: Debounced search to reduce re-renders
  const debouncedSearchTerm = useMemo(() => {
    const debouncer = createOptimizedDebounce((term: string) => term, 300);
    return debouncer(searchTerm);
  }, [searchTerm]);

  // 🚀 PERFORMANCE: Memoized filtered lists to prevent recalculation
  const filteredLists = useMemo(() => 
    lists.filter(list => {
      const matchesSearch = list.title.toLowerCase().includes((debouncedSearchTerm || '').toLowerCase());
      const matchesStatus = statusFilter === 'all' || list.status === statusFilter || (!list.status && statusFilter === 'all');
      return matchesSearch && matchesStatus;
    }), [lists, debouncedSearchTerm, statusFilter]);

  // 🚀 PERFORMANCE: Memoized grouped lists
  const groupedLists = useMemo(() => {
    return filteredLists.reduce((acc, list) => {
      const listConfig = LIST_TYPES[list.type as keyof typeof LIST_TYPES];
      const category = listConfig?.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(list);
      return acc;
    }, {} as Record<string, List[]>);
  }, [filteredLists]);

  // 🚀 PERFORMANCE: Optimized callbacks with useCallback
  const toggleItemChecked = useCallback((itemId: number, checked: boolean) => {
    setListItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, checked: !checked } : item
      )
    );
  }, []);

  const handleListSelect = useCallback((list: List) => {
    setSelectedList(list);
    if (list.id === 1) {
      setListItems(mockItems);
    } else {
      setListItems([]);
    }
  }, [mockItems]);

  const addItem = useCallback(() => {
    if (!newItemContent.trim() || !selectedList) return;

    const newItem: ListItem = {
      id: Date.now(),
      content: newItemContent,
      details: {},
      checked: false,
      position: listItems.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: []
    };

    setListItems(items => [...items, newItem]);
    setNewItemContent('');
  }, [newItemContent, selectedList, listItems.length]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleNewItemChange = useCallback((value: string) => {
    setNewItemContent(value);
  }, []);

  const handleBackToLists = useCallback(() => {
    setSelectedList(null);
    setListItems([]);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Lists & Projects</h1>
          <p className="text-gray-600">
            Organize everything your household needs - from groceries to major projects
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
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' 
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
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New List
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search lists and projects..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        
        {/* Status Filter for Projects */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Project Stats Overview */}
      {lists.some(list => LIST_TYPES[list.type as keyof typeof LIST_TYPES]?.isProject) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lists.filter(list => list.status === 'active' && LIST_TYPES[list.type as keyof typeof LIST_TYPES]?.isProject).length}
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
                  {lists.filter(list => list.status === 'completed' && LIST_TYPES[list.type as keyof typeof LIST_TYPES]?.isProject).length}
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
                  {Math.round(lists.reduce((total, list) => total + (list.timeSpent || 0), 0) / 60)}h
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
                  {Math.round(lists.filter(list => LIST_TYPES[list.type as keyof typeof LIST_TYPES]?.isProject).reduce((total, list) => total + (list.progress || 0), 0) / Math.max(1, lists.filter(list => LIST_TYPES[list.type as keyof typeof LIST_TYPES]?.isProject).length))}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lists Grid */}
      {selectedList ? (
        // Selected List View
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleBackToLists}
              >
                ← Back to Lists
              </Button>
              <span className="text-2xl">{selectedList.icon}</span>
              <div>
                <h2 className="text-2xl font-bold">{selectedList.title}</h2>
                {selectedList.description && (
                  <p className="text-gray-600">{selectedList.description}</p>
                )}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Add new item..."
                value={newItemContent}
                onChange={handleNewItemChange}
              />
              <Button onClick={addItem} disabled={!newItemContent.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* List Items */}
          <div className="space-y-2">
            {listItems.map((item) => (
              <ListItemCard
                key={item.id}
                item={item}
                onToggle={toggleItemChecked}
              />
            ))}
            
            {listItems.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium mb-2">No items yet</h3>
                <p>Add your first item to get started!</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Lists Overview
        <div>
          {Object.entries(groupedLists).map(([category, categoryLists]) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryLists.map((list) => {
                  const listConfig = LIST_TYPES[list.type as keyof typeof LIST_TYPES];
                  const progress = list.item_count > 0 ? (list.checked_count / list.item_count) * 100 : 0;
                  
                  return (
                    <ListCard
                      key={list.id}
                      list={list}
                      listConfig={listConfig}
                      progress={progress}
                      onSelect={handleListSelect}
                      onStartTimer={startTimer}
                      isTimerRunning={isTimerRunning}
                      activeTimerProject={activeTimerProject}
                    />
                  );
                })}
              </div>
            </div>
          ))}
          
          {filteredLists.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2">No lists found</h3>
              <p>Create your first list to get organized!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 🚀 PERFORMANCE: Export memoized component
export default memo(EnhancedListsManager);