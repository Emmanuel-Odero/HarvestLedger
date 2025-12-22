"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function OnboardingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push("/dashboard");
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to HarvestLedger!
          </h1>
          <p className="text-gray-600">
            Let's get you set up with your decentralized agriculture platform
          </p>
          <div className="mt-4">
            <Badge variant="secondary">
              Connected: {user?.hederaAccountId}
            </Badge>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Step {currentStep} of 3</CardTitle>
              <div className="flex space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full ${
                      step <= currentStep ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div>
                <CardTitle className="mb-4">🎉 Congratulations!</CardTitle>
                <CardDescription className="text-base mb-6">
                  You've successfully connected your {user?.walletType} wallet
                  to HarvestLedger. Your account is now secured by blockchain
                  technology, ensuring complete transparency and immutability of
                  your agricultural data.
                </CardDescription>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">
                    What this means:
                  </h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>
                      • Your identity is verified by your wallet signature
                    </li>
                    <li>• All your data is cryptographically secured</li>
                    <li>• No passwords needed - your wallet is your key</li>
                    <li>• Full control over your agricultural records</li>
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <CardTitle className="mb-4">
                  🌱 Your Role: {user?.role}
                </CardTitle>
                <CardDescription className="text-base mb-6">
                  Based on your wallet activity, we've identified you as a{" "}
                  {user?.role?.toLowerCase()}. This determines what features and
                  capabilities you'll have access to in HarvestLedger.
                </CardDescription>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    As a {user?.role}, you can:
                  </h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    {user?.role === "farmer" ? (
                      <>
                        <li>
                          • Record and track your harvests on the blockchain
                        </li>
                        <li>
                          • Create tokenized representations of your crops
                        </li>
                        <li>
                          • Apply for loans using your harvest as collateral
                        </li>
                        <li>• Connect directly with buyers and suppliers</li>
                      </>
                    ) : (
                      <>
                        <li>
                          • Browse and purchase tokenized agricultural products
                        </li>
                        <li>• Verify the authenticity and origin of crops</li>
                        <li>• Access complete supply chain transparency</li>
                        <li>• Connect with verified farmers</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <CardTitle className="mb-4">🚀 Ready to Start!</CardTitle>
                <CardDescription className="text-base mb-6">
                  Your HarvestLedger account is now fully set up and ready to
                  use. You can start exploring the platform and take advantage
                  of all the blockchain-powered features available to you.
                </CardDescription>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">
                    Next steps:
                  </h4>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>• Explore your dashboard and available features</li>
                    <li>
                      • Try recording a test harvest to see blockchain
                      integration
                    </li>
                    <li>• Complete your profile for better networking</li>
                    <li>• Join the HarvestLedger community</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleSkip}>
            Skip Tutorial
          </Button>
          <Button
            onClick={handleContinue}
            className="bg-green-600 hover:bg-green-700"
          >
            {currentStep === 3 ? "Go to Dashboard" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
