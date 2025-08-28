export default function Daycare() {
  const photos = [
    { id: 1, title: "Art Class Fun", date: "Today", emoji: "🎨" },
    { id: 2, title: "Playground Time", date: "Yesterday", emoji: "🛝" },
    { id: 3, title: "Story Circle", date: "2 days ago", emoji: "📚" },
    { id: 4, title: "Music & Dance", date: "3 days ago", emoji: "🎵" },
    { id: 5, title: "Science Experiment", date: "4 days ago", emoji: "🔬" },
    { id: 6, title: "Snack Time", date: "5 days ago", emoji: "🍎" },
    { id: 7, title: "Outdoor Games", date: "1 week ago", emoji: "⚽" },
    { id: 8, title: "Building Blocks", date: "1 week ago", emoji: "🧱" },
  ];

  const announcements = [
    { id: 1, title: "Picture Day Next Friday", content: "Don't forget to send your little one in their best outfit!", type: "reminder" },
    { id: 2, title: "Holiday Party Planning", content: "We're planning our holiday celebration. Volunteers needed for snacks!", type: "event" },
    { id: 3, title: "New Art Supplies", content: "Thank you to the Johnson family for donating new art supplies!", type: "thanks" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daycare Updates</h1>
          <p className="text-gray-600">Stay connected with your child's day</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Photo Gallery */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Photos</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="bg-gray-100 rounded-lg aspect-square flex flex-col items-center justify-center p-4 hover:bg-gray-200 transition-colors cursor-pointer">
                      <div className="text-4xl mb-2">{photo.emoji}</div>
                      <div className="text-sm font-medium text-gray-900 text-center">{photo.title}</div>
                      <div className="text-xs text-gray-500">{photo.date}</div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View All Photos
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Report */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Today's Report</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Meals */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Meals</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm">Breakfast: 100%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span className="text-sm">Lunch: 80%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-500">⏳</span>
                        <span className="text-sm">Snack: Upcoming</span>
                      </div>
                    </div>
                  </div>

                  {/* Activities */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Activities</h3>
                    <div className="space-y-2">
                      <div className="text-sm">• Art & Crafts</div>
                      <div className="text-sm">• Circle Time</div>
                      <div className="text-sm">• Outdoor Play</div>
                      <div className="text-sm">• Reading Corner</div>
                    </div>
                  </div>

                  {/* Mood */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Mood & Notes</h3>
                    <div className="space-y-2">
                      <div className="text-2xl">😊</div>
                      <div className="text-sm text-gray-600">
                        Emma had a great day! She especially enjoyed the art activity and made a beautiful painting.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Announcements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className={`p-4 rounded-lg ${
                    announcement.type === 'reminder' ? 'bg-yellow-50 border border-yellow-200' :
                    announcement.type === 'event' ? 'bg-blue-50 border border-blue-200' :
                    'bg-green-50 border border-green-200'
                  }`}>
                    <h3 className="font-medium text-gray-900 mb-2">{announcement.title}</h3>
                    <p className="text-sm text-gray-600">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              
              <div className="p-6 space-y-3">
                <button className="w-full bg-blue-100 text-blue-700 p-3 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium">
                  📱 Message Teacher
                </button>
                <button className="w-full bg-green-100 text-green-700 p-3 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium">
                  📅 View Calendar
                </button>
                <button className="w-full bg-purple-100 text-purple-700 p-3 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium">
                  📄 Download Report
                </button>
                <button className="w-full bg-orange-100 text-orange-700 p-3 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium">
                  ⚙️ Update Preferences
                </button>
              </div>
            </div>

            {/* Pickup Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">This Week's Schedule</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Monday</span>
                    <span className="text-sm font-medium">5:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Tuesday</span>
                    <span className="text-sm font-medium">5:00 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Wednesday</span>
                    <span className="text-sm font-medium">5:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Thursday</span>
                    <span className="text-sm font-medium">4:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600">Friday</span>
                    <span className="text-sm font-medium">5:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
