import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    message: ''
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.'
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let friendly = 'Something went wrong while communicating with the leaderboard database.';
      if (this.state.message.includes('Quota exceeded')) {
        friendly = 'Daily free-tier Firestore quota was reached. It resets automatically tomorrow.';
      } else if (this.state.message.includes('permission') || this.state.message.includes('PERMISSION_DENIED')) {
        friendly = 'Permission check failed. Please sign out and sign back in with your Google account.';
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B0E14] p-6">
          <div className="max-w-md w-full p-6 rounded-lg border border-slate-200 dark:border-[#232C3D] bg-white dark:bg-[#111620] space-y-4">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h1 className="font-display text-base font-bold">Connection Interrupted</h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {friendly}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload CodeBench</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
