'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { env } from "@/lib/env";

export default function EnvTestPage() {
  const envVars = [
    { name: 'NEXT_PUBLIC_BACKEND_URL', value: process.env.NEXT_PUBLIC_BACKEND_URL },
    { name: 'NEXT_PUBLIC_API_URL', value: process.env.NEXT_PUBLIC_API_URL },
    { name: 'NEXT_PUBLIC_GRAPHQL_URL', value: process.env.NEXT_PUBLIC_GRAPHQL_URL },
    { name: 'NODE_ENV', value: process.env.NODE_ENV },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Environment Variables Test</h1>
          <p className="text-gray-600">Verify that environment variables are loaded correctly from the root .env file</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>Values loaded from the root .env file</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {envVars.map((envVar) => (
                  <div key={envVar.name} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                    <span className="font-medium">{envVar.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant={envVar.value ? 'default' : 'destructive'}>
                        {envVar.value ? 'Set' : 'Missing'}
                      </Badge>
                      <span className="text-sm text-gray-600 font-mono">
                        {envVar.value || 'undefined'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment Helper Functions</CardTitle>
              <CardDescription>Testing the env utility functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <span className="font-medium">env.getApiUrl('/health')</span>
                  <div className="text-sm text-gray-600 font-mono mt-1">
                    {env.getApiUrl('/health')}
                  </div>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <span className="font-medium">env.getProxyUrl('/graphql')</span>
                  <div className="text-sm text-gray-600 font-mono mt-1">
                    {env.getProxyUrl('/graphql')}
                  </div>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <span className="font-medium">Environment Type</span>
                  <div className="text-sm text-gray-600 font-mono mt-1">
                    {env.IS_PRODUCTION ? 'Production' : 'Development'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Test</CardTitle>
              <CardDescription>Test connectivity to backend services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(env.getProxyUrl('/health'));
                      const data = await response.json();
                      alert(`✅ Backend Health Check:\n${JSON.stringify(data, null, 2)}`);
                    } catch (error) {
                      alert(`❌ Backend Health Check Failed:\n${error}`);
                    }
                  }}
                  className="w-full p-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Test Backend Connection
                </button>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Note:</strong> This page helps verify that:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Environment variables are loaded from the root .env file</li>
                    <li>Docker containers can communicate properly</li>
                    <li>The API proxy is working correctly</li>
                    <li>Frontend can reach the backend services</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}