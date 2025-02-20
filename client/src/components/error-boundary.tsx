import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
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
      <div className="container py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Something went wrong</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <AlertDescription>
              <p>An unexpected error occurred while rendering this component.</p>
              {this.state.error && (
                <div className="mt-4 space-y-2">
                  <p className="font-semibold">Error Details:</p>
                  <p className="text-sm font-mono bg-muted/50 p-3 rounded-md overflow-x-auto">
                    {this.state.error.message}
                  </p>
                  {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-sm text-muted-foreground cursor-pointer">
                        Component Stack
                      </summary>
                      <pre className="text-xs font-mono bg-muted/50 p-3 mt-2 rounded-md overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </AlertDescription>
            <div className="flex gap-4 mt-6">
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