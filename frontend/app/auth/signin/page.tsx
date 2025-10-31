'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { WalletConnector, WalletType } from '@/lib/wallet-utils'

const SUPPORTED_WALLETS = [
  {
    type: WalletType.HASHPACK,
    name: 'HashPack',
    description: 'The most popular Hedera wallet',
    icon: '🔷'
  },
  {
    type: WalletType.BLADE,
    name: 'Blade Wallet',
    description: 'Multi-chain wallet with Hedera support',
    icon: '⚔️'
  },
  {
    type: WalletType.KABILA,
    name: 'Kabila',
    description: 'Native Hedera wallet',
    icon: '🌟'
  },
  {
    type: WalletType.METAMASK,
    name: 'MetaMask',
    description: 'Popular Ethereum wallet (EVM compatible)',
    icon: '🦊'
  },
  {
    type: WalletType.PORTAL,
    name: 'Hedera Portal',
    description: 'Official Hedera wallet',
    icon: '🌐'
  }
]

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableWallets, setAvailableWallets] = useState<typeof SUPPORTED_WALLETS>([])
  
  const { connectWallet } = useAuth()
  const searchParams = useSearchParams()
  
  const authType = searchParams.get('type') || 'signin'
  const redirectUrl = searchParams.get('redirect')

  useEffect(() => {
    // Check which wallets are available
    const checkWallets = async () => {
      const available = []
      for (const wallet of SUPPORTED_WALLETS) {
        const isAvailable = await WalletConnector.isWalletAvailable(wallet.type)
        if (isAvailable) {
          available.push(wallet)
        }
      }
      setAvailableWallets(available)
    }
    
    checkWallets()
  }, [])

  const handleWalletConnect = async (walletType: WalletType) => {
    try {
      setLoading(true)
      setError(null)
      await connectWallet(walletType, authType)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const getPageTitle = () => {
    switch (authType) {
      case 'trial':
        return 'Start Your Free Trial'
      case 'onboarding':
        return 'Get Started with HarvestLedger'
      default:
        return 'Sign In to HarvestLedger'
    }
  }

  const getPageDescription = () => {
    switch (authType) {
      case 'trial':
        return 'Connect your wallet to start your free trial and explore HarvestLedger\'s features.'
      case 'onboarding':
        return 'Connect your wallet to create your HarvestLedger account and join the decentralized agriculture ecosystem.'
      default:
        return 'Connect your wallet to access your HarvestLedger account.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600">
            {getPageDescription()}
          </p>
          {redirectUrl && (
            <p className="text-sm text-blue-600 mt-2">
              You'll be redirected to {redirectUrl} after signing in.
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {availableWallets.length > 0 ? (
            availableWallets.map((wallet) => (
              <button
                key={wallet.type}
                onClick={() => handleWalletConnect(wallet.type)}
                disabled={loading}
                className="w-full p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-4"
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-900">{wallet.name}</div>
                  <div className="text-sm text-gray-600">{wallet.description}</div>
                </div>
                {loading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                )}
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No supported wallets detected.</p>
              <p className="text-sm text-gray-500">
                Please install one of the supported Hedera wallets:
              </p>
              <div className="mt-4 space-y-2">
                {SUPPORTED_WALLETS.map((wallet) => (
                  <div key={wallet.type} className="text-sm text-gray-600">
                    {wallet.icon} {wallet.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
            Your wallet signature serves as your digital identity verification.
          </p>
        </div>
      </div>
    </div>
  )
}