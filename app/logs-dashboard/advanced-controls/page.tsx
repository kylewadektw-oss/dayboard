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

/*
 * 🎛️ ADVANCED LOGS CONTROLS - Enhanced Configuration Dashboard
 *
 * PURPOSE: Advanced configuration page with sliders and controls for fine-tuning log display parameters
 *
 * FEATURES:
 * - Granular slider controls for log counts by type (INFO, WARN, ERROR, DEBUG)
 * - Browser Issues integration (CSP violations, form validation, etc.)
 * - Real-time preview of filtered results
 * - Export configuration presets
 * - Advanced filtering options with custom thresholds
 * - Performance monitoring integration
 *
 * ACCESS: Public - No authentication required (advanced configuration tool)
 *
 * TECHNICAL:
 * - Uses enhanced logger with browser issues capture
 * - Real-time slider updates with debounced filtering
 * - Local storage for configuration persistence
 * - Integration with main dashboard state
 *
 * NAVIGATION: Part of logging suite with LoggingNav sidebar
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { LogLevel, LogEntry, logger } from '@/utils/logger';
import LoggingNav from '@/components/logging/LoggingNav';

interface SliderConfig {
  maxErrors: number;
  maxWarnings: number;
  maxInfo: number;
  maxDebug: number;
  includeBrowserIssues: boolean;
  includeConsoleData: boolean;
  timeRangeHours: number;
  minSeverity: 'low' | 'medium' | 'high' | 'critical';
}

interface BrowserIssue {
  id: string;
  type:
    | 'csp_violation'
    | 'form_validation'
    | 'accessibility'
    | 'performance'
    | 'network'
    | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  source: string;
  timestamp: number;
  details?: unknown;
}

interface PreviewData {
  totalLogs: number;
  filteredLogs: {
    errors: number;
    warnings: number;
    info: number;
    debug: number;
  };
  browserIssues: {
    total: number;
    byType: {
      csp_violation: number;
      form_validation: number;
      accessibility: number;
      performance: number;
      network: number;
      security: number;
    };
    bySeverity: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  combinedTotal: number;
}

export default function AdvancedLogsControls() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [config, setConfig] = useState<SliderConfig>({
    maxErrors: 100,
    maxWarnings: 100,
    maxInfo: 100,
    maxDebug: 50,
    includeBrowserIssues: true,
    includeConsoleData: true,
    timeRangeHours: 24,
    minSeverity: 'low'
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [browserIssues, setBrowserIssues] = useState<BrowserIssue[]>([]);
  const [previewData, setPreviewData] = useState<PreviewData>({
    totalLogs: 0,
    filteredLogs: { errors: 0, warnings: 0, info: 0, debug: 0 },
    browserIssues: {
      total: 0,
      byType: {
        csp_violation: 0,
        form_validation: 0,
        accessibility: 0,
        performance: 0,
        network: 0,
        security: 0
      },
      bySeverity: { critical: 0, high: 0, medium: 0, low: 0 }
    },
    combinedTotal: 0
  });
  const [savedPresets, setSavedPresets] = useState<{
    [name: string]: SliderConfig;
  }>({});

  // Load logs and browser issues
  useEffect(() => {
    const loadData = async () => {
      try {
        const logData = await logger.getAllLogs();
        setLogs(logData || []);

        // Simulate browser issues capture - in real implementation, this would come from browser APIs
        const mockBrowserIssues: BrowserIssue[] = [
          {
            id: 'csp_1',
            type: 'csp_violation',
            severity: 'high',
            message:
              "Content Security Policy of your site blocks the use of 'eval' in JavaScript",
            source: 'browser_console',
            timestamp: Date.now() - 1000 * 60 * 30,
            details: { violatedDirective: 'script-src', blockedURI: 'eval' }
          },
          {
            id: 'form_1',
            type: 'form_validation',
            severity: 'medium',
            message: 'A form field element should have an id or name attribute',
            source: 'browser_console',
            timestamp: Date.now() - 1000 * 60 * 15,
            details: { element: 'input[type="text"]' }
          },
          {
            id: 'a11y_1',
            type: 'accessibility',
            severity: 'medium',
            message: 'No label associated with a form field',
            source: 'browser_console',
            timestamp: Date.now() - 1000 * 60 * 10,
            details: { element: 'label' }
          },
          {
            id: 'perf_1',
            type: 'performance',
            severity: 'low',
            message: 'Large bundle size detected: Component exceeds 100KB',
            source: 'performance_monitor',
            timestamp: Date.now() - 1000 * 60 * 5,
            details: { size: '125KB', component: 'LogsDashboard' }
          }
        ];
        setBrowserIssues(mockBrowserIssues);
      } catch (error) {
        console.error('Failed to load logs data:', error);
      }
    };

    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Load saved presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('logs_dashboard_presets');
    if (saved) {
      try {
        setSavedPresets(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved presets:', error);
      }
    }
  }, []);

  // Generate preview data based on current config
  const generatePreview = useCallback(() => {
    const cutoffTime = Date.now() - config.timeRangeHours * 60 * 60 * 1000;

    // Filter logs by time range - convert string timestamps to numbers for comparison
    const recentLogs = logs.filter(
      (log) => new Date(log.timestamp).getTime() >= cutoffTime
    );
    const recentIssues = browserIssues.filter(
      (issue) => new Date(issue.timestamp).getTime() >= cutoffTime
    );

    // Separate by type and apply limits
    const errorLogs = recentLogs
      .filter((log) => log.level === LogLevel.ERROR)
      .slice(0, config.maxErrors);
    const warnLogs = recentLogs
      .filter((log) => log.level === LogLevel.WARN)
      .slice(0, config.maxWarnings);
    const infoLogs = recentLogs
      .filter((log) => log.level === LogLevel.INFO)
      .slice(0, config.maxInfo);
    const debugLogs = recentLogs
      .filter((log) => log.level === LogLevel.DEBUG)
      .slice(0, config.maxDebug);

    // Filter browser issues by severity
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    const minSeverityLevel = severityOrder[config.minSeverity];
    const filteredIssues = recentIssues.filter(
      (issue) => severityOrder[issue.severity] >= minSeverityLevel
    );

    const preview = {
      totalLogs: recentLogs.length,
      filteredLogs: {
        errors: errorLogs.length,
        warnings: warnLogs.length,
        info: infoLogs.length,
        debug: debugLogs.length
      },
      browserIssues: {
        total: filteredIssues.length,
        byType: {
          csp_violation: filteredIssues.filter(
            (i) => i.type === 'csp_violation'
          ).length,
          form_validation: filteredIssues.filter(
            (i) => i.type === 'form_validation'
          ).length,
          accessibility: filteredIssues.filter(
            (i) => i.type === 'accessibility'
          ).length,
          performance: filteredIssues.filter((i) => i.type === 'performance')
            .length,
          network: filteredIssues.filter((i) => i.type === 'network').length,
          security: filteredIssues.filter((i) => i.type === 'security').length
        },
        bySeverity: {
          critical: filteredIssues.filter((i) => i.severity === 'critical')
            .length,
          high: filteredIssues.filter((i) => i.severity === 'high').length,
          medium: filteredIssues.filter((i) => i.severity === 'medium').length,
          low: filteredIssues.filter((i) => i.severity === 'low').length
        }
      },
      combinedTotal:
        config.includeConsoleData && config.includeBrowserIssues
          ? errorLogs.length +
            warnLogs.length +
            infoLogs.length +
            debugLogs.length +
            filteredIssues.length
          : config.includeConsoleData
            ? errorLogs.length +
              warnLogs.length +
              infoLogs.length +
              debugLogs.length
            : filteredIssues.length
    };

    setPreviewData(preview);
  }, [config, logs, browserIssues]);

  // Update preview when config changes
  useEffect(() => {
    generatePreview();
  }, [generatePreview]);

  const updateConfig = (key: keyof SliderConfig, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const savePreset = () => {
    const name = prompt('Enter preset name:');
    if (name && name.trim()) {
      const newPresets = { ...savedPresets, [name.trim()]: config };
      setSavedPresets(newPresets);
      localStorage.setItem(
        'logs_dashboard_presets',
        JSON.stringify(newPresets)
      );
    }
  };

  const loadPreset = (name: string) => {
    if (savedPresets[name]) {
      setConfig(savedPresets[name]);
    }
  };

  const deletePreset = (name: string) => {
    const newPresets = { ...savedPresets };
    delete newPresets[name];
    setSavedPresets(newPresets);
    localStorage.setItem('logs_dashboard_presets', JSON.stringify(newPresets));
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs_config_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const applyToDashboard = () => {
    // Save config to localStorage for main dashboard to pick up
    localStorage.setItem('logs_dashboard_config', JSON.stringify(config));
    alert(
      'Configuration applied! Go back to the main dashboard to see changes.'
    );
  };

  const testConsoleLogging = () => {
    // Simple direct logging that will be captured properly
    logger.info('✅ Test message from Advanced Controls', 'AdvancedControls');
    logger.error('❌ Test error from Advanced Controls', 'AdvancedControls');
    logger.warn('⚠️ Test warning from Advanced Controls', 'AdvancedControls');
    logger.debug('🐛 Test debug from Advanced Controls', 'AdvancedControls');

    logger.info('Object test from Advanced Controls', 'AdvancedControls', {
      test: 'data',
      timestamp: new Date(),
      config: {
        maxErrors: config.maxErrors,
        maxWarnings: config.maxWarnings,
        timeRange: config.timeRangeHours
      }
    });

    try {
      throw new Error('Test error for logging from Advanced Controls');
    } catch (error) {
      logger.error(
        'Caught error from Advanced Controls test',
        'AdvancedControls',
        {
          error: error instanceof Error ? error.message : String(error)
        }
      );
    }

    // Refresh preview to show new logs
    setTimeout(() => {
      generatePreview();
    }, 500);
  };

  const clearLogs = () => {
    logger.clearLogs();
    setLogs([]);
    generatePreview();
  };

  const exportLogs = () => {
    const logData = logger.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayboard-logs-advanced-controls-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Sidebar Navigation */}
      <LoggingNav
        variant="sidebar"
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-80'
        }`}
      >
        <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎛️ Advanced Logs Controls
            </h1>
            <p className="text-gray-600">
              Fine-tune your dashboard display with granular controls for
              console data and browser issues.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Log Count Sliders */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  📊 Log Count Limits
                </h2>

                <div className="space-y-4">
                  {/* Errors Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-red-600">
                        ❌ Max Errors
                      </label>
                      <span className="text-sm font-bold text-red-600">
                        {config.maxErrors}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="10"
                      value={config.maxErrors}
                      onChange={(e) =>
                        updateConfig('maxErrors', parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>250</span>
                      <span>500</span>
                    </div>
                  </div>

                  {/* Warnings Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-yellow-600">
                        ⚠️ Max Warnings
                      </label>
                      <span className="text-sm font-bold text-yellow-600">
                        {config.maxWarnings}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="10"
                      value={config.maxWarnings}
                      onChange={(e) =>
                        updateConfig('maxWarnings', parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>250</span>
                      <span>500</span>
                    </div>
                  </div>

                  {/* Info Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-blue-600">
                        ℹ️ Max Info
                      </label>
                      <span className="text-sm font-bold text-blue-600">
                        {config.maxInfo}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      step="25"
                      value={config.maxInfo}
                      onChange={(e) =>
                        updateConfig('maxInfo', parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>500</span>
                      <span>1000</span>
                    </div>
                  </div>

                  {/* Debug Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-600">
                        🐛 Max Debug
                      </label>
                      <span className="text-sm font-bold text-gray-600">
                        {config.maxDebug}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="5"
                      value={config.maxDebug}
                      onChange={(e) =>
                        updateConfig('maxDebug', parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>100</span>
                      <span>200</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Source Controls */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🔍 Data Sources
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Console Data
                      </label>
                      <p className="text-xs text-gray-500">
                        Include console.log, console.error, etc.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.includeConsoleData}
                      onChange={(e) =>
                        updateConfig('includeConsoleData', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Browser Issues
                      </label>
                      <p className="text-xs text-gray-500">
                        Include CSP violations, form validation, accessibility
                        issues
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.includeBrowserIssues}
                      onChange={(e) =>
                        updateConfig('includeBrowserIssues', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Time Range & Severity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  ⏰ Time Range & Severity
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-900">
                        Time Range (Hours)
                      </label>
                      <span className="text-sm font-bold text-gray-900">
                        {config.timeRangeHours}h
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="168"
                      step="1"
                      value={config.timeRangeHours}
                      onChange={(e) =>
                        updateConfig('timeRangeHours', parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1h</span>
                      <span>1d</span>
                      <span>1w</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">
                      Minimum Severity (Browser Issues)
                    </label>
                    <select
                      value={config.minSeverity}
                      onChange={(e) =>
                        updateConfig('minSeverity', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">🟢 Low (All Issues)</option>
                      <option value="medium">🟡 Medium & Above</option>
                      <option value="high">🟠 High & Critical Only</option>
                      <option value="critical">🔴 Critical Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preset Management */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  💾 Configuration Presets
                </h2>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={savePreset}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                    >
                      💾 Save Current Config
                    </button>
                    <button
                      onClick={exportConfig}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                    >
                      📁 Export Config
                    </button>
                  </div>

                  {Object.keys(savedPresets).length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        Saved Presets:
                      </h3>
                      {Object.keys(savedPresets).map((name) => (
                        <div
                          key={name}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-900">{name}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => loadPreset(name)}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              Load
                            </button>
                            <button
                              onClick={() => deletePreset(name)}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Test Controls */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  🧪 Test & Control Functions
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={testConsoleLogging}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm font-medium transition-colors"
                    >
                      🧪 Test Logging
                    </button>
                    <button
                      onClick={clearLogs}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium transition-colors"
                    >
                      🗑️ Clear Logs
                    </button>
                    <button
                      onClick={exportLogs}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-medium transition-colors"
                    >
                      📁 Export Logs
                    </button>
                    <button
                      onClick={() => {
                        logger.clearDbCache();
                        generatePreview();
                      }}
                      className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm font-medium transition-colors"
                    >
                      🔄 Refresh Cache
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                    <strong>Test Functions:</strong>
                    <br />
                    • Test Logging: Generates sample log entries to verify
                    filtering
                    <br />
                    • Clear Logs: Removes all log entries from memory and
                    database
                    <br />
                    • Export Logs: Downloads current logs as JSON file
                    <br />• Refresh Cache: Clears database cache and reloads
                    data
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              {/* Live Preview */}
              <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  👁️ Live Preview
                </h2>

                {previewData && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {previewData.combinedTotal}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total Items to Display
                      </div>
                    </div>

                    {config.includeConsoleData && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          Console Data
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center p-2 bg-red-50 rounded">
                            <div className="font-bold text-red-600">
                              {previewData.filteredLogs.errors}
                            </div>
                            <div className="text-red-600">Errors</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 rounded">
                            <div className="font-bold text-yellow-600">
                              {previewData.filteredLogs.warnings}
                            </div>
                            <div className="text-yellow-600">Warnings</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-bold text-blue-600">
                              {previewData.filteredLogs.info}
                            </div>
                            <div className="text-blue-600">Info</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <div className="font-bold text-gray-600">
                              {previewData.filteredLogs.debug}
                            </div>
                            <div className="text-gray-600">Debug</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {config.includeBrowserIssues && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">
                          Browser Issues
                        </h3>
                        <div className="text-center p-2 bg-orange-50 rounded mb-2">
                          <div className="font-bold text-orange-600">
                            {previewData.browserIssues.total}
                          </div>
                          <div className="text-orange-600 text-xs">
                            Total Issues
                          </div>
                        </div>

                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>CSP Violations:</span>
                            <span className="font-bold">
                              {previewData.browserIssues.byType.csp_violation}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Form Issues:</span>
                            <span className="font-bold">
                              {previewData.browserIssues.byType.form_validation}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Accessibility:</span>
                            <span className="font-bold">
                              {previewData.browserIssues.byType.accessibility}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Performance:</span>
                            <span className="font-bold">
                              {previewData.browserIssues.byType.performance}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={applyToDashboard}
                  className="w-full mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 font-semibold"
                >
                  🚀 Apply to Dashboard
                </button>
              </div>

              {/* Quick Presets */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">⚡ Quick Presets</h2>

                <div className="space-y-2">
                  <button
                    onClick={() =>
                      setConfig({
                        maxErrors: 50,
                        maxWarnings: 30,
                        maxInfo: 20,
                        maxDebug: 10,
                        includeBrowserIssues: true,
                        includeConsoleData: true,
                        timeRangeHours: 1,
                        minSeverity: 'medium'
                      })
                    }
                    className="w-full p-2 text-left text-sm bg-red-50 hover:bg-red-100 rounded border border-red-200"
                  >
                    🚨 <strong>Debug Mode</strong>
                    <br />
                    <span className="text-xs text-gray-600">
                      Focus on recent critical issues
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setConfig({
                        maxErrors: 200,
                        maxWarnings: 150,
                        maxInfo: 500,
                        maxDebug: 100,
                        includeBrowserIssues: true,
                        includeConsoleData: true,
                        timeRangeHours: 24,
                        minSeverity: 'low'
                      })
                    }
                    className="w-full p-2 text-left text-sm bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
                  >
                    📊 <strong>Full Overview</strong>
                    <br />
                    <span className="text-xs text-gray-600">
                      Comprehensive daily view
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setConfig({
                        maxErrors: 10,
                        maxWarnings: 10,
                        maxInfo: 25,
                        maxDebug: 5,
                        includeBrowserIssues: false,
                        includeConsoleData: true,
                        timeRangeHours: 4,
                        minSeverity: 'high'
                      })
                    }
                    className="w-full p-2 text-left text-sm bg-green-50 hover:bg-green-100 rounded border border-green-200"
                  >
                    ⚡ <strong>Performance Mode</strong>
                    <br />
                    <span className="text-xs text-gray-600">
                      Minimal load, essential logs only
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
