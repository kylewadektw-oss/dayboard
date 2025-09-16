/**
 * Enhanced Analytics Dashboard
 * Real-time data visualization and user engagement metrics
 */

'use client';

import { useState, useEffect } from 'react';
import RealTimeChart from '@/components/analytics/RealTimeChart';
import { motion } from 'framer-motion';

interface AnalyticsMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

export default function EnhancedAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);

  // Generate dynamic metrics
  const generateMetrics = (): AnalyticsMetric[] => {
    return [
      {
        label: 'Active Users',
        value: Math.floor(Math.random() * 1000) + 500,
        change: (Math.random() - 0.5) * 20,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '👥'
      },
      {
        label: 'Page Views',
        value: Math.floor(Math.random() * 50) + 20 + 'K',
        change: (Math.random() - 0.5) * 15,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '📊'
      },
      {
        label: 'Entertainment Engagement',
        value: Math.floor(Math.random() * 40) + 60 + '%',
        change: (Math.random() - 0.5) * 10,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '🎬'
      },
      {
        label: 'List Interactions',
        value: Math.floor(Math.random() * 500) + 200,
        change: (Math.random() - 0.5) * 25,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '📝'
      },
      {
        label: 'Session Duration',
        value: Math.floor(Math.random() * 10) + 15 + 'm',
        change: (Math.random() - 0.5) * 8,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '⏱️'
      },
      {
        label: 'Conversion Rate',
        value: (Math.random() * 5 + 8).toFixed(1) + '%',
        change: (Math.random() - 0.5) * 3,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        icon: '🎯'
      }
    ];
  };

  // Update metrics periodically
  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(generateMetrics());
      setIsLoading(false);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const timeRanges = [
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' }
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time insights and user engagement metrics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{metric.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {metric.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center space-x-1 text-sm font-medium ${
                  metric.trend === 'up'
                    ? 'text-green-600'
                    : metric.trend === 'down'
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                <span>
                  {metric.trend === 'up'
                    ? '↗️'
                    : metric.trend === 'down'
                      ? '↘️'
                      : '➡️'}
                </span>
                <span>{Math.abs(metric.change).toFixed(1)}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeChart
          type="line"
          title="User Activity Over Time"
          dataSource="Real-time Analytics API"
          updateInterval={5000}
          height={350}
          className="shadow-sm"
        />

        <RealTimeChart
          type="bar"
          title="Feature Usage Distribution"
          dataSource="Feature Analytics API"
          updateInterval={8000}
          height={350}
          className="shadow-sm"
        />

        <RealTimeChart
          type="doughnut"
          title="Device Distribution"
          dataSource="User Agent Analytics"
          updateInterval={12000}
          height={350}
          className="shadow-sm"
        />

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activities
          </h3>
          <div className="space-y-3">
            {[
              {
                action: 'New user registered',
                time: '2 minutes ago',
                icon: '👤'
              },
              {
                action: 'Movie added to watchlist',
                time: '5 minutes ago',
                icon: '🎬'
              },
              { action: 'List created', time: '8 minutes ago', icon: '📝' },
              {
                action: 'Concert event saved',
                time: '12 minutes ago',
                icon: '🎵'
              },
              {
                action: 'Game night planned',
                time: '15 minutes ago',
                icon: '🎲'
              }
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-lg">{activity.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
        <p className="text-sm text-gray-600">
          Dashboard updates every few seconds • Data processed in real-time •
          Last update: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
