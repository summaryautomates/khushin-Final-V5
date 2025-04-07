import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { CommonButton } from '../ui/CommonButton';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component that catches JavaScript errors in its child component tree
 * and displays a fallback UI instead of crashing the whole application.
 * 
 * @example
 * <ErrorBoundary
 *   fallback={<p>Something went wrong</p>}
 *   onError={(error) => logErrorToService(error)}
 * >
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      console.error('Uncaught error:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 bg-red-50 text-red-800 rounded-lg space-y-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-center max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <CommonButton
            variant="outline"
            onClick={this.handleReset}
          >
            Try Again
          </CommonButton>
        </div>
      );
    }

    return this.props.children;
  }
}