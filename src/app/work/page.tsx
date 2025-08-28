export default function Work() {
  const tasks = [
    { id: 1, title: "Quarterly budget review", priority: "high", dueDate: "Today", completed: false, project: "Finance" },
    { id: 2, title: "Team meeting preparation", priority: "medium", dueDate: "Tomorrow", completed: false, project: "Management" },
    { id: 3, title: "Client presentation slides", priority: "high", dueDate: "Wednesday", completed: false, project: "Sales" },
    { id: 4, title: "Code review - Feature X", priority: "medium", dueDate: "Thursday", completed: true, project: "Development" },
    { id: 5, title: "Update project documentation", priority: "low", dueDate: "Friday", completed: false, project: "Development" },
    { id: 6, title: "Employee performance reviews", priority: "medium", dueDate: "Next week", completed: false, project: "HR" },
  ];

  const meetings = [
    { id: 1, title: "Daily Standup", time: "9:00 AM", duration: "30 min", type: "recurring" },
    { id: 2, title: "Client Check-in", time: "11:00 AM", duration: "1 hour", type: "meeting" },
    { id: 3, title: "Lunch Break", time: "12:00 PM", duration: "1 hour", type: "break" },
    { id: 4, title: "Project Planning", time: "2:00 PM", duration: "2 hours", type: "meeting" },
    { id: 5, title: "1:1 with Manager", time: "4:00 PM", duration: "30 min", type: "meeting" },
  ];

  const projects = [
    { id: 1, name: "Website Redesign", progress: 75, dueDate: "March 15", status: "on-track" },
    { id: 2, name: "Mobile App Launch", progress: 40, dueDate: "April 30", status: "at-risk" },
    { id: 3, name: "Q1 Marketing Campaign", progress: 90, dueDate: "March 31", status: "ahead" },
    { id: 4, name: "API Integration", progress: 25, dueDate: "May 15", status: "on-track" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Dashboard</h1>
          <p className="text-gray-600">Manage your tasks, meetings, and projects</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tasks Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">My Tasks</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    + Add Task
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className={`flex items-center space-x-4 p-4 rounded-lg border ${
                      task.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                    }`}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        readOnly
                      />
                      <div className="flex-1">
                        <div className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-600">{task.project}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">{task.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Active Projects</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          project.status === 'ahead' ? 'bg-green-100 text-green-700' :
                          project.status === 'at-risk' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              project.status === 'ahead' ? 'bg-green-500' :
                              project.status === 'at-risk' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`}
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        Due: {project.dueDate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  {meetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        meeting.type === 'meeting' ? 'bg-blue-500' :
                        meeting.type === 'recurring' ? 'bg-green-500' :
                        'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{meeting.title}</div>
                        <div className="text-xs text-gray-500">{meeting.time} • {meeting.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  View Full Calendar
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tasks Completed</span>
                  <span className="text-lg font-semibold text-green-600">
                    {tasks.filter(t => t.completed).length}/{tasks.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Meetings Today</span>
                  <span className="text-lg font-semibold text-blue-600">{meetings.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Projects</span>
                  <span className="text-lg font-semibold text-purple-600">{projects.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hours Logged</span>
                  <span className="text-lg font-semibold text-orange-600">6.5h</span>
                </div>
              </div>
            </div>

            {/* Calendar Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">March 2025</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                  <div>Su</div>
                  <div>Mo</div>
                  <div>Tu</div>
                  <div>We</div>
                  <div>Th</div>
                  <div>Fr</div>
                  <div>Sa</div>
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 5; // Start from the 1st
                    const isCurrentMonth = day > 0 && day <= 31;
                    const isToday = day === 15; // Mock today as 15th
                    const hasEvent = [3, 8, 12, 20, 25].includes(day);
                    
                    return (
                      <div key={i} className={`aspect-square flex items-center justify-center text-sm ${
                        !isCurrentMonth ? 'text-gray-300' :
                        isToday ? 'bg-blue-600 text-white rounded-full' :
                        hasEvent ? 'bg-blue-100 text-blue-700 rounded' :
                        'text-gray-700 hover:bg-gray-100 rounded'
                      }`}>
                        {isCurrentMonth ? day : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              
              <div className="p-6 space-y-3">
                <button className="w-full bg-blue-100 text-blue-700 p-3 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                  📋 Create Task
                </button>
                <button className="w-full bg-green-100 text-green-700 p-3 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                  📅 Schedule Meeting
                </button>
                <button className="w-full bg-purple-100 text-purple-700 p-3 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                  ⏰ Log Hours
                </button>
                <button className="w-full bg-orange-100 text-orange-700 p-3 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium">
                  📊 View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
