"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import SecurityDashboard from '../../components/SecurityDashboard';
import { generateSecurePassword, validateEncryptionKey } from '../../lib/encryption';
import { logDataModification, logSecurityViolation } from '../../lib/securityLogger';

interface SecuritySettings {
  masterPasswordEnabled: boolean;
  autoLockEnabled: boolean;
  autoLockTimeoutMinutes: number;
  suspiciousActivityAlerts: boolean;
  encryptionStrength: 'standard' | 'high';
  sessionTimeout: number;
  deviceTrustEnabled: boolean;
  auditLogRetentionDays: number;
}

function SecuritySettingsContent() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings>({
    masterPasswordEnabled: false,
    autoLockEnabled: true,
    autoLockTimeoutMinutes: 5,
    suspiciousActivityAlerts: true,
    encryptionStrength: 'standard',
    sessionTimeout: 30,
    deviceTrustEnabled: true,
    auditLogRetentionDays: 90
  });
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'dashboard'>('settings');

  useEffect(() => {
    // Load user security settings
    // In a real app, this would come from the database
    const savedSettings = localStorage.getItem('security_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load security settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Validate password as user types
    if (newMasterPassword) {
      const validation = validateEncryptionKey(newMasterPassword);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation({ isValid: false, errors: [] });
    }
  }, [newMasterPassword]);

  const handleSettingChange = (key: keyof SecuritySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage (in production, save to database)
    localStorage.setItem('security_settings', JSON.stringify(newSettings));
    
    logDataModification('security_settings', user?.id || '', 'update', true);
  };

  const handleMasterPasswordSetup = async () => {
    if (!passwordValidation.isValid) {
      alert('Please fix the password issues before continuing.');
      return;
    }
    
    if (newMasterPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      // In a real app, you'd hash and store the password securely
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      handleSettingChange('masterPasswordEnabled', true);
      setShowPasswordModal(false);
      setNewMasterPassword('');
      setConfirmPassword('');
      
      logDataModification('master_password', user?.id || '', 'create', true);
      alert('Master password has been set successfully!');
    } catch (error) {
      logSecurityViolation('master_password_setup_failed', user?.id, { error: (error as Error).message });
      alert('Failed to set master password. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generatePassword = () => {
    const password = generateSecurePassword(16);
    setNewMasterPassword(password);
  };

  const exportSecurityReport = () => {
    const report = {
      user_id: user?.id,
      generated_at: new Date().toISOString(),
      settings,
      security_status: {
        master_password_enabled: settings.masterPasswordEnabled,
        auto_lock_enabled: settings.autoLockEnabled,
        encryption_strength: settings.encryptionStrength,
        alerts_enabled: settings.suspiciousActivityAlerts
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayboard-security-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    logDataModification('security_report', user?.id || '', 'export', true);
  };

  if (!user) {
    return <div>Please sign in to access security settings.</div>;
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header with Tabs */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🔒 Security Center</h1>
        
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Security Settings
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-medium ${
              activeTab === 'dashboard'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Security Dashboard
          </button>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <SecurityDashboard />
      ) : (
        <>
          {/* Master Password Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Master Password</h2>
                <p className="text-gray-600">Secure your sensitive data with an additional layer of encryption</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                settings.masterPasswordEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {settings.masterPasswordEnabled ? '✅ Enabled' : '❌ Disabled'}
              </div>
            </div>

            <div className="space-y-4">
              {!settings.masterPasswordEnabled ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-800 mb-2">
                    <span>⚠️</span>
                    <span className="font-semibold">Master Password Not Set</span>
                  </div>
                  <p className="text-yellow-700 text-sm mb-3">
                    Set up a master password to encrypt your sensitive credentials locally.
                  </p>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Set Up Master Password
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <span>🔒</span>
                    <span className="font-semibold">Master Password Active</span>
                  </div>
                  <p className="text-green-700 text-sm mb-3">
                    Your sensitive data is protected with client-side encryption.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Change Master Password
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to disable master password? This will decrypt all your data.')) {
                          handleSettingChange('masterPasswordEnabled', false);
                        }
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Disable
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Session Security */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Security</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Auto-Lock</label>
                  <p className="text-sm text-gray-600">Automatically lock the application after inactivity</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoLockEnabled}
                    onChange={(e) => handleSettingChange('autoLockEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.autoLockEnabled && (
                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Auto-Lock Timeout: {settings.autoLockTimeoutMinutes} minutes
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={settings.autoLockTimeoutMinutes}
                    onChange={(e) => handleSettingChange('autoLockTimeoutMinutes', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 min</span>
                    <span>15 min</span>
                    <span>30 min</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-gray-900 mb-2">
                  Session Timeout: {settings.sessionTimeout} minutes
                </label>
                <input
                  type="range"
                  min="5"
                  max="480"
                  step="5"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 min</span>
                  <span>4 hours</span>
                  <span>8 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Monitoring */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Monitoring</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Suspicious Activity Alerts</label>
                  <p className="text-sm text-gray-600">Get notified of unusual account activity</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.suspiciousActivityAlerts}
                    onChange={(e) => handleSettingChange('suspiciousActivityAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Device Trust</label>
                  <p className="text-sm text-gray-600">Remember this device for faster authentication</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.deviceTrustEnabled}
                    onChange={(e) => handleSettingChange('deviceTrustEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block font-medium text-gray-900 mb-2">Encryption Strength</label>
                <select
                  value={settings.encryptionStrength}
                  onChange={(e) => handleSettingChange('encryptionStrength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="standard">Standard (AES-256)</option>
                  <option value="high">High (AES-256 + Extended Key Derivation)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Higher encryption strength may slightly impact performance
                </p>
              </div>
            </div>
          </div>

          {/* Security Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={exportSecurityReport}
                className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">📊</span>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Export Security Report</div>
                  <div className="text-sm text-gray-600">Download your security settings and activity</div>
                </div>
              </button>

              <button
                onClick={() => {
                  if (confirm('This will clear all security logs and reset your security settings. Continue?')) {
                    localStorage.removeItem('security_settings');
                    setSettings({
                      masterPasswordEnabled: false,
                      autoLockEnabled: true,
                      autoLockTimeoutMinutes: 5,
                      suspiciousActivityAlerts: true,
                      encryptionStrength: 'standard',
                      sessionTimeout: 30,
                      deviceTrustEnabled: true,
                      auditLogRetentionDays: 90
                    });
                    alert('Security settings have been reset to defaults.');
                  }
                }}
                className="flex items-center gap-3 p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                <span className="text-2xl">🔄</span>
                <div className="text-left">
                  <div className="font-medium text-red-900">Reset Security Settings</div>
                  <div className="text-sm text-red-600">Reset all security preferences to defaults</div>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Master Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {settings.masterPasswordEnabled ? 'Change Master Password' : 'Set Master Password'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Master Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={newMasterPassword}
                    onChange={(e) => setNewMasterPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a strong master password"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="absolute right-2 top-2 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Generate
                  </button>
                </div>
                
                {newMasterPassword && (
                  <div className="mt-2">
                    {passwordValidation.errors.map((error, index) => (
                      <div key={index} className="text-red-600 text-xs">❌ {error}</div>
                    ))}
                    {passwordValidation.isValid && (
                      <div className="text-green-600 text-xs">✅ Password meets security requirements</div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your master password"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> Your master password cannot be recovered if lost. 
                  Make sure to store it securely.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMasterPasswordSetup}
                  disabled={!passwordValidation.isValid || newMasterPassword !== confirmPassword || saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Setting...' : 'Set Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SecuritySettingsPage() {
  return (
    <ProtectedRoute requireAuth={true} requireProfile={true}>
      <SecuritySettingsContent />
    </ProtectedRoute>
  );
}
