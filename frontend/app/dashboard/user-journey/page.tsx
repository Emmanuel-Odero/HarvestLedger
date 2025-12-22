/**
 * User Journey Dashboard Page
 *
 * Integrated dashboard for scenario-based walkthroughs with role switching,
 * notifications, and activity feeds
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RoleSwitcher,
  ScenarioSelector,
  ScenarioProgress,
  NotificationCenter,
  ActivityFeed,
} from "@/components/user-journey";
import { useUserJourney } from "@/lib/user-journey-context";
import { useDemoMode } from "@/lib/demo-mode-context";
import {
  LiveHCSTopicViewer,
  SupplyChainVisualization,
  TokenizationInterface,
  QualityAssuranceDisplay,
  LoanManagementDashboard,
  AnalyticsDashboard,
  DisputeResolutionInterface,
  HashScanSimulator,
  WalletConnectionDemo,
  HarvestRecordingWorkflow,
  TokenTransferDemo,
  CertificationSystem,
} from "@/components/dashboard";

export default function UserJourneyPage() {
  const {
    currentRole,
    activeScenario,
    simulateRealTimeUpdates,
    toggleRealTimeUpdates,
  } = useUserJourney();
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const [activeTab, setActiveTab] = useState("overview");

  // Determine which component to show based on active scenario
  const getScenarioComponent = () => {
    if (!activeScenario) return null;

    const currentStep = activeScenario.steps.find((s) => !s.completed);
    if (!currentStep) return null;

    switch (currentStep.component) {
      case "HarvestRecordingWorkflow":
        return <HarvestRecordingWorkflow demoMode={isDemoMode} />;
      case "TokenizationInterface":
        return (
          <TokenizationInterface walletConnected={true} demoMode={isDemoMode} />
        );
      case "SupplyChainVisualization":
        return (
          <SupplyChainVisualization
            showVerificationBadges={true}
            interactiveMode={true}
          />
        );
      case "QualityAssuranceDisplay":
        return (
          <QualityAssuranceDisplay
            showIoTData={true}
            showCertifications={true}
          />
        );
      case "LoanManagementDashboard":
        return <LoanManagementDashboard demoMode={isDemoMode} />;
      case "HashScanSimulator":
        return (
          <HashScanSimulator
            transactionId="0.0.1234@1234567890.123456789"
            transactionType="HCS"
            demoMode={isDemoMode}
          />
        );
      case "CertificationSystem":
        return <CertificationSystem demoMode={isDemoMode} />;
      case "TokenTransferDemo":
        return <TokenTransferDemo demoMode={isDemoMode} />;
      case "DisputeResolutionInterface":
        return <DisputeResolutionInterface demoMode={isDemoMode} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Interactive User Journey
                </h1>
                <p className="text-gray-600 mt-2">
                  Experience the platform through guided scenarios
                </p>
              </div>
              <div className="flex items-center gap-3">
                <NotificationCenter />
                <Badge
                  variant={simulateRealTimeUpdates ? "default" : "secondary"}
                  className="text-sm cursor-pointer"
                  onClick={toggleRealTimeUpdates}
                >
                  {simulateRealTimeUpdates ? "🔴 Live Updates" : "⏸️ Paused"}
                </Badge>
                <Badge
                  variant={isDemoMode ? "default" : "secondary"}
                  className="text-sm cursor-pointer"
                  onClick={toggleDemoMode}
                >
                  {isDemoMode ? "🎭 Demo Mode" : "🔴 Live Mode"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mb-6">
          <Badge className="text-lg px-4 py-2">
            {currentRole === "FARMER" ? "🌾" : "🏢"} Current Role:{" "}
            {currentRole.charAt(0).toUpperCase() +
              currentRole.slice(1).toLowerCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Role & Scenario Selection */}
          <div className="lg:col-span-1 space-y-6">
            <RoleSwitcher />
            <ScenarioSelector />
            {activeScenario && <ScenarioProgress />}
            <ActivityFeed />
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            {activeScenario ? (
              <div className="space-y-6">
                {/* Current Step Component */}
                <Card className="border-2 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {activeScenario.steps.find((s) => !s.completed)
                          ?.title || "Scenario Complete!"}
                      </CardTitle>
                      <Badge>
                        Step{" "}
                        {activeScenario.steps.findIndex((s) => !s.completed) +
                          1}{" "}
                        of {activeScenario.steps.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>{getScenarioComponent()}</CardContent>
                </Card>

                {/* Educational Content */}
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      💡 Why This Matters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {currentRole === "FARMER" && (
                        <>
                          <div className="flex gap-3">
                            <div className="text-2xl">🔒</div>
                            <div>
                              <h4 className="font-semibold mb-1">
                                Immutable Records
                              </h4>
                              <p className="text-sm text-gray-700">
                                Your harvest data is permanently recorded on the
                                blockchain, preventing fraud and ensuring buyers
                                can trust your produce.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="text-2xl">💰</div>
                            <div>
                              <h4 className="font-semibold mb-1">
                                New Revenue Streams
                              </h4>
                              <p className="text-sm text-gray-700">
                                Tokenize your crops to access loans, sell
                                directly to buyers, or trade on marketplaces -
                                all without intermediaries.
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                      {currentRole === "BUYER" && (
                        <>
                          <div className="flex gap-3">
                            <div className="text-2xl">✅</div>
                            <div>
                              <h4 className="font-semibold mb-1">
                                Verified Quality
                              </h4>
                              <p className="text-sm text-gray-700">
                                All quality metrics, certifications, and supply
                                chain data are blockchain-verified and cannot be
                                altered.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="text-2xl">🌍</div>
                            <div>
                              <h4 className="font-semibold mb-1">
                                Full Traceability
                              </h4>
                              <p className="text-sm text-gray-700">
                                Track crops from farm to your facility with GPS
                                verification, IoT monitoring, and immutable
                                records at every step.
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Overview Dashboard */}
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="features">Features</TabsTrigger>
                        <TabsTrigger value="benefits">Benefits</TabsTrigger>
                        <TabsTrigger value="demo">Demo</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card className="bg-gradient-to-br from-green-50 to-blue-50">
                            <CardContent className="pt-6">
                              <div className="text-4xl mb-3">🌾</div>
                              <h3 className="font-bold text-lg mb-2">
                                For Farmers
                              </h3>
                              <ul className="text-sm space-y-2 text-gray-700">
                                <li>✓ Record harvests on blockchain</li>
                                <li>✓ Tokenize crops for trading</li>
                                <li>✓ Access crop-backed loans</li>
                                <li>✓ Reach buyers directly</li>
                              </ul>
                            </CardContent>
                          </Card>

                          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                            <CardContent className="pt-6">
                              <div className="text-4xl mb-3">🏢</div>
                              <h3 className="font-bold text-lg mb-2">
                                For Buyers
                              </h3>
                              <ul className="text-sm space-y-2 text-gray-700">
                                <li>✓ Browse verified crops</li>
                                <li>✓ Track supply chain</li>
                                <li>✓ Verify quality & certifications</li>
                                <li>✓ Resolve disputes with proof</li>
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="features" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { icon: "📝", label: "HCS Messages" },
                            { icon: "🪙", label: "Tokenization" },
                            { icon: "🔗", label: "Supply Chain" },
                            { icon: "🔬", label: "Quality Assurance" },
                            { icon: "💰", label: "Loan Management" },
                            { icon: "📊", label: "Analytics" },
                          ].map((feature) => (
                            <Card
                              key={feature.label}
                              className="text-center hover:shadow-lg transition-shadow cursor-pointer"
                            >
                              <CardContent className="pt-6">
                                <div className="text-3xl mb-2">
                                  {feature.icon}
                                </div>
                                <p className="text-sm font-medium">
                                  {feature.label}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="benefits" className="space-y-4 mt-4">
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <span>🔒</span> Trust & Transparency
                            </h4>
                            <p className="text-sm text-gray-700">
                              Blockchain ensures all data is immutable and
                              verifiable, building trust between farmers and
                              buyers.
                            </p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <span>💰</span> Financial Inclusion
                            </h4>
                            <p className="text-sm text-gray-700">
                              Farmers can access loans using tokenized crops as
                              collateral, without traditional banking barriers.
                            </p>
                          </div>
                          <div className="p-4 bg-purple-50 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <span>🌍</span> Global Marketplace
                            </h4>
                            <p className="text-sm text-gray-700">
                              Connect farmers directly with buyers worldwide,
                              reducing intermediaries and increasing profits.
                            </p>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="demo" className="space-y-4 mt-4">
                        <div className="text-center py-8">
                          <div className="text-6xl mb-4">🎭</div>
                          <h3 className="text-xl font-bold mb-2">
                            Ready to Explore?
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Choose a role and start a scenario to experience the
                            platform
                          </p>
                          <Button
                            size="lg"
                            onClick={() => setActiveTab("overview")}
                          >
                            Get Started →
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" className="w-full">
            📖 View Documentation
          </Button>
          <Button variant="outline" className="w-full">
            🎥 Watch Tutorial
          </Button>
          <Button variant="outline" className="w-full">
            💬 Get Support
          </Button>
        </div>
      </div>
    </div>
  );
}
