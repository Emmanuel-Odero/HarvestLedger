"use client";

import { useAuth } from "@/lib/auth-context";
import { useMutation } from "@apollo/client";
import { RECORD_HARVEST } from "@/lib/graphql/harvest";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const [recordHarvest] = useMutation(RECORD_HARVEST);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleTestHarvest = async () => {
    try {
      setLoading(true);
      setMessage("");

      const { data } = await recordHarvest({
        variables: {
          input: {
            cropType: "CORN",
            quantity: 100,
            unit: "tons",
            farmLocation: "Test Farm Location",
            organicCertified: false,
          },
        },
      });

      if (data?.recordHarvest) {
        setMessage(
          `Harvest recorded successfully! HCS Transaction ID: ${data.recordHarvest.hcsTransactionId}`
        );
      }
    } catch (error) {
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || user?.fullName || "User"}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your agricultural operations today.
        </p>
      </div>

      {/* User Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your wallet and account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Wallet Address
              </label>
              <p className="mt-1 text-sm text-gray-900 break-all">
                {user?.walletAddress}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.email || "Not set"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.name || "Not set"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Verified
              </label>
              <div className="mt-1">
                <Badge
                  variant={user?.isEmailVerified ? "default" : "secondary"}
                >
                  {user?.isEmailVerified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => (window.location.href = "/dashboard/user-journey")}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-5xl mb-3">🎯</div>
              <h3 className="font-bold text-lg mb-2">Interactive Journey</h3>
              <p className="text-sm text-gray-600">
                Experience guided scenarios with role switching and real-time
                updates
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() =>
            (window.location.href = "/dashboard/blockchain-showcase")
          }
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-5xl mb-3">🔗</div>
              <h3 className="font-bold text-lg mb-2">Blockchain Showcase</h3>
              <p className="text-sm text-gray-600">
                Explore all blockchain features and integrations
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() =>
            (window.location.href = "/dashboard/blockchain-integration")
          }
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-5xl mb-3">⚙️</div>
              <h3 className="font-bold text-lg mb-2">Integration Demo</h3>
              <p className="text-sm text-gray-600">
                Test live blockchain integration with Hedera
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Harvest Recording */}
      <Card>
        <CardHeader>
          <CardTitle>Test Blockchain Integration</CardTitle>
          <CardDescription>
            Test the end-to-end blockchain integration by recording a harvest on
            Hedera testnet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleTestHarvest}
            disabled={loading}
            className="mb-4"
          >
            {loading ? "Recording Harvest..." : "Record Test Harvest"}
          </Button>

          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.includes("Error")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            <p className="font-medium mb-2">This will:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Create a harvest record in the database</li>
              <li>Submit a message to Hedera Consensus Service (HCS)</li>
              <li>
                Return a transaction ID that can be verified on the Hedera
                testnet mirror node
              </li>
              <li>Demonstrate real blockchain integration without mocks</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
