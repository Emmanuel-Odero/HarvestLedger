"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoDataService } from "@/lib/demo-data-service";
import type { HTSToken, ProvenanceRecord } from "@/lib/demo-data-service";

interface SupplyChainVisualizationProps {
  cropBatchId?: string;
  showVerificationBadges?: boolean;
  interactiveMode?: boolean;
}

export function SupplyChainVisualization({
  cropBatchId,
  showVerificationBadges = true,
  interactiveMode = true,
}: SupplyChainVisualizationProps) {
  const [token, setToken] = useState<HTSToken | null>(null);
  const [selectedStage, setSelectedStage] = useState<ProvenanceRecord | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [availableTokens, setAvailableTokens] = useState<HTSToken[]>([]);

  useEffect(() => {
    loadSupplyChainData();
  }, [cropBatchId]);

  const loadSupplyChainData = async () => {
    try {
      setLoading(true);
      if (!demoDataService.isInitialized()) {
        await demoDataService.initialize();
      }

      const tokens = demoDataService.getHTSTokens();
      setAvailableTokens(tokens);

      if (cropBatchId) {
        const foundToken = tokens.find(
          (t) => t.metadata.cropBatchId === cropBatchId
        );
        setToken(foundToken || tokens[0]);
      } else {
        setToken(tokens[0]);
      }
    } catch (error) {
      console.error("Error loading supply chain data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStageIcon = (stage: ProvenanceRecord["stage"]): string => {
    const icons: Record<ProvenanceRecord["stage"], string> = {
      planting: "🌱",
      growing: "🌿",
      harvest: "🌾",
      processing: "⚙️",
      transport: "🚚",
      storage: "📦",
      sale: "🏪",
    };
    return icons[stage];
  };

  const getStageColor = (stage: ProvenanceRecord["stage"]): string => {
    const colors: Record<ProvenanceRecord["stage"], string> = {
      planting: "bg-green-100 border-green-300",
      growing: "bg-green-200 border-green-400",
      harvest: "bg-yellow-100 border-yellow-300",
      processing: "bg-blue-100 border-blue-300",
      transport: "bg-purple-100 border-purple-300",
      storage: "bg-gray-100 border-gray-300",
      sale: "bg-orange-100 border-orange-300",
    };
    return colors[stage];
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            Loading supply chain data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            No supply chain data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const provenance = token.metadata.provenance || [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Supply Chain Visualization</CardTitle>
              <CardDescription>
                Track crop journey from farm to consumer with blockchain
                verification
              </CardDescription>
            </div>
            {interactiveMode && availableTokens.length > 1 && (
              <select
                className="text-sm border rounded px-3 py-1"
                value={token.tokenId}
                onChange={(e) => {
                  const selected = availableTokens.find(
                    (t) => t.tokenId === e.target.value
                  );
                  if (selected) setToken(selected);
                }}
              >
                {availableTokens.slice(0, 10).map((t) => (
                  <option key={t.tokenId} value={t.tokenId}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Token Overview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{token.name}</h3>
                <p className="text-sm text-gray-600">
                  Token ID: {token.tokenId}
                </p>
              </div>
              <Badge variant="default" className="bg-green-600">
                {token.symbol}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Supply:</span>
                <p className="font-semibold">{token.totalSupply} units</p>
              </div>
              <div>
                <span className="text-gray-600">Quality Grade:</span>
                <p className="font-semibold">
                  {token.metadata.qualityMetrics.overallGrade}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Certifications:</span>
                <p className="font-semibold">
                  {token.metadata.certifications.length}
                </p>
              </div>
            </div>
          </div>

          {/* Supply Chain Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300" />

            <div className="space-y-6">
              {provenance.map((record, index) => (
                <div key={index} className="relative pl-20">
                  {/* Stage icon */}
                  <div
                    className={`absolute left-0 w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl ${getStageColor(
                      record.stage
                    )} ${
                      interactiveMode
                        ? "cursor-pointer hover:scale-110 transition-transform"
                        : ""
                    }`}
                    onClick={() => interactiveMode && setSelectedStage(record)}
                  >
                    {getStageIcon(record.stage)}
                  </div>

                  {/* Stage content */}
                  <div className="border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold capitalize">
                          {record.stage}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatTimestamp(record.timestamp)}
                        </p>
                      </div>
                      {showVerificationBadges && record.verified && (
                        <Badge
                          variant="default"
                          className="bg-green-600 text-xs"
                        >
                          ✓ Blockchain Verified
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-gray-600">📍 Location:</span>
                        <span>{record.location.address}</span>
                        {record.location.verified && (
                          <Badge variant="outline" className="text-xs">
                            GPS ✓
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-gray-600">👤 Actor:</span>
                        <span>
                          {record.actor.name} ({record.actor.role})
                        </span>
                      </div>

                      {record.data && Object.keys(record.data).length > 0 && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <div className="flex gap-4">
                            {record.data.temperature && (
                              <span>🌡️ {record.data.temperature}°C</span>
                            )}
                            {record.data.humidity && (
                              <span>💧 {record.data.humidity}%</span>
                            )}
                            {record.data.qualityScore && (
                              <span>
                                ⭐ Quality: {record.data.qualityScore}/100
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 font-mono truncate">
                        TX: {record.hederaTransactionId}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transfer History */}
          {token.transferHistory.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-3">Ownership Transfers</h4>
              <div className="space-y-2">
                {token.transferHistory.slice(0, 3).map((transfer, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {transfer.from.slice(0, 10)}...
                      </span>
                      <span>→</span>
                      <span className="font-mono text-xs">
                        {transfer.to.slice(0, 10)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {transfer.transferType}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(transfer.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage Detail Modal */}
      {selectedStage && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {getStageIcon(selectedStage.stage)}
                </div>
                <div>
                  <CardTitle className="text-lg capitalize">
                    {selectedStage.stage} Details
                  </CardTitle>
                  <CardDescription>
                    {formatTimestamp(selectedStage.timestamp)}
                  </CardDescription>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedStage(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Location Information
                </h4>
                <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span>{selectedStage.location.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coordinates:</span>
                    <span className="font-mono text-xs">
                      {selectedStage.location.coordinates[0]},{" "}
                      {selectedStage.location.coordinates[1]}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GPS Verified:</span>
                    <Badge
                      variant={
                        selectedStage.location.verified
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedStage.location.verified ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Blockchain Verification
                </h4>
                <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs">
                      {selectedStage.hederaTransactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consensus Timestamp:</span>
                    <span className="font-mono text-xs">
                      {selectedStage.consensusTimestamp}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Verified:</span>
                    <Badge
                      variant={
                        selectedStage.verified ? "default" : "destructive"
                      }
                    >
                      {selectedStage.verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button size="sm" variant="outline" className="w-full">
                View on HashScan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Tooltip */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-2xl">🔗</div>
            <div className="text-sm">
              <p className="font-semibold mb-1">Supply Chain Transparency</p>
              <p className="text-gray-700">
                Every step in the supply chain is recorded on the blockchain
                with GPS verification, timestamps, and quality data. This
                creates an immutable audit trail that builds trust between
                farmers, processors, and consumers while preventing fraud and
                ensuring quality.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
