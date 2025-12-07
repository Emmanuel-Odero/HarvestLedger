/**
 * Cardano Integration Dashboard Page
 *
 * Main page for Cardano blockchain integration features.
 * Integrates the CardanoShowcase component.
 * Requirements: Dashboard integration
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CardanoShowcase } from "@/components/dashboard";
import { useDemoMode } from "@/lib/demo-mode-context";
import { Badge } from "@/components/ui/badge";

export default function CardanoIntegrationPage() {
  const router = useRouter();
  const { isDemoMode } = useDemoMode();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Cardano Integration
              </h1>
              <p className="text-gray-600 mt-2">
                Complete Cardano blockchain integration for agricultural supply
                chain management
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isDemoMode && (
                <Badge variant="secondary" className="text-xs">
                  Demo Mode
                </Badge>
              )}
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
              >
                ← Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        {/* Main Showcase Component */}
        <CardanoShowcase demoMode={isDemoMode} />

        {/* Additional Resources */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={() => window.open("https://docs.cardano.org", "_blank")}
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <span className="text-sm font-medium">Cardano Documentation</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={() =>
              window.open("https://preprod.cardanoscan.io", "_blank")
            }
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-sm font-medium">
              Cardano Explorer (Testnet)
            </span>
          </Button>

          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2"
            onClick={() => window.open("https://docs.blockfrost.io", "_blank")}
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            <span className="text-sm font-medium">Blockfrost API Docs</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
