"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Circle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface BlockchainStatusIndicatorProps {
  blockchain: "hedera" | "cardano";
}

interface BlockchainConnectionStatus {
  connected: boolean;
  address?: string;
  network?: string;
  balance?: string;
  error?: string;
  loading?: boolean;
}

export default function BlockchainStatusIndicator({
  blockchain,
}: BlockchainStatusIndicatorProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<BlockchainConnectionStatus>({
    connected: false,
    loading: false,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    // Check connection status based on user data
    if (blockchain === "hedera" && user?.hederaAccountId) {
      setStatus({
        connected: true,
        address: user.hederaAccountId,
        network: "testnet",
      });
    } else if (blockchain === "cardano" && user?.walletAddress) {
      // Check if this is a Cardano address (starts with addr)
      const isCardanoAddress = user.walletAddress.startsWith("addr");
      if (isCardanoAddress) {
        setStatus({
          connected: true,
          address: user.walletAddress,
          network: "preprod",
        });
      }
    } else {
      setStatus({
        connected: false,
      });
    }
  }, [blockchain, user]);

  const handleConnect = async () => {
    setStatus({ ...status, loading: true });
    // TODO: Implement actual wallet connection logic
    setTimeout(() => {
      setStatus({ ...status, loading: false });
    }, 1000);
  };

  const handleDisconnect = () => {
    setStatus({
      connected: false,
    });
  };

  const getStatusColor = () => {
    if (status.error) return "text-yellow-500";
    if (status.connected) return "text-green-500";
    return "text-gray-400";
  };

  const getStatusIcon = () => {
    if (status.error) return <AlertTriangle className="h-3 w-3" />;
    return <Circle className="h-3 w-3 fill-current" />;
  };

  const truncateAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 h-9"
      >
        <span className={getStatusColor()}>{getStatusIcon()}</span>
        <span className="text-sm font-medium capitalize hidden sm:inline">
          {blockchain}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Dropdown */}
      {dropdownOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />

          {/* Dropdown content */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 capitalize">
                  {blockchain} Network
                </h3>
                <Badge
                  variant={status.connected ? "default" : "secondary"}
                  className={
                    status.connected
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }
                >
                  {status.connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>

              {status.connected ? (
                <div className="space-y-3">
                  {/* Network */}
                  {status.network && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Network
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {status.network}
                      </p>
                    </div>
                  )}

                  {/* Address */}
                  {status.address && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Address
                      </label>
                      <p
                        className="text-sm text-gray-900 mt-1 font-mono break-all"
                        title={status.address}
                      >
                        {truncateAddress(status.address)}
                      </p>
                    </div>
                  )}

                  {/* Balance */}
                  {status.balance && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">
                        Balance
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {status.balance}
                      </p>
                    </div>
                  )}

                  {/* Error */}
                  {status.error && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                          {status.error}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnect}
                      className="w-full"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Connect your {blockchain} wallet to access blockchain
                    features.
                  </p>
                  <Button
                    onClick={handleConnect}
                    disabled={status.loading}
                    className="w-full"
                  >
                    {status.loading ? "Connecting..." : "Connect Wallet"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
