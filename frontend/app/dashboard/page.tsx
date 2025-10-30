'use client';

import { useQuery, gql } from '@apollo/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { env, debugEnv } from "@/lib/env";
import { useEffect } from 'react';

// GraphQL Queries
const GET_HARVESTS = gql`
  query GetHarvests {
    harvests {
      id
      cropType
      quantity
      quality
      harvestDate
      location
      farmer {
        name
        email
      }
    }
  }
`;

const GET_HEALTH_STATUS = gql`
  query GetHealthStatus {
    health {
      status
      database
      hedera
      timestamp
    }
  }
`;

export default function Dashboard() {
  const { loading: harvestsLoading, error: harvestsError, data: harvestsData } = useQuery(GET_HARVESTS);
  const { loading: healthLoading, error: healthError, data: healthData } = useQuery(GET_HEALTH_STATUS);

  // Debug environment variables on component mount
  useEffect(() => {
    debugEnv();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HarvestLedger Dashboard</h1>
          <p className="text-gray-600">Monitor your agricultural supply chain in real-time</p>
        </div>

        {/* Health Status */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Backend connectivity and service status</CardDescription>
            </CardHeader>
            <CardContent>
              {healthLoading && <p>Checking system health...</p>}
              {healthError && (
                <div className="text-red-600">
                  <p>Health check failed: {healthError.message}</p>
                  <Badge variant="destructive">Offline</Badge>
                </div>
              )}
              {healthData && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant={healthData.health.status === 'healthy' ? 'default' : 'destructive'}>
                      {healthData.health.status}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Last checked: {new Date(healthData.health.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm font-medium">Database</p>
                      <Badge variant={healthData.health.database ? 'default' : 'destructive'}>
                        {healthData.health.database ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Hedera Network</p>
                      <Badge variant={healthData.health.hedera ? 'default' : 'destructive'}>
                        {healthData.health.hedera ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Harvests Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Harvests</CardTitle>
              <CardDescription>Latest harvest records from the blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              {harvestsLoading && <p>Loading harvests...</p>}
              {harvestsError && (
                <div className="text-red-600">
                  <p>Failed to load harvests: {harvestsError.message}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              )}
              {harvestsData && (
                <div className="space-y-4">
                  {harvestsData.harvests.length === 0 ? (
                    <p className="text-gray-500">No harvests recorded yet</p>
                  ) : (
                    harvestsData.harvests.map((harvest: any) => (
                      <div key={harvest.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{harvest.cropType}</h4>
                          <Badge>{harvest.quality}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Quantity: {harvest.quantity} | Location: {harvest.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          Farmer: {harvest.farmer.name} | Date: {new Date(harvest.harvestDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                Record New Harvest
              </Button>
              <Button className="w-full" variant="outline">
                View Supply Chain
              </Button>
              <Button className="w-full" variant="outline">
                Generate Reports
              </Button>
              <Button className="w-full" variant="outline">
                Manage Farmers
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* API Test Section */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>API Connection Test</CardTitle>
              <CardDescription>Test direct backend connectivity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch(env.getProxyUrl('/health'));
                      const data = await response.json();
                      alert(`Backend Response: ${JSON.stringify(data, null, 2)}`);
                    } catch (error) {
                      alert(`Error: ${error}`);
                    }
                  }}
                  variant="outline"
                >
                  Test Health Endpoint
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch(env.getProxyUrl('/graphql'), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          query: '{ health { status database hedera timestamp } }'
                        })
                      });
                      const data = await response.json();
                      alert(`GraphQL Response: ${JSON.stringify(data, null, 2)}`);
                    } catch (error) {
                      alert(`Error: ${error}`);
                    }
                  }}
                  variant="outline"
                >
                  Test GraphQL Endpoint
                </Button>
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <h4 className="font-medium mb-2">Environment Info:</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Backend URL:</strong> {env.BACKEND_URL}</p>
                    <p><strong>GraphQL URL:</strong> {env.GRAPHQL_URL}</p>
                    <p><strong>Environment:</strong> {env.NODE_ENV}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}