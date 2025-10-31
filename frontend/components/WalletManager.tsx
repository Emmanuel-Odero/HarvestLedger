'use client'

import React, { useState, useEffect } from 'react'
import { useLazyQuery, useMutation } from '@apollo/client'
import { WalletLinkingModal } from './WalletLinkingModal'
import { useAuth } from '../lib/auth-context'

const GET_USER_WALLETS = `
  query GetUserWallets($userId: String!) {
    getUserWallets(userId: $userId) {
      id
      walletAddress
      walletType
      isPrimary
      firstUsedAt
      lastUsedAt
      createdAt
    }
  }
`

const SET_PRIMARY_WALLET = `
  mutation SetPrimaryWallet($userId: String!, $walletId: String!) {
    setPrimaryWallet(userId: $userId, walletId: $walletId)
  }
`

interface UserWallet {
  id: string
  walletAddress: string
  walletType: string
  isPrimary: boolean
  firstUsedAt: string
  lastUsedAt: string
  createdAt: string
}

export function WalletManager() {
  const [wallets, setWallets] = useState<UserWallet[]>([])
  const [showLinkingModal, setShowLinkingModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  const [getUserWallets] = useLazyQuery(GET_USER_WALLETS)
  const [setPrimaryWallet] = useMutation(SET_PRIMARY_WALLET)

  useEffect(() => {
    if (user) {
      loadWallets()
    }
  }, [user])

  const loadWallets = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const { data } = await getUserWallets({
        variables: { userId: user.id }
      })

      if (data?.getUserWallets) {
        setWallets(data.getUserWallets)
      }
    } catch (error) {
      console.error('Failed to load wallets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetPrimary = async (walletId: string) => {
    if (!user) return

    try {
      const { data } = await setPrimaryWallet({
        variables: {
          userId: user.id,
          walletId: walletId
        }
      })

      if (data?.setPrimaryWallet) {
        // Refresh wallets list
        await loadWallets()
      }
    } catch (error) {
      console.error('Failed to set primary wallet:', error)
    }
  }

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getWalletIcon = (walletType: string) => {
    const iconMap: { [key: string]: string } = {
      'HASHPACK': '/icons/hashpack.svg',
      'BLADE': '/icons/blade.svg',
      'KABILA': '/icons/kabila.svg',
      'METAMASK': '/icons/metamask.svg',
      'PORTAL': '/icons/portal.svg'
    }
    return iconMap[walletType] || '/icons/wallet.svg'
  }

  const getWalletName = (walletType: string) => {
    const nameMap: { [key: string]: string } = {
      'HASHPACK': 'HashPack',
      'BLADE': 'Blade Wallet',
      'KABILA': 'Kabila',
      'METAMASK': 'MetaMask',
      'PORTAL': 'Hedera Portal'
    }
    return nameMap[walletType] || walletType
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Connected Wallets</h3>
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Connected Wallets</h3>
          <button
            onClick={() => setShowLinkingModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            Link New Wallet
          </button>
        </div>

        {wallets.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">No wallets connected</p>
            <button
              onClick={() => setShowLinkingModal(true)}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Connect your first wallet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  wallet.isPrimary ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={getWalletIcon(wallet.walletType)}
                    alt={getWalletName(wallet.walletType)}
                    className="w-10 h-10"
                    onError={(e) => {
                      e.currentTarget.src = '/icons/wallet.svg'
                    }}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{getWalletName(wallet.walletType)}</h4>
                      {wallet.isPrimary && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatAddress(wallet.walletAddress)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last used: {formatDate(wallet.lastUsedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!wallet.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(wallet.id)}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      Set as Primary
                    </button>
                  )}
                  <button className="text-sm text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900">Multi-Wallet Benefits</h4>
              <p className="text-sm text-blue-700 mt-1">
                Link multiple wallets to your account for convenience. Use different wallets for different purposes while maintaining a single Harvest Ledger identity.
              </p>
            </div>
          </div>
        </div>
      </div>

      <WalletLinkingModal
        isOpen={showLinkingModal}
        onClose={() => setShowLinkingModal(false)}
        onSuccess={loadWallets}
      />
    </>
  )
}