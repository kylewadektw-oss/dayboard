import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  CheckSquare,
  Square,
  Plus,
  User,
  Clock,
  Star,
  Trophy,
  Gift,
  AlertCircle
} from 'lucide-react';

interface ChoreItem {
  id: number;
  content: string;
  details: {
    frequency?: 'daily' | 'weekly' | 'monthly' | 'custom';
    points?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    estimated_time?: number; // minutes
    room?: string;
    tools_needed?: string[];
  };
  checked: boolean;
  assigned_to?: string;
  due_date?: string;
  priority?: string;
  tags: string[];
}

interface ChoreListTemplateProps {
  items: ChoreItem[];
  onToggleItem: (id: number, checked: boolean) => void;
  onAddItem: (item: Partial<ChoreItem>) => void;
  onUpdateItem: (id: number, updates: Partial<ChoreItem>) => void;
  onDeleteItem: (id: number) => void;
  householdMembers?: Array<{ id: string; name: string; age?: number }>;
}

const CHORE_CATEGORIES = [
  { name: 'Kitchen', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
  { name: 'Living Room', icon: '🛋️', color: 'bg-blue-100 text-blue-800' },
  { name: 'Bathroom', icon: '🚿', color: 'bg-cyan-100 text-cyan-800' },
  { name: 'Bedroom', icon: '🛏️', color: 'bg-purple-100 text-purple-800' },
  { name: 'Laundry', icon: '👕', color: 'bg-green-100 text-green-800' },
  { name: 'Outdoor', icon: '🌿', color: 'bg-emerald-100 text-emerald-800' },
  { name: 'General', icon: '🏠', color: 'bg-gray-100 text-gray-800' }
];

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800'
};

const FREQUENCY_ICONS = {
  daily: '📅',
  weekly: '🗓️',
  monthly: '📆',
  custom: '⚙️'
};

