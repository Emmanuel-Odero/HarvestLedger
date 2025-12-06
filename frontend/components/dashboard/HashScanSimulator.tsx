"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoDataService } from "@/lib/demo-data-service";

interface HashScanSimulatorProps {
  transactionId?: string;
  transactionType?: "HCS" | "HTS" | "SMART_CONTRACT";
  demoMode?: boolean;
}

export function HashScanSimulator({
  transactionId: initialTransactionId,
  transactionType = "HCS",
  demoMode = true,
}: HashScanSimulatorProps) {
  const [transactionId, setTransactionId] = useState(
    initialTransactionId || ""
  );
  const [transactionData, setTransactionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactionData = async (txId: string) => {
    if (!txId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await demoDataService.simulateHashScanLookup(txId);
      setTransactionData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTransactionId) {
      loadTransactionData(initialTransactionId);
    }
  }, [initialTransactionId]);

  const handleSearch = () => {
    loadTransactionData(transactionId);
  };

  const generateSampleTransaction = () => {
    const sampleTxId = demoDataService.generateHederaTransactionId();
    setTransactionId(sampleTxId);
    loadTransactionData(sampleTxId);
  };

  const formatTimestamp = (timestamp: string) => {
    const [seconds, nanos] = timestamp.split(".");
    const date = new Date(parseInt(seconds) * 1000);
    return date.toLocaleString();
  };

  const formatFee = (fee: number) => {
    return `${(fee / 100000000).toFixed(8)} ℏ`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">HashScan Transaction Explorer</h2>
          <p className="text-sm text-gray-600 mt-1">
            View detailed transaction information on Hedera network
          </p>
        </div>
        {demoMode && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Demo Mode
          </Badge>
        )}
      </div>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter transaction ID (e.g., 0.0.12345-1234567890-123)"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleSearch} disabled={loading || !transactionId}>
            {loading ? "Searching..." : "Search"}
          </Button>
          <Button onClick={generateSampleTransaction} variant="outline">
            Generate Sample
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Transaction Details */}
      {transactionData && (
        <div className="space-y-4">
          {/* Status Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Transaction Status</h3>
              <Badge
                variant={
                  transactionData.result === "SUCCESS"
                    ? "default"
                    : "destructive"
                }
                className={
                  transactionData.result === "SUCCESS"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {transactionData.result}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-mono text-sm break-all">
                  {transactionData.transaction_id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction Type</p>
                <p className="font-semibold">{transactionData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Consensus Timestamp</p>
                <p className="text-sm">
                  {formatTimestamp(transactionData.consensus_timestamp)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Node</p>
                <p className="font-mono text-sm">{transactionData.node}</p>
              </div>
            </div>
          </Card>

          {/* Transaction Hash */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Blockchain Verification
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Transaction Hash</p>
                <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">
                  {transactionData.transaction_hash}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-sm text-green-700 font-medium">
                  Verified on Hedera Network
                </span>
              </div>
            </div>
          </Card>

          {/* Fee Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Fee Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Charged Fee</p>
                <p className="font-semibold">
                  {formatFee(transactionData.charged_tx_fee)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Max Fee</p>
                <p className="text-sm">{formatFee(transactionData.max_fee)}</p>
              </div>
            </div>
          </Card>

          {/* Transfers */}
          {transactionData.transfers &&
            transactionData.transfers.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">HBAR Transfers</h3>
                <div className="space-y-2">
                  {transactionData.transfers.map(
                    (transfer: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded"
                      >
                        <span className="font-mono text-sm">
                          {transfer.account}
                        </span>
                        <span
                          className={`font-semibold ${
                            transfer.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transfer.amount > 0 ? "+" : ""}
                          {formatFee(Math.abs(transfer.amount))}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </Card>
            )}

          {/* Additional Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Valid Duration</p>
                <p>{transactionData.valid_duration_seconds}s</p>
              </div>
              <div>
                <p className="text-gray-600">Nonce</p>
                <p className="font-mono">{transactionData.nonce}</p>
              </div>
              <div>
                <p className="text-gray-600">Scheduled</p>
                <p>{transactionData.scheduled ? "Yes" : "No"}</p>
              </div>
              {transactionData.memo_base64 && (
                <div className="col-span-2">
                  <p className="text-gray-600">Memo</p>
                  <p className="font-mono text-xs bg-gray-50 p-2 rounded">
                    {atob(transactionData.memo_base64)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!transactionData && !loading && !error && (
        <Card className="p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Search for a Transaction
          </h3>
          <p className="text-gray-600 mb-4">
            Enter a transaction ID or generate a sample transaction to explore
          </p>
          <Button onClick={generateSampleTransaction}>
            Generate Sample Transaction
          </Button>
        </Card>
      )}
    </div>
  );
}
