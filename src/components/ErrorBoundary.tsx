"use client";

import React, { Component, ReactNode } from 'react';
import { TooManyRequestsMessage } from './RateLimitIndicator';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorType: string | null;
  errorMessage: string | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorType: null,
    errorMessage: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Check if it's a rate limiting error
    if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      return {
        hasError: true,
        errorType: 'rate-limit',
        errorMessage: error.message,
      };
    }

    // Check if it's a network error
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        hasError: true,
        errorType: 'network',
        errorMessage: error.message,
      };
    }

    return {
      hasError: true,
      errorType: 'generic',
      errorMessage: error.message,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log error details for debugging
    if (error.message.includes('429')) {
      console.warn('Rate limiting error detected:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      errorType: null,
      errorMessage: null,
    });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleClearCache = () => {
    // Clear all caches
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear service worker cache if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
    
    // Clear browser cache using Cache API
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.state.errorType === 'rate-limit') {
        return (
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
                Slow Down There!
              </h2>
              <TooManyRequestsMessage />
              <div className="mt-6 flex flex-col space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleClearCache}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Clear Cache & Retry
                </button>
              </div>
            </div>
          </div>
        );
      }

      if (this.state.errorType === 'network') {
        return (
          <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Network Error</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Unable to connect to the server. Please check your internet connection.
                  </p>
                  <div className="mt-6 flex flex-col space-y-3">
                    <button
                      onClick={this.handleRetry}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Retry
                    </button>
                    <button
                      onClick={this.handleRefresh}
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Refresh Page
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      // Generic error fallback
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Something went wrong</h3>
                <p className="mt-1 text-sm text-gray-500">
                  An unexpected error occurred. Please try refreshing the page.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.errorMessage && (
                  <p className="mt-2 text-xs text-red-600 font-mono">
                    {this.state.errorMessage}
                  </p>
                )}
                <div className="mt-6 flex flex-col space-y-3">
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={this.handleRefresh}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
