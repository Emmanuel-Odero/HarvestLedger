/**
 * Demo Mode Example Component
 *
 * Demonstrates how to use the environment variable-based demo mode configuration.
 * This component shows the current demo mode status and allows toggling.
 */

"use client";

import { useDemoMode } from "@/lib/demo-mode-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DemoModeExample() {
  const { isDemoMode, enableDemoMode, disableDemoMode, config } = useDemoMode();

  // Get the environment variable value
  const envDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Demo Mode Configuration</CardTitle>
          <Badge variant={isDemoMode ? "default" : "secondary"}>
            {isDemoMode ? "Demo Mode" : "Live Mode"}
          </Badge>
        </div>
        <CardDescription>
          Control whether the application uses simulated or real blockchain data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Environment Variable Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Environment Variable</h3>
          <div className="flex items-center justify-between">
            <code className="text-sm">NEXT_PUBLIC_DEMO_MODE</code>
            <Badge variant={envDemoMode ? "default" : "outline"}>
              {envDemoMode ? "true" : "false"}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Set in .env file. Requires server restart to change.
          </p>
        </div>

        {/* Current Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Current Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className="font-medium">
                {isDemoMode ? "Demo (Simulated)" : "Live (Real Blockchain)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Simulate Latency:</span>
              <span className="font-medium">
                {config.simulateLatency ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Error Rate:</span>
              <span className="font-medium">
                {(config.errorRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="flex gap-2">
          <Button
            onClick={enableDemoMode}
            disabled={isDemoMode}
            variant={isDemoMode ? "outline" : "default"}
            className="flex-1"
          >
            Enable Demo Mode
          </Button>
          <Button
            onClick={disableDemoMode}
            disabled={!isDemoMode}
            variant={!isDemoMode ? "outline" : "default"}
            className="flex-1"
          >
            Enable Live Mode
          </Button>
        </div>

        {/* Information */}
        <div className="text-xs text-gray-600 space-y-1">
          <p>
            💡 <strong>Tip:</strong> Toggle changes are saved to localStorage
            and persist across sessions.
          </p>
          <p>
            🔄 <strong>Reset:</strong> Clear localStorage or change the .env
            variable to reset to default.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
