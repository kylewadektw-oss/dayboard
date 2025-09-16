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

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'widget';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external error service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        level: this.props.level
      });
    }
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback based on level
      return this.renderDefaultFallback();
    }

    return this.props.children;
  }

  private renderDefaultFallback() {
    const { level = 'component' } = this.props;
    const { error, retryCount } = this.state;

    if (level === 'widget') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-2">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">Widget Error</span>
          </div>
          <p className="text-xs text-red-600 mb-3">
            This widget encountered an error and couldn&apos;t load.
          </p>
          <button
            onClick={this.handleRetry}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded flex items-center gap-1"
            disabled={retryCount >= 3}
          >
            <RefreshCw className="h-3 w-3" />
            {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
          </button>
        </div>
      );
    }

    if (level === 'component') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-center gap-3 text-red-700 mb-4">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-lg font-medium">Component Error</h3>
          </div>
          <p className="text-red-600 mb-4">
            This component encountered an error and couldn&apos;t render
            properly.
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-4">
              <summary className="text-sm text-red-700 cursor-pointer mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="text-xs bg-red-100 p-3 rounded overflow-auto text-red-800">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
          <div className="flex gap-2">
            <button
              onClick={this.handleRetry}
              className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded flex items-center gap-2"
              disabled={retryCount >= 3}
            >
              <RefreshCw className="h-4 w-4" />
              {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
            </button>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    // Page level error
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-700 mb-6">
            <AlertTriangle className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Page Error</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Something went wrong while loading this page. This is usually
            temporary.
          </p>
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6">
              <summary className="text-sm text-red-700 cursor-pointer mb-2">
                Error Details (Development Only)
              </summary>
              <pre className="text-xs bg-red-50 p-3 rounded overflow-auto text-red-800 border">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
          <div className="flex flex-col gap-3">
            <button
              onClick={this.handleRetry}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
              disabled={retryCount >= 3}
            >
              <RefreshCw className="h-4 w-4" />
              {retryCount >= 3 ? 'Max retries reached' : 'Try Again'}
            </button>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" />
              Back to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// 🚀 PERFORMANCE: Higher-order component for easy error boundary wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// 🚀 PERFORMANCE: Preset error boundaries for common use cases
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children
}) => <ErrorBoundary level="page">{children}</ErrorBoundary>;

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children
}) => <ErrorBoundary level="component">{children}</ErrorBoundary>;

export const WidgetErrorBoundary: React.FC<{ children: ReactNode }> = ({
  children
}) => <ErrorBoundary level="widget">{children}</ErrorBoundary>;
