'use client'

import { useEffect, useState } from 'react'

interface EnvironmentStatus {
  name: string
  url: string
  status: 'online' | 'offline' | 'checking'
  lastCheck: string
  responseTime?: number
}

export default function EnterpriseDashboard() {
  const [environments, setEnvironments] = useState<EnvironmentStatus[]>([
    { name: 'Production', url: 'https://dayboard.bentlolabs.com', status: 'checking', lastCheck: '' },
    { name: 'Stashhouse', url: 'https://stashhouse.dayboard.bentlolabs.com', status: 'checking', lastCheck: '' },
  ])

  const [monitoringData, setMonitoringData] = useState<any[]>([])

  useEffect(() => {
    checkEnvironments()
    const interval = setInterval(checkEnvironments, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const checkEnvironments = async () => {
    const updatedEnvironments = await Promise.all(
      environments.map(async (env) => {
        try {
          const startTime = Date.now()
          const response = await fetch(`${env.url}/api/bentlolabs-monitor`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache' }
          })
          const responseTime = Date.now() - startTime
          
          return {
            ...env,
            status: response.ok ? 'online' as const : 'offline' as const,
            lastCheck: new Date().toLocaleTimeString(),
            responseTime: response.ok ? responseTime : undefined
          }
        } catch (error) {
          return {
            ...env,
            status: 'offline' as const,
            lastCheck: new Date().toLocaleTimeString()
          }
        }
      })
    )
    setEnvironments(updatedEnvironments)
  }

  return (
    <div className="enterprise-dashboard">
      <div className="dashboard-header">
        <h1>🏢 Bentlolabs Enterprise Overview</h1>
        <p>Comprehensive monitoring and management for your web ecosystem</p>
      </div>

      <div className="dashboard-grid">
        {/* Environment Status */}
        <div className="dashboard-card">
          <h2>🌐 Environment Status</h2>
          <div className="environment-list">
            {environments.map((env) => (
              <div key={env.name} className={`environment-item ${env.status}`}>
                <div className="env-header">
                  <span className="env-name">{env.name}</span>
                  <span className={`status-badge ${env.status}`}>
                    {env.status === 'online' ? '✅' : env.status === 'offline' ? '❌' : '⏳'}
                    {env.status}
                  </span>
                </div>
                <div className="env-details">
                  <span className="env-url">{env.url}</span>
                  {env.responseTime && (
                    <span className="response-time">{env.responseTime}ms</span>
                  )}
                </div>
                <div className="env-footer">
                  <span className="last-check">Last check: {env.lastCheck}</span>
                  <a href={env.url} target="_blank" className="visit-link">Visit →</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <h2>🚀 Quick Actions</h2>
          <div className="action-grid">
            <a href="/logs-dashboard" className="action-button logs">
              📊 Logs Dashboard
              <span>View system logs and debug info</span>
            </a>
            <a href="/dayboard" className="action-button app">
              🏠 Dayboard App
              <span>Access the main application</span>
            </a>
            <a href="/enterprise/monitoring" className="action-button monitor">
              📈 Deep Monitoring
              <span>Performance metrics and analytics</span>
            </a>
            <a href="/enterprise/deployments" className="action-button deploy">
              🔄 Deployments
              <span>Manage branch deployments</span>
            </a>
          </div>
        </div>

        {/* System Health */}
        <div className="dashboard-card full-width">
          <h2>💓 System Health Overview</h2>
          <div className="health-metrics">
            <div className="metric">
              <span className="metric-label">Active Environments</span>
              <span className="metric-value">{environments.filter(e => e.status === 'online').length}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Average Response Time</span>
              <span className="metric-value">
                {Math.round(environments
                  .filter(e => e.responseTime)
                  .reduce((avg, e) => avg + (e.responseTime || 0), 0) / environments.length) || 0}ms
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Last Updated</span>
              <span className="metric-value">{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Monitoring Status</span>
              <span className="metric-value">🟢 Active</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .enterprise-dashboard {
          padding: 2rem;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .dashboard-header h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .dashboard-header p {
          font-size: 1.1rem;
          opacity: 0.8;
          margin: 0;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .dashboard-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 1rem;
          padding: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .dashboard-card.full-width {
          grid-column: 1 / -1;
        }

        .dashboard-card h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .environment-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1rem;
          border-left: 4px solid;
        }

        .environment-item.online {
          border-left-color: #10b981;
        }

        .environment-item.offline {
          border-left-color: #ef4444;
        }

        .environment-item.checking {
          border-left-color: #f59e0b;
        }

        .env-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .env-name {
          font-weight: 600;
          font-size: 1.1rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.online {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }

        .status-badge.offline {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .status-badge.checking {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .env-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .env-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .visit-link {
          color: #60a5fa;
          text-decoration: none;
          font-weight: 500;
        }

        .visit-link:hover {
          text-decoration: underline;
        }

        .action-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .action-button {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          padding: 1.5rem 1rem;
          text-decoration: none;
          color: white;
          text-align: center;
          transition: all 0.2s;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .action-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .action-button span {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .health-metrics {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .metric {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 0.75rem;
        }

        .metric-label {
          display: block;
          font-size: 0.8rem;
          opacity: 0.7;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .action-grid {
            grid-template-columns: 1fr;
          }

          .health-metrics {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  )
}