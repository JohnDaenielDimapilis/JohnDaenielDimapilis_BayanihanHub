import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-danger-100 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={28} className="text-danger-600" />
            </div>
            <h1 className="text-xl font-bold text-surface-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-surface-500 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} />
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
