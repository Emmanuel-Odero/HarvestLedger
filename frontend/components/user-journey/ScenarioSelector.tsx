/**
 * Scenario Selector Component
 *
 * Displays available scenarios for the current role
 */

"use client";

import { useUserJourney } from "@/lib/user-journey-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SCENARIO_ICONS: Record<string, string> = {
  "farmer-onboarding": "🌾",
  harvest_recording: "📝",
  crop_tokenization: "🪙",
  marketplace_browsing: "🛒",
  supply_chain_tracking: "🔗",
  loan_application: "💰",
  quality_verification: "🔬",
  dispute_resolution: "⚖️",
};

export function ScenarioSelector() {
  const {
    availableScenarios,
    activeScenario,
    startScenario,
    resetScenario,
    currentRole,
  } = useUserJourney();

  if (activeScenario) {
    return (
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {SCENARIO_ICONS[activeScenario.id] || "📝"}
              </div>
              <div>
                <CardTitle>{activeScenario.title}</CardTitle>
                <CardDescription>{activeScenario.description}</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetScenario}>
              Exit Scenario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">
                {activeScenario.steps.filter((s) => s.completed).length} /{" "}
                {activeScenario.steps.length} steps
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    (activeScenario.steps.filter((s) => s.completed).length /
                      activeScenario.steps.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a Scenario</CardTitle>
        <CardDescription>
          Select a guided walkthrough to explore platform features as a{" "}
          {currentRole}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableScenarios.map((scenario) => (
            <Card
              key={scenario.id}
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-300"
              onClick={() => startScenario(scenario.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="text-4xl">
                    {SCENARIO_ICONS[scenario.id] || "📝"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{scenario.title}</h4>
                    <p className="text-xs text-gray-600 mb-3">
                      {scenario.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {scenario.steps.length} steps
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        ~5 min
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
