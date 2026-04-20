import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-sans">
          <div className="max-w-md w-full bg-[#111] border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.1)] rounded-xl p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/30 relative">
              <div className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-20"></div>
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-2xl font-bold mb-3">System Malfunction</h1>
            
            <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
              Our sensors detected an unexpected fault in the rendering engine. The error has been logged for analysis by the engineering team.
            </p>
            
            <div className="w-full bg-black/50 p-4 rounded-lg font-mono text-xs text-red-400 text-left mb-8 overflow-hidden break-words border border-white/5">
              &gt; ERR_SIG: {this.state.errorMessage || "Unknown rendering exception"}
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 rounded-lg font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <RefreshCw className="w-4 h-4" />
              Reboot Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
