/**
 * Role Switcher Component
 *
 * Allows users to switch between farmer and buyer perspectives
 */

"use client";

import { useCurrentRole, UserRole } from "@/lib/user-journey-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RoleSwitcher() {
  const [currentRole, switchRole] = useCurrentRole();

  const roles: {
    value: UserRole;
    label: string;
    icon: string;
    description: string;
  }[] = [
    {
      value: "farmer",
      label: "Farmer",
      icon: "🌾",
      description: "Record harvests, tokenize crops, apply for loans",
    },
    {
      value: "buyer",
      label: "Buyer",
      icon: "🏢",
      description: "Browse crops, verify quality, track supply chain",
    },
  ];

  return (
    <Card className="border-2">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Select Your Role</h3>
            <p className="text-sm text-gray-600">
              Experience the platform from different perspectives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => switchRole(role.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${
                    currentRole === role.value
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{role.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {role.label}
                      {currentRole === role.value && (
                        <span className="ml-2 text-xs text-blue-600">
                          (Active)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {role.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
