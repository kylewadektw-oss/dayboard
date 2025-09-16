/**
 * Real-Time Analytics Chart Component
 * Displays live user interaction data and engagement metrics
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  labels: string[];
  datasets: Array<{
    label?: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
    tension?: number;
    borderWidth?: number;
    [key: string]: unknown;
  }>;
}

interface RealTimeChartProps {
  type: 'line' | 'bar' | 'doughnut';
  title: string;
  dataSource: string;
  updateInterval?: number;
  height?: number;
  showLegend?: boolean;
  className?: string;
}

export default function RealTimeChart({
  type,
  title,
  dataSource,
  updateInterval = 5000,
  height = 300,
  showLegend = true,
  className = ''
}: RealTimeChartProps) {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate mock real-time data based on type
  const generateMockData = useCallback((): ChartData => {
    const now = new Date();
    const labels = Array.from({ length: 10 }, (_, i) => {
      const time = new Date(now.getTime() - (9 - i) * 60000);
      return time.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    switch (type) {
      case 'line':
        return {
          labels,
          datasets: [
            {
              label: 'Active Users',
              data: Array.from(
                { length: 10 },
                () => Math.floor(Math.random() * 100) + 20
              ),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'Page Views',
              data: Array.from(
                { length: 10 },
                () => Math.floor(Math.random() * 200) + 50
              ),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true,
              tension: 0.4
            }
          ]
        };

      case 'bar':
        return {
          labels: [
            'Entertainment',
            'Lists',
            'Dashboard',
            'Profile',
            'Settings'
          ],
          datasets: [
            {
              label: 'Page Visits',
              data: Array.from(
                { length: 5 },
                () => Math.floor(Math.random() * 500) + 100
              ),
              backgroundColor: [
                '#3b82f6',
                '#10b981',
                '#f59e0b',
                '#ef4444',
                '#8b5cf6'
              ],
              borderWidth: 0
            }
          ]
        };

      case 'doughnut':
        return {
          labels: ['Mobile', 'Desktop', 'Tablet'],
          datasets: [
            {
              data: [
                Math.floor(Math.random() * 40) + 30,
                Math.floor(Math.random() * 40) + 40,
                Math.floor(Math.random() * 20) + 10
              ],
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }
          ]
        };

      default:
        return { labels: [], datasets: [] };
    }
  }, [type]);

  // Update chart data
  const updateData = useCallback(() => {
    setChartData(generateMockData());
    setIsLoading(false);
  }, [generateMockData]);

  // Set up real-time updates
  useEffect(() => {
    updateData(); // Initial load

    intervalRef.current = setInterval(updateData, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [updateInterval, updateData]);

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false
      }
    },
    scales:
      type !== 'doughnut'
        ? {
            x: {
              display: true,
              grid: {
                display: false
              }
            },
            y: {
              display: true,
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            }
          }
        : undefined,
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    },
    animation: {
      duration: 750,
      easing: 'easeInOutQuart' as const
    }
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'bar':
        return <Bar data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      <div style={{ height: `${height}px` }}>{renderChart()}</div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Updates every {updateInterval / 1000} seconds • Data Source:{' '}
        {dataSource}
      </div>
    </div>
  );
}
