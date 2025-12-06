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
import type { HCSMessage } from "@/lib/demo-data-service";

interface LiveHCSTopicViewerProps {
  topicId?: string;
  demoMode?: boolean;
  realTimeUpdates?: boolean;
  limit?: number;
}

interface ParsedHarvestData {
  cropBatchId: string;
  farmerId: string;
  harvestDate: string;
  qualityMetrics?: {
    moistureContent?: number;
    defectCount?: number;
    overallGrade?: string;
    certificationScore?: number;
    gpsVerified?: boolean;
  };
  gpsCoordinates?: [number, number];
  certifications?: string[];
  sensorData?: {
    temperature?: number;
    humidity?: number;
    soilMoisture?: number;
  };
  verified?: boolean;
}

export function LiveHCSTopicViewer({
  topicId = "0.0.1001",
  demoMode = true,
  realTimeUpdates = false,
  limit = 10,
}: LiveHCSTopicViewerProps) {
  const [messages, setMessages] = useState<HCSMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<HCSMessage | null>(
    null
  );
  const [autoRefresh, setAutoRefresh] = useState(realTimeUpdates);

  useEffect(() => {
    loadMessages();
  }, [topicId, limit]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadMessages();
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, topicId, limit]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      if (!demoDataService.isInitialized()) {
        await demoDataService.initialize();
      }
      const hcsMessages = demoDataService.getHCSMessagesByTopic(topicId);
      setMessages(hcsMessages.slice(0, limit));
    } catch (error) {
      console.error("Error loading HCS messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseMessageData = (message: string): ParsedHarvestData | null => {
    try {
      return JSON.parse(message);
    } catch {
      return null;
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const [seconds] = timestamp.split(".");
    const date = new Date(parseInt(seconds) * 1000);
    return date.toLocaleString();
  };

  const getTopicName = (topicId: string): string => {
    const topicNames: Record<string, string> = {
      "0.0.1001": "Coffee Harvests",
      "0.0.1002": "Maize Harvests",
      "0.0.1003": "Wheat Harvests",
    };
    return topicNames[topicId] || "Agricultural Records";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                Live HCS Topic Viewer
                {demoMode && (
                  <Badge variant="secondary" className="text-xs">
                    Demo Mode
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Real-time harvest records from Hedera Consensus Service
                <br />
                <span className="font-mono text-xs">{topicId}</span> -{" "}
                {getTopicName(topicId)}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "⏸ Pause" : "▶ Auto-Refresh"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={loadMessages}
                disabled={loading}
              >
                {loading ? "⟳ Loading..." : "↻ Refresh"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading && messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No messages found for this topic
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => {
                const parsedData = parseMessageData(message.message);
                return (
                  <div
                    key={`${message.transactionId}-${index}`}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-600">
                          ✓ Verified
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Seq #{message.sequenceNumber}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.consensusTimestamp)}
                      </span>
                    </div>

                    {parsedData && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Batch ID:</span>
                            <span className="ml-2 font-mono text-xs">
                              {parsedData.cropBatchId.slice(0, 8)}...
                            </span>
                          </div>
                          {parsedData.qualityMetrics?.overallGrade && (
                            <div>
                              <span className="text-gray-600">Grade:</span>
                              <span className="ml-2 font-semibold">
                                {parsedData.qualityMetrics.overallGrade}
                              </span>
                            </div>
                          )}
                        </div>

                        {parsedData.qualityMetrics && (
                          <div className="flex gap-2 flex-wrap">
                            {parsedData.qualityMetrics.gpsVerified && (
                              <Badge variant="outline" className="text-xs">
                                📍 GPS Verified
                              </Badge>
                            )}
                            {parsedData.certifications &&
                              parsedData.certifications.length > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  🏆 {parsedData.certifications.length}{" "}
                                  Certifications
                                </Badge>
                              )}
                            {parsedData.sensorData && (
                              <Badge variant="outline" className="text-xs">
                                🌡️ IoT Monitored
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="text-xs text-gray-500 font-mono truncate">
                          TX: {message.transactionId}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Message Details</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedMessage(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Blockchain Verification
                </h4>
                <div className="bg-gray-50 p-3 rounded space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs">
                      {selectedMessage.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Consensus Timestamp:</span>
                    <span className="font-mono text-xs">
                      {formatTimestamp(selectedMessage.consensusTimestamp)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payer Account:</span>
                    <span className="font-mono text-xs">
                      {selectedMessage.payerAccountId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Running Hash:</span>
                    <span className="font-mono text-xs truncate max-w-xs">
                      {selectedMessage.runningHash.slice(0, 16)}...
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Harvest Data</h4>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(
                    parseMessageData(selectedMessage.message),
                    null,
                    2
                  )}
                </pre>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View on HashScan
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Export Data
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
            <div className="text-2xl">💡</div>
            <div className="text-sm">
              <p className="font-semibold mb-1">
                Why Hedera Consensus Service?
              </p>
              <p className="text-gray-700">
                HCS provides immutable, timestamped records of harvest data that
                cannot be altered or deleted. Each message is cryptographically
                verified and stored on the Hedera network, ensuring complete
                transparency and traceability throughout the supply chain.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
