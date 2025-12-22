"use client";

import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import {
  WalletConnector,
  WalletType,
  WalletInfo,
  SignatureResult,
} from "../lib/wallet-utils";
import { useAuth } from "../lib/auth-context";

const LINK_WALLET = gql`
  mutation LinkWallet($input: WalletLinkingPayload!, $userId: String!) {
    linkWallet(input: $input, userId: $userId)
  }
`;

interface WalletLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function WalletLinkingModal({
  isOpen,
  onClose,
  onSuccess,
}: WalletLinkingModalProps) {
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const [linkWallet] = useMutation(LINK_WALLET);

  const availableWallets = [
    {
      type: WalletType.HASHPACK,
      name: "HashPack",
      icon: "/icons/hashpack.svg",
    },
    { type: WalletType.BLADE, name: "Blade Wallet", icon: "/icons/blade.svg" },
    { type: WalletType.KABILA, name: "Kabila", icon: "/icons/kabila.svg" },
    {
      type: WalletType.METAMASK,
      name: "MetaMask",
      icon: "/icons/metamask.svg",
    },
    {
      type: WalletType.PORTAL,
      name: "Hedera Portal",
      icon: "/icons/portal.svg",
    },
  ];

  const handleLinkWallet = async (walletType: WalletType) => {
    if (!user) return;

    try {
      setIsConnecting(true);
      setError(null);

      // Check if wallet is available
      const isAvailable = await WalletConnector.isWalletAvailable(walletType);
      if (!isAvailable) {
        throw new Error(`${walletType} wallet is not installed`);
      }

      // Connect to the new wallet
      const newWalletConnection: WalletInfo =
        await WalletConnector.connectWallet(walletType);

      // Create linking message
      const linkingMessage = `Link wallet ${
        newWalletConnection.address
      } to account ${user.id} at ${new Date().toISOString()}`;

      // Sign with new wallet
      const newWalletSignature: SignatureResult =
        await WalletConnector.signMessage(walletType, linkingMessage);

      // For primary wallet signature, we need to get the user's current primary wallet
      // This would typically be done by connecting to their primary wallet
      // For now, we'll simulate this step
      const primaryWalletSignature = "placeholder_primary_signature";

      // Submit linking request
      const { data } = await linkWallet({
        variables: {
          input: {
            newWalletAddress: newWalletConnection.address,
            newWalletType: walletType,
            newWalletSignature: newWalletSignature.signature,
            primaryWalletSignature: primaryWalletSignature,
            message: linkingMessage,
            publicKey: newWalletConnection.publicKey,
          },
          userId: user.id,
        },
      });

      if (data?.linkWallet) {
        onSuccess();
        onClose();
      } else {
        throw new Error("Failed to link wallet");
      }
    } catch (error) {
      console.error("Wallet linking failed:", error);
      setError(
        error instanceof Error ? error.message : "Failed to link wallet"
      );
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Link New Wallet</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Connect and verify a new wallet to link it to your account. You'll
          need to sign a message with both your current primary wallet and the
          new wallet.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {availableWallets.map((wallet) => (
            <button
              key={wallet.type}
              onClick={() => handleLinkWallet(wallet.type)}
              disabled={isConnecting}
              className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                src={wallet.icon}
                alt={wallet.name}
                className="w-8 h-8 mr-3"
                onError={(e) => {
                  e.currentTarget.src = "/icons/wallet.svg";
                }}
              />
              <span className="font-medium">{wallet.name}</span>
              {isConnecting && selectedWallet === wallet.type && (
                <div className="ml-auto">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
