import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', {
      error,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });

    // Handle both sync and async errors
    if (error instanceof Promise) {
      error.catch(actualError => {
        this.setState({ error: actualError, errorInfo });
      });
    } else {
      this.setState({ error, errorInfo });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    // Attempt to recover the application state
    window.location.href = '/';
  };

  private handleRetry = () => {
    // Reload only the current route
    window.location.reload();
  };

  public render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Something went wrong</CardTitle>
            <CardDescription>
              We've encountered an error in the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-md text-sm mb-4 overflow-auto max-h-[200px]">
              <p className="font-semibold">Error: {this.state.error?.message || "Unknown error"}</p>
              {this.state.error?.stack && (
                <pre className="mt-2 text-xs">{this.state.error.stack.split("\n").slice(0, 3).join("\n")}</pre>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="default" onClick={this.handleRetry}>
                Try Again
              </Button>
              <Button variant="outline" onClick={this.handleReset}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}