'use client';

import React from 'react';
import { AlertCircle, Settings } from 'lucide-react';

const EnhancedSettingsPage: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Enhanced Settings</h1>
        <p className="text-gray-600 mb-6">
          This advanced settings interface is temporarily disabled.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
          <h3 className="font-semibold text-yellow-800 mb-2">Component Status:</h3>
          <p className="text-yellow-700 text-sm">
            This component requires database schema updates before it can be enabled.
          </p>
        </div>
        <div className="mt-6">
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Return to Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSettingsPage;
