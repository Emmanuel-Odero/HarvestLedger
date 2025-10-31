'use client';

import { useAuth } from '@/lib/auth-context'
import { useMutation } from '@apollo/client'
import { RECORD_HARVEST } from '@/lib/graphql/auth'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [recordHarvest] = useMutation(RECORD_HARVEST)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleTestHarvest = async () => {
    try {
      setLoading(true)
      setMessage('')
      
      const { data } = await recordHarvest({
        variables: {
          input: {
            cropType: 'CORN',
            quantity: 100,
            unit: 'tons',
            farmLocation: 'Test Farm Location',
            organicCertified: false
          }
        }
      })
      
      if (data?.recordHarvest) {
        setMessage(`Harvest recorded successfully! HCS Transaction ID: ${data.recordHarvest.hcsTransactionId}`)
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome to HarvestLedger Dashboard
                </h1>
                <p className="text-gray-600 mt-2">
                  Connected with {user?.walletType} wallet: {user?.hederaAccountId}
                </p>
              </div>
              <Button
                onClick={logout}
                variant="destructive"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your wallet and account details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hedera Account ID</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.hederaAccountId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Wallet Type</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.walletType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm text-gray-900">{user?.role}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1 flex space-x-2">
                    <Badge variant={user?.isActive ? 'default' : 'destructive'}>
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant={user?.isVerified ? 'default' : 'secondary'}>
                      {user?.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Harvest Recording */}
        <Card>
          <CardHeader>
            <CardTitle>Test Blockchain Integration</CardTitle>
            <CardDescription>
              Test the end-to-end blockchain integration by recording a harvest on Hedera testnet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleTestHarvest}
              disabled={loading}
              className="mb-4"
            >
              {loading ? 'Recording Harvest...' : 'Record Test Harvest'}
            </Button>
            
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-500">
              <p className="font-medium mb-2">This will:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Create a harvest record in the database</li>
                <li>Submit a message to Hedera Consensus Service (HCS)</li>
                <li>Return a transaction ID that can be verified on the Hedera testnet mirror node</li>
                <li>Demonstrate real blockchain integration without mocks</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}