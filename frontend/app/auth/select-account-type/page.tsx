"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { useAuth } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UPDATE_USER_ROLE } from "@/lib/graphql/auth";

type UserRole = "FARMER" | "BUYER";

function SelectAccountTypeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);

  const email = searchParams.get("email") || user?.email;

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleContinue = async () => {
    if (!selectedRole) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await updateUserRole({
        variables: {
          role: selectedRole,
        },
      });

      if (data?.updateUserRole?.success) {
        await refreshUser();
        router.push(
          `/profile?setup=true&email=${encodeURIComponent(email || "")}`
        );
      } else {
        setError(
          data?.updateUserRole?.message || "Failed to update account type"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Account Type
          </h1>
          <p className="text-gray-600 mb-4">
            Select the account type that best describes your role in the
            agricultural ecosystem
          </p>
          {email && (
            <Badge variant="secondary" className="mb-4">
              Email verified: {email}
            </Badge>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === "FARMER"
                ? "ring-2 ring-green-500 bg-green-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => handleRoleSelect("FARMER")}
          >
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🌾</div>
              <CardTitle className="text-xl">Farmer</CardTitle>
              <CardDescription>
                I grow crops and want to record harvests, tokenize products, and
                access financing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Record and track harvests on blockchain
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Create tokenized crop representations
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Apply for harvest-backed loans
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Connect directly with buyers
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Manage farm operations and assets
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === "BUYER"
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => handleRoleSelect("BUYER")}
          >
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">🏢</div>
              <CardTitle className="text-xl">Buyer</CardTitle>
              <CardDescription>
                I purchase agricultural products and want transparency in the
                supply chain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">✓</span>
                  Browse verified agricultural products
                </div>
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">✓</span>
                  Access complete supply chain data
                </div>
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">✓</span>
                  Verify product authenticity and origin
                </div>
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">✓</span>
                  Connect with verified farmers
                </div>
                <div className="flex items-center">
                  <span className="text-blue-500 mr-2">✓</span>
                  Manage procurement and inventory
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            className={`px-8 py-3 text-lg font-semibold ${
              selectedRole === "FARMER"
                ? "bg-green-600 hover:bg-green-700"
                : selectedRole === "BUYER"
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400"
            }`}
          >
            {loading
              ? "Setting up..."
              : `Continue as ${selectedRole || "Select Account Type"}`}
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            You can change your account type later in your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SelectAccountTypePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SelectAccountTypeForm />
    </Suspense>
  );
}
