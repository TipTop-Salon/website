import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#140D18] text-[#DDD7E3] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#1F1525] border border-[#3A2445] rounded-xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 bg-red-900/30 border border-red-800 text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-white font-medium">
                Something went wrong
              </h2>
              <p className="text-xs text-[#A597B0] leading-relaxed">
                The atelier interface encountered an unexpected state. You can reload the page or return to the main salon lobby.
              </p>
              {this.state.error && (
                <div className="p-3 bg-[#140D18] rounded border border-[#2D1B36] text-[11px] font-mono text-amber-300 text-left overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 bg-[#E5A93C] hover:bg-[#F0B54B] text-[#1C1221] text-xs uppercase tracking-wider font-semibold rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="w-full py-2.5 px-4 bg-[#2A1B32] hover:bg-[#382443] text-white text-xs uppercase tracking-wider font-medium rounded transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#442A51]"
              >
                <Home className="w-3.5 h-3.5 text-[#E5A93C]" />
                <span>Return to Salon</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
