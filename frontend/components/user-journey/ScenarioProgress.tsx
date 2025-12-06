/**
 * Scenario Progress Component
 *
 * Shows current scenario progress with step-by-step guidance
 */

"use client";

import { useScenario } from "@/lib/user-journey-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ScenarioProgress() {
  const { activeScenario, completeStep } = useScenario();

  if (!activeScenario) {
    return null;
  }

  const currentStepIndex = activeScenario.steps.findIndex((s) => !s.completed);
  const currentStep =
    currentStepIndex >= 0 ? activeScenario.steps[currentStepIndex] : null;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg">Scenario Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeScenario.steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = step.completed;
            const isFuture = index > currentStepIndex;

            return (
              <div
                key={step.id}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    isCompleted
                      ? "border-green-300 bg-green-50"
                      : isActive
                      ? "border-blue-400 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-gray-50 opacity-60"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {isCompleted ? (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                        ✓
                      </div>
                    ) : isActive ? (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`font-semibold ${
                          isActive ? "text-blue-900" : "text-gray-700"
                        }`}
                      >
                        {step.title}
                      </h4>
                      {isActive && <Badge className="text-xs">Current</Badge>}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {step.description}
                    </p>

                    {step.tooltip && isActive && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                        <p className="text-xs text-yellow-800">
                          💡 <strong>Tip:</strong> {step.tooltip}
                        </p>
                      </div>
                    )}

                    {isActive && !isCompleted && (
                      <Button
                        size="sm"
                        onClick={() => completeStep(step.id)}
                        className="mt-2"
                      >
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {activeScenario.steps.every((s) => s.completed) && (
          <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg text-center">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-bold text-green-900 mb-1">
              Scenario Completed!
            </h3>
            <p className="text-sm text-green-700">
              You've successfully completed all steps in this scenario.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
