'use client';

import { Component, ReactNode } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry: () => void;
}

interface State {
  hasError: boolean;
}

export class LinksErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Links page error:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <DashboardLayout>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 flex flex-col items-center justify-center gap-4 max-w-md mx-auto mt-8">
            <AlertCircle className="w-12 h-12 text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-900">Links couldn&apos;t be loaded</h2>
            <p className="text-sm text-amber-800 text-center">
              Something went wrong while loading the Links page. This can happen if website data is invalid or the request failed.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </DashboardLayout>
      );
    }
    return this.props.children;
  }
}
