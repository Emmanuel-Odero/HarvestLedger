/**
 * Example Component Demonstrating Demo Mode Usage
 *
 * This component shows how to integrate demo mode into your application
 * and use the mock GraphQL resolvers.
 */

"use client";

import { useQuery, gql } from "@apollo/client";
import { useDemoMode } from "@/lib/demo-mode-context";

// Example GraphQL queries
const GET_HARVESTS = gql`
  query GetHarvests($limit: Int, $offset: Int, $cropType: String) {
    harvests(limit: $limit, offset: $offset, cropType: $cropType) {
      items {
        id
        farmer_id
        crop_type
        quantity
        unit
        harvest_date
        quality_grade
        hcs_transaction_id
        status
      }
      total
      hasMore
      nextOffset
    }
  }
`;

const GET_USERS = gql`
  query GetUsers($limit: Int, $offset: Int, $role: String) {
    users(limit: $limit, offset: $offset, role: $role) {
      items {
        id
        email
        full_name
        role
        hedera_account_id
        farm_name
        company_name
      }
      total
      hasMore
    }
  }
`;

export function DemoModeExample() {
  const { isDemoMode, toggleDemoMode, config, updateConfig } = useDemoMode();

  // Query harvests
  const {
    data: harvestData,
    loading: harvestLoading,
    error: harvestError,
  } = useQuery(GET_HARVESTS, {
    variables: { limit: 5, cropType: "coffee" },
  });

  // Query users
  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USERS, {
    variables: { limit: 5, role: "FARMER" },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Demo Mode Example</h1>

        {/* Demo Mode Controls */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3">Demo Mode Controls</h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Demo Mode</span>
              <button
                onClick={toggleDemoMode}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isDemoMode
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
              >
                {isDemoMode ? "Enabled" : "Disabled"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Simulate Latency</span>
              <button
                onClick={() =>
                  updateConfig({ simulateLatency: !config.simulateLatency })
                }
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  config.simulateLatency
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                }`}
              >
                {config.simulateLatency ? "On" : "Off"}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Error Rate</span>
              <select
                value={config.errorRate}
                onChange={(e) =>
                  updateConfig({ errorRate: parseFloat(e.target.value) })
                }
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              >
                <option value="0">0% (No errors)</option>
                <option value="0.02">2% (Realistic)</option>
                <option value="0.05">5% (Testing)</option>
                <option value="0.1">10% (Stress test)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Display */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-semibold mb-2">Current Status</h3>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">Mode:</span>{" "}
              {isDemoMode ? "Demo (Mock Data)" : "Live (Real Backend)"}
            </p>
            <p>
              <span className="font-medium">Latency Simulation:</span>{" "}
              {config.simulateLatency ? "Enabled" : "Disabled"}
            </p>
            <p>
              <span className="font-medium">Error Rate:</span>{" "}
              {(config.errorRate * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Data Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Harvests */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Coffee Harvests</h2>

          {harvestLoading && (
            <div className="text-sm text-gray-500">Loading...</div>
          )}

          {harvestError && (
            <div className="text-sm text-red-600">
              Error: {harvestError.message}
            </div>
          )}

          {harvestData && (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Showing {harvestData.harvests.items.length} of{" "}
                {harvestData.harvests.total} harvests
              </div>

              <div className="space-y-2">
                {harvestData.harvests.items.map((harvest: any) => (
                  <div
                    key={harvest.id}
                    className="bg-gray-50 dark:bg-gray-800 p-3 rounded"
                  >
                    <div className="text-sm font-medium">
                      {harvest.quantity} {harvest.unit} - Grade{" "}
                      {harvest.quality_grade}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Status: {harvest.status}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      TX: {harvest.hcs_transaction_id}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Users */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Farmers</h2>

          {userLoading && (
            <div className="text-sm text-gray-500">Loading...</div>
          )}

          {userError && (
            <div className="text-sm text-red-600">
              Error: {userError.message}
            </div>
          )}

          {userData && (
            <>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Showing {userData.users.items.length} of {userData.users.total}{" "}
                farmers
              </div>

              <div className="space-y-2">
                {userData.users.items.map((user: any) => (
                  <div
                    key={user.id}
                    className="bg-gray-50 dark:bg-gray-800 p-3 rounded"
                  >
                    <div className="text-sm font-medium">{user.full_name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {user.farm_name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.hedera_account_id}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">💡 Try This</h3>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Toggle demo mode to see the difference</li>
          <li>Enable latency simulation to see loading states</li>
          <li>Increase error rate to test error handling</li>
          <li>Check the browser console for GraphQL operations</li>
        </ul>
      </div>
    </div>
  );
}