export default function ChoreListTemplate({
  items,
  onToggleItem,
  onAddItem
  // onUpdateItem, onDeleteItem - coming soon
  // householdMembers - coming soon
}: ChoreListTemplateProps) {
  const [newChoreName, setNewChoreName] = React.useState('');
  const [newChoreRoom, setNewChoreRoom] = React.useState('');
  const [newChoreFrequency, setNewChoreFrequency] = React.useState<
    'daily' | 'weekly' | 'monthly' | 'custom'
  >('weekly');
  const [newChorePoints, setNewChorePoints] = React.useState('10');
  const [newChoreDifficulty, setNewChoreDifficulty] = React.useState<
    'easy' | 'medium' | 'hard'
  >('medium');
  const [newChoreEstimatedTime, setNewChoreEstimatedTime] =
    React.useState('15');
  const [showQuickAdd, setShowQuickAdd] = React.useState(false);

  // Group items by room/category
  const groupedItems = items.reduce(
    (acc, item) => {
      const room = item.details.room || 'General';
      if (!acc[room]) acc[room] = [];
      acc[room].push(item);
      return acc;
    },
    {} as Record<string, ChoreItem[]>
  );

  // Calculate stats
  const totalChores = items.length;
  const completedChores = items.filter((item) => item.checked).length;
  const totalPoints = items.reduce((sum, item) => {
    return sum + (item.checked ? item.details.points || 0 : 0);
  }, 0);
  const maxPoints = items.reduce(
    (sum, item) => sum + (item.details.points || 0),
    0
  );

  const addChore = () => {
    if (!newChoreName.trim()) return;

    onAddItem({
      content: newChoreName,
      details: {
        frequency: newChoreFrequency,
        points: parseInt(newChorePoints) || 10,
        difficulty: newChoreDifficulty,
        estimated_time: parseInt(newChoreEstimatedTime) || 15,
        room: newChoreRoom
      },
      checked: false,
      tags: [newChoreFrequency, newChoreDifficulty]
    });

    setNewChoreName('');
    setNewChoreRoom('');
    setNewChorePoints('10');
    setNewChoreEstimatedTime('15');
    setShowQuickAdd(false);
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '⭐';
      case 'medium':
        return '⭐⭐';
      case 'hard':
        return '⭐⭐⭐';
      default:
        return '⭐';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with family chore stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckSquare className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle>Family Chore Dashboard</CardTitle>
                <p className="text-sm text-gray-600">
                  Building responsibility and teamwork, one task at a time
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {totalPoints}
              </div>
              <p className="text-sm text-gray-600">points earned</p>
            </div>
          </div>

          {/* Progress stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {completedChores}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-600">
                {totalChores - completedChores}
              </div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-600">
                {maxPoints}
              </div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-blue-600">
                {totalChores > 0
                  ? Math.round((completedChores / totalChores) * 100)
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Family Progress</span>
              <span>
                {totalChores > 0
                  ? Math.round((completedChores / totalChores) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{
                  width: `${totalChores > 0 ? (completedChores / totalChores) * 100 : 0}%`
                }}
              ></div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Add Chore */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Add New Chore</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickAdd(!showQuickAdd)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Chore
            </Button>
          </div>
        </CardHeader>

        {showQuickAdd && (
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Chore name (e.g., Take out trash)"
                  value={newChoreName}
                  onChange={(value) => setNewChoreName(value)}
                />

                <select
                  value={newChoreRoom}
                  onChange={(e) => setNewChoreRoom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Room</option>
                  {CHORE_CATEGORIES.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Frequency
                  </label>
                  <select
                    value={newChoreFrequency}
                    onChange={(e) =>
                      setNewChoreFrequency(
                        e.target.value as
                          | 'daily'
                          | 'weekly'
                          | 'monthly'
                          | 'custom'
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="daily">📅 Daily</option>
                    <option value="weekly">🗓️ Weekly</option>
                    <option value="monthly">📆 Monthly</option>
                    <option value="custom">⚙️ Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newChoreDifficulty}
                    onChange={(e) =>
                      setNewChoreDifficulty(
                        e.target.value as 'easy' | 'medium' | 'hard'
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="easy">⭐ Easy</option>
                    <option value="medium">⭐⭐ Medium</option>
                    <option value="hard">⭐⭐⭐ Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Points
                  </label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={newChorePoints}
                    onChange={(value) => setNewChorePoints(value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Time (min)
                  </label>
                  <Input
                    type="number"
                    placeholder="15"
                    value={newChoreEstimatedTime}
                    onChange={(value) => setNewChoreEstimatedTime(value)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowQuickAdd(false)}
                >
                  Cancel
                </Button>
                <Button onClick={addChore} disabled={!newChoreName.trim()}>
                  Add Chore
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Chores by Room */}
      <div className="space-y-4">
        {Object.entries(groupedItems).map(([roomName, roomChores]) => {
          const roomConfig = CHORE_CATEGORIES.find((c) => c.name === roomName);

          return (
            <Card key={roomName}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{roomConfig?.icon || '🏠'}</span>
                    <div>
                      <h3 className="font-semibold">{roomName}</h3>
                      <p className="text-sm text-gray-600">
                        {roomChores.filter((chore) => chore.checked).length} of{' '}
                        {roomChores.length} complete
                      </p>
                    </div>
                  </div>

                  {roomConfig && (
                    <Badge className={roomConfig.color}>{roomName}</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {roomChores.map((chore) => (
                    <div
                      key={chore.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleItem(chore.id, chore.checked)}
                        >
                          {chore.checked ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </Button>

                        <div className="flex-1">
                          <div
                            className={`font-medium ${chore.checked ? 'line-through text-gray-500' : ''}`}
                          >
                            {chore.content}
                          </div>

                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            {chore.details.frequency && (
                              <span className="flex items-center">
                                {FREQUENCY_ICONS[chore.details.frequency]}
                                <span className="ml-1 capitalize">
                                  {chore.details.frequency}
                                </span>
                              </span>
                            )}

                            {chore.details.difficulty && (
                              <Badge
                                className={
                                  DIFFICULTY_COLORS[chore.details.difficulty]
                                }
                              >
                                {getDifficultyIcon(chore.details.difficulty)}{' '}
                                {chore.details.difficulty}
                              </Badge>
                            )}

                            {chore.details.points && (
                              <span className="flex items-center text-purple-600">
                                <Star className="w-3 h-3 mr-1" />
                                {chore.details.points} pts
                              </span>
                            )}

                            {chore.details.estimated_time && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {chore.details.estimated_time}m
                              </span>
                            )}

                            {chore.assigned_to && (
                              <span className="flex items-center">
                                <User className="w-3 h-3 mr-1" />
                                {chore.assigned_to}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {chore.checked && (
                        <div className="flex items-center text-green-600">
                          <Trophy className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">
                            +{chore.details.points || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Family Motivation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Gift className="w-5 h-5 mr-2" />
            Family Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-medium">Weekly Goal</div>
              <div className="text-sm text-gray-600">
                Complete all daily chores
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Star className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-medium">Point Milestone</div>
              <div className="text-sm text-gray-600">
                {totalPoints} / 100 points this week
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <AlertCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium">Team Work</div>
              <div className="text-sm text-gray-600">
                Everyone contributing!
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
