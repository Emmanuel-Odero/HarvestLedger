"use client";

import React from "react";
import { WalletManager } from "../../../components/WalletManager";
import { useAuth } from "../../../lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WalletsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <a href="/dashboard" className="hover:text-gray-700">
              Dashboard
            </a>
            <span>/</span>
            <a href="/profile" className="hover:text-gray-700">
              Profile
            </a>
            <span>/</span>
            <span className="text-gray-900">Wallets</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Wallet Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your connected wallets and authentication methods
              </p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">
                {user.fullName
                  ? user.fullName.charAt(0).toUpperCase()
                  : user.hederaAccountId?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user.fullName || "Anonymous User"}
              </h2>
              <p className="text-gray-600">
                {user.role.charAt(0).toUpperCase() +
                  user.role.slice(1).toLowerCase()}
              </p>
              <p className="text-sm text-gray-500">
                Primary Account: {user.hederaAccountId}
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Wallet Benefits */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Why Use Multiple Wallets?
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Security</h4>
                <p className="text-sm text-gray-600">
                  Separate wallets for different purposes reduces risk
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Convenience</h4>
                <p className="text-sm text-gray-600">
                  Use different wallets on different devices
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Organization</h4>
                <p className="text-sm text-gray-600">
                  Business vs personal wallet separation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Manager Component */}
        <WalletManager />

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-900">
                Security Best Practices
              </h4>
              <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                <li>• Only link wallets that you control and trust</li>
                <li>• Keep your wallet software updated</li>
                <li>• Never share your private keys or seed phrases</li>
                <li>• Use hardware wallets for large amounts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
