"use client";

import React, { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-6 text-center space-y-4">
          <p className="text-muted">Something went wrong.</p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try again
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
