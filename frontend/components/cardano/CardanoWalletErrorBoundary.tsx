/**
 * Cardano Wallet Error Boundary
 *
 * Error boundary component to gracefully handle WASM loading failures
 * and other errors in Cardano wallet components.
 * Requirements: 4.4
 */

"use client";

import React, { Component, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CardanoWalletErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface CardanoWalletErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error boundary for Cardano wallet components
 * Catches WASM loading errors and other runtime errors
 */
export class CardanoWalletErrorBoundary extends Component<
  CardanoWalletErrorBoundaryProps,
  CardanoWalletErrorBoundaryState
> {
  constructor(props: CardanoWalletErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<CardanoWalletErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console for debugging
    console.error(
      "Cardano Wallet Error Boundary caught an error:",
      error,
      errorInfo
    );

    this.setState({
      error,
      errorInfo,
    });

    // In production, you would log this to an error tracking service
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Wallet Connection Error
            </h3>

            <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
              {this.isWasmError(this.state.error)
                ? "Failed to load wallet connector. This may be due to a browser compatibility issue or network problem."
                : "An unexpected error occurred while loading the wallet connector."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={this.handleReset} variant="outline">
                Try Again
              </Button>
              <Button onClick={this.handleReload}>Reload Page</Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 w-full">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-mono text-red-600 mb-2">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs font-mono text-gray-700 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </Card>
      );
    }

    return this.props.children;
  }

  /**
   * Check if the error is related to WASM loading
   */
  private isWasmError(error: Error | null): boolean {
    if (!error) return false;

    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes("wasm") ||
      errorMessage.includes("webassembly") ||
      errorMessage.includes("meshsdk") ||
      errorMessage.includes("initialization")
    );
  }
}
