import React from 'react';
import { AlertTriangle, ArrowLeft, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1F2937] text-white p-4">
          <div className="max-w-md w-full bg-[#111827] border border-gray-800 rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 bg-[#EF4444]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-[#EF4444]" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
            <p className="text-gray-400 mb-8">
              We apologize for the inconvenience. Please try again or contact support if the problem persists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.history.back()} 
                className="bg-[#F97316] hover:bg-[#EA580C] text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/contact'}
                className="bg-[#374151] border-transparent hover:bg-[#4B5563] text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Contact Support
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;