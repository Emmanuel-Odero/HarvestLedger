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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { demoDataService } from "@/lib/demo-data-service";
import type { HTSToken } from "@/lib/demo-data-service";

interface TokenizationInterfaceProps {
  walletConnected?: boolean;
  demoMode?: boolean;
}

interface CropBatch {
  id: string;
  cropType: string;
  quantity: number;
  qualityGrade: string;
  farmName: string;
  harvestDate: string;
  tokenized: boolean;
  tokenId?: string;
}

export function TokenizationInterface({
  walletConnected = true,
  demoMode = true,
}: TokenizationInterfaceProps) {
  const [tokens, setTokens] = useState<HTSToken[]>([]);
  const [cropBatches, setCropBatches] = useState<CropBatch[]>([]);
  const [selectedToken, setSelectedToken] = useState<HTSToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenizing, setTokenizing] = useState(false);
  const [filterType, setFilterType] = useState<
    "all" | "coffee" | "maize" | "wheat"
  >("all");

  useEffect(() => {
    loadTokenData();
  }, []);

  const loadTokenData = async () => {
    try {
      setLoading(true);
      if (!demoDataService.isInitialized()) {
        await demoDataService.initialize();
      }

      const htsTokens = demoDataService.getHTSTokens();
      setTokens(htsTokens);

      // Generate mock crop batches
      const farms = demoDataService.getFarms();
      const transactions = demoDataService.getTransactions();

      const batches: CropBatch[] = transactions
        .filter((t) => t.type === "harvest")
        .slice(0, 15)
        .map((t) => {
          const farm = farms.find((f) => f.farmerId === t.farmerId);
          const token = htsTokens.find(
            (tk) => tk.metadata.cropBatchId === t.cropBatchId
          );

          return {
            id: t.cropBatchId,
            cropType: farm?.cropTypes[0] || "coffee",
            quantity: Math.floor(t.amount / 4.5),
            qualityGrade: ["AA", "AB", "C", "Grade 1", "Grade 2"][
              Math.floor(Math.random() * 5)
            ],
            farmName: farm?.name || "Unknown Farm",
            harvestDate: t.timestamp.toISOString(),
            tokenized: !!token,
            tokenId: token?.tokenId,
          };
        });

      setCropBatches(batches);
    } catch (error) {
      console.error("Error loading token data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenize = async (batchId: string) => {
    try {
      setTokenizing(true);
      const batch = cropBatches.find((b) => b.id === batchId);
      if (!batch) return;

      // Simulate tokenization
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newToken = await demoDataService.simulateHTSTokenCreation({
        name: `${batch.farmName} ${batch.cropType} Batch`,
        symbol: `${batch.cropType.toUpperCase().slice(0, 3)}${Math.floor(
          Math.random() * 1000
        )}`,
        cropBatchId: batchId,
        totalSupply: batch.quantity,
      });

      // Update state
      setTokens([...tokens, newToken]);
      setCropBatches(
        cropBatches.map((b) =>
          b.id === batchId
            ? { ...b, tokenized: true, tokenId: newToken.tokenId }
            : b
        )
      );
    } catch (error) {
      console.error("Error tokenizing batch:", error);
    } finally {
      setTokenizing(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCropIcon = (cropType: string): string => {
    const icons: Record<string, string> = {
      coffee: "☕",
      maize: "🌽",
      wheat: "🌾",
    };
    return icons[cropType] || "🌱";
  };

  const filteredTokens = tokens.filter((token) => {
    if (filterType === "all") return true;
    return token.name.toLowerCase().includes(filterType);
  });

  const filteredBatches = cropBatches.filter((batch) => {
    if (filterType === "all") return true;
    return batch.cropType === filterType;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            Loading tokenization data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Crop Tokenization Interface</CardTitle>
              <CardDescription>
                Convert crop batches into tradeable HTS tokens on Hedera
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {walletConnected ? (
                <Badge variant="default" className="bg-green-600">
                  ✓ Wallet Connected
                </Badge>
              ) : (
                <Badge variant="destructive">Wallet Not Connected</Badge>
              )}
              {demoMode && (
                <Badge variant="secondary" className="text-xs">
                  Demo Mode
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <div className="mb-4 flex gap-2">
            <Button
              size="sm"
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
            >
              All Crops
            </Button>
            <Button
              size="sm"
              variant={filterType === "coffee" ? "default" : "outline"}
              onClick={() => setFilterType("coffee")}
            >
              ☕ Coffee
            </Button>
            <Button
              size="sm"
              variant={filterType === "maize" ? "default" : "outline"}
              onClick={() => setFilterType("maize")}
            >
              🌽 Maize
            </Button>
            <Button
              size="sm"
              variant={filterType === "wheat" ? "default" : "outline"}
              onClick={() => setFilterType("wheat")}
            >
              🌾 Wheat
            </Button>
          </div>

          <Tabs defaultValue="tokens" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tokens">
                My Tokens ({filteredTokens.length})
              </TabsTrigger>
              <TabsTrigger value="batches">
                Available Batches (
                {filteredBatches.filter((b) => !b.tokenized).length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tokens" className="space-y-3 mt-4">
              {filteredTokens.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No tokens found. Tokenize crop batches to create HTS tokens.
                </div>
              ) : (
                filteredTokens.map((token) => (
                  <div
                    key={token.tokenId}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedToken(token)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">
                          {getCropIcon(
                            token.name.toLowerCase().includes("coffee")
                              ? "coffee"
                              : token.name.toLowerCase().includes("maize")
                              ? "maize"
                              : "wheat"
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{token.name}</h4>
                          <p className="text-sm text-gray-600">
                            Token ID: {token.tokenId}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className="bg-blue-600">
                        {token.symbol}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Supply:</span>
                        <p className="font-semibold">
                          {token.totalSupply} units
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Grade:</span>
                        <p className="font-semibold">
                          {token.metadata.qualityMetrics.overallGrade}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Transfers:</span>
                        <p className="font-semibold">
                          {token.transferHistory.length}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      {token.metadata.qualityMetrics.gpsVerified && (
                        <Badge variant="outline" className="text-xs">
                          📍 GPS Verified
                        </Badge>
                      )}
                      {token.metadata.certifications.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          🏆 {token.metadata.certifications.length}{" "}
                          Certifications
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        ⭐ Score:{" "}
                        {token.metadata.qualityMetrics.certificationScore}/100
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="batches" className="space-y-3 mt-4">
              {filteredBatches.filter((b) => !b.tokenized).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No available batches to tokenize. All batches have been
                  tokenized.
                </div>
              ) : (
                filteredBatches
                  .filter((batch) => !batch.tokenized)
                  .map((batch) => (
                    <div key={batch.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">
                            {getCropIcon(batch.cropType)}
                          </div>
                          <div>
                            <h4 className="font-semibold capitalize">
                              {batch.cropType} Batch
                            </h4>
                            <p className="text-sm text-gray-600">
                              {batch.farmName}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Not Tokenized</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Quantity:</span>
                          <p className="font-semibold">{batch.quantity} kg</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Grade:</span>
                          <p className="font-semibold">{batch.qualityGrade}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Harvest Date:</span>
                          <p className="font-semibold">
                            {formatDate(batch.harvestDate)}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleTokenize(batch.id)}
                        disabled={tokenizing || !walletConnected}
                      >
                        {tokenizing ? "⟳ Tokenizing..." : "🪙 Tokenize Batch"}
                      </Button>
                    </div>
                  ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Token Detail Modal */}
      {selectedToken && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{selectedToken.name}</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedToken(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Token Information
                </h4>
                <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token ID:</span>
                    <span className="font-mono text-xs">
                      {selectedToken.tokenId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Symbol:</span>
                    <span className="font-semibold">
                      {selectedToken.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Supply:</span>
                    <span>{selectedToken.totalSupply} units</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Treasury Account:</span>
                    <span className="font-mono text-xs">
                      {selectedToken.treasuryAccountId}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Quality Metrics</h4>
                <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Grade:</span>
                    <span className="font-semibold">
                      {selectedToken.metadata.qualityMetrics.overallGrade}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Moisture Content:</span>
                    <span>
                      {selectedToken.metadata.qualityMetrics.moistureContent}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Defect Count:</span>
                    <span>
                      {selectedToken.metadata.qualityMetrics.defectCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Certification Score:</span>
                    <span>
                      {selectedToken.metadata.qualityMetrics.certificationScore}
                      /100
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Certifications</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedToken.metadata.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View on HashScan
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Transfer Token
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  List on Marketplace
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Tooltip */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-2xl">🪙</div>
            <div className="text-sm">
              <p className="font-semibold mb-1">Why Tokenize Crops?</p>
              <p className="text-gray-700">
                Tokenization converts physical crop batches into digital HTS
                tokens that can be traded, used as collateral for loans, or sold
                on marketplaces. Each token represents verified quality,
                provenance, and ownership, making agricultural commerce more
                efficient and transparent while providing farmers with new
                financing options.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
