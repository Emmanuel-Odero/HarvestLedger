'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from '@apollo/client'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UPDATE_USER_PROFILE, GET_USER_WALLETS, GET_USER_ASSETS } from '@/lib/graphql/user'

type UserRole = 'FARMER' | 'BUYER'

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refreshUser } = useAuth()
  
  const [isSetupMode, setIsSetupMode] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    farmName: '',
    companyName: ''
  })
  
  const [updateUserProfile] = useMutation(UPDATE_USER_PROFILE)
  const { data: walletsData, loading: walletsLoading } = useQuery(GET_USER_WALLETS)
  const { data: assetsData, loading: assetsLoading } = useQuery(GET_USER_ASSETS)
  
  useEffect(() => {
    // Check if this is setup mode
    const setup = searchParams.get('setup')
    setIsSetupMode(setup === 'true')
    
    // Pre-fill form data from user
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        farmName: user.farmName || '',
        companyName: user.companyName || ''
      })
    }
  }, [user, searchParams])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const { data } = await updateUserProfile({
        variables: {
          input: {
            fullName: formData.fullName,
            phone: formData.phone || null,
            address: formData.address || null,
            farmName: user?.role === 'FARMER' ? formData.farmName || null : null,
            companyName: user?.role === 'BUYER' ? formData.companyName || null : null
          }
        }
      })
      
      if (data?.updateUserProfile?.success) {
        setSuccess('Profile updated successfully!')
        await refreshUser()
        
        if (isSetupMode) {
          // Complete setup and redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        }
      } else {
        setError(data?.updateUserProfile?.message || 'Failed to update profile')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    return role === 'FARMER' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
  }

  const getRoleIcon = (role: string) => {
    return role === 'FARMER' ? '🌾' : '🏢'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isSetupMode ? 'Complete Your Profile' : 'Profile Management'}
              </h1>
              <p className="text-gray-600">
                {isSetupMode 
                  ? 'Set up your profile to get the most out of HarvestLedger'
                  : 'Manage your account information, wallets, and assets'
                }
              </p>
            </div>
            {!isSetupMode && (
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
              >
                Back to Dashboard
              </Button>
            )}
          </div>
          
          {user && (
            <div className="flex items-center gap-4 mt-4">
              <Badge className={getRoleColor(user.role)}>
                {getRoleIcon(user.role)} {user.role}
              </Badge>
              {user.emailVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✓ Email Verified
                </Badge>
              )}
              {user.registrationComplete && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  ✓ Registration Complete
                </Badge>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="wallets">Wallets</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and {user?.role === 'FARMER' ? 'farm' : 'company'} information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {user?.emailVerified ? 'Verified email (cannot be changed)' : 'Email not verified'}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    {user?.role === 'FARMER' && (
                      <div className="md:col-span-2">
                        <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 mb-2">
                          Farm Name
                        </label>
                        <input
                          id="farmName"
                          type="text"
                          value={formData.farmName}
                          onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Green Valley Farm"
                        />
                      </div>
                    )}

                    {user?.role === 'BUYER' && (
                      <div className="md:col-span-2">
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          id="companyName"
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="ABC Trading Company"
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="+1234567890"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={loading || !formData.fullName}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? 'Updating...' : isSetupMode ? 'Complete Setup' : 'Update Profile'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Wallets</CardTitle>
                <CardDescription>
                  Manage your connected wallets and blockchain accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {walletsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading wallets...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {user && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{user.walletType} Wallet</h3>
                            <p className="text-sm text-gray-600">{user.hederaAccountId}</p>
                            <Badge className="mt-2 bg-green-100 text-green-800">Primary</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Connected</p>
                            <p className="text-xs text-gray-400">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Button variant="outline" className="w-full">
                      + Connect Additional Wallet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Assets</CardTitle>
                <CardDescription>
                  View your tokenized crops, NFTs, and other blockchain assets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {assetsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading assets...</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-gray-600 mb-4">No assets found</p>
                    <p className="text-sm text-gray-500">
                      {user?.role === 'FARMER' 
                        ? 'Start by recording your first harvest to create tokenized assets'
                        : 'Purchase tokenized agricultural products to see them here'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Account Type</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className={getRoleColor(user?.role || 'FARMER')}>
                        {getRoleIcon(user?.role || 'FARMER')} {user?.role}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {user?.role === 'FARMER' 
                          ? 'You can record harvests and create tokenized crops'
                          : 'You can purchase and verify agricultural products'
                        }
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Type
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Email Verification</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                      <Badge className={user?.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {user?.emailVerified ? '✓ Verified' : '⚠ Not Verified'}
                      </Badge>
                    </div>
                    {!user?.emailVerified && (
                      <Button variant="outline" size="sm">
                        Verify Email
                      </Button>
                    )}
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-red-600">Danger Zone</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    These actions cannot be undone. Please be careful.
                  </p>
                  <Button variant="destructive" size="sm">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}