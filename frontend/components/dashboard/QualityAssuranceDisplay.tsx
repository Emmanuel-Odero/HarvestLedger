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
import type {
  HTSToken,
  QualityMetrics,
  TemperatureReading,
  HumidityReading,
} from "@/lib/demo-data-service";

interface QualityAssuranceDisplayProps {
  tokenId?: string;
  showIoTData?: boolean;
  showCertifications?: boolean;
}

export function QualityAssuranceDisplay({
  tokenId,
  showIoTData = true,
  showCertifications = true,
}: QualityAssuranceDisplayProps) {
  const [token, setToken] = useState<HTSToken | null>(null);
  const [availableTokens, setAvailableTokens] = useState<HTSToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<
    "temperature" | "humidity"
  >("temperature");

  useEffect(() => {
    loadQualityData();
  }, [tokenId]);

  const loadQualityData = async () => {
    try {
      setLoading(true);
      if (!demoDataService.isInitialized()) {
        await demoDataService.initialize();
      }

      const tokens = demoDataService.getHTSTokens();
      setAvailableTokens(tokens);

      if (tokenId) {
        const foundToken = tokens.find((t) => t.tokenId === tokenId);
        setToken(foundToken || tokens[0]);
      } else {
        setToken(tokens[0]);
      }
    } catch (error) {
      console.error("Error loading quality data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (score: number): string => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityBadge = (
    score: number
  ): { variant: "default" | "secondary" | "destructive"; text: string } => {
    if (score >= 90) return { variant: "default", text: "Excellent" };
    if (score >= 75) return { variant: "secondary", text: "Good" };
    return { variant: "destructive", text: "Needs Attention" };
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCertificationIcon = (certId: string): string => {
    if (certId.startsWith("ORG")) return "🌿";
    if (certId.startsWith("FT")) return "🤝";
    if (certId.startsWith("RA")) return "🌳";
    if (certId.startsWith("UTZ")) return "✓";
    return "🏆";
  };

  const getCertificationName = (certId: string): string => {
    if (certId.startsWith("ORG")) return "Organic Certified";
    if (certId.startsWith("FT")) return "Fair Trade";
    if (certId.startsWith("RA")) return "Rainforest Alliance";
    if (certId.startsWith("UTZ")) return "UTZ Certified";
    return "Certified";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            Loading quality data...
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
            No quality data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = token.metadata.qualityMetrics;
  const qualityBadge = getQualityBadge(metrics.certificationScore);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Quality Assurance Dashboard</CardTitle>
              <CardDescription>
                Real-time quality metrics and IoT sensor data
              </CardDescription>
            </div>
            {availableTokens.length > 1 && (
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
          {/* Overall Quality Score */}
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm text-gray-600 mb-1">
                  Overall Quality Score
                </h3>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-4xl font-bold ${getQualityColor(
                      metrics.certificationScore
                    )}`}
                  >
                    {metrics.certificationScore}
                  </span>
                  <span className="text-2xl text-gray-400">/100</span>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={qualityBadge.variant}
                  className="text-lg px-4 py-2"
                >
                  {qualityBadge.text}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Grade: {metrics.overallGrade}
                </p>
              </div>
            </div>
          </div>

          {/* Quality Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="border rounded-lg p-4 bg-white">
              <div className="text-sm text-gray-600 mb-1">Moisture Content</div>
              <div className="text-2xl font-bold">
                {metrics.moistureContent}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.moistureContent >= 10 &&
                metrics.moistureContent <= 12 ? (
                  <span className="text-green-600">✓ Optimal</span>
                ) : (
                  <span className="text-yellow-600">⚠ Monitor</span>
                )}
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-white">
              <div className="text-sm text-gray-600 mb-1">Defect Count</div>
              <div className="text-2xl font-bold">{metrics.defectCount}</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.defectCount <= 5 ? (
                  <span className="text-green-600">✓ Low</span>
                ) : (
                  <span className="text-red-600">✗ High</span>
                )}
              </div>
            </div>

            {metrics.screenSize && (
              <div className="border rounded-lg p-4 bg-white">
                <div className="text-sm text-gray-600 mb-1">Screen Size</div>
                <div className="text-2xl font-bold">{metrics.screenSize}</div>
                <div className="text-xs text-gray-500 mt-1">mesh</div>
              </div>
            )}

            {metrics.proteinContent && (
              <div className="border rounded-lg p-4 bg-white">
                <div className="text-sm text-gray-600 mb-1">
                  Protein Content
                </div>
                <div className="text-2xl font-bold">
                  {metrics.proteinContent}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {metrics.proteinContent >= 11 ? (
                    <span className="text-green-600">✓ Good</span>
                  ) : (
                    <span className="text-yellow-600">⚠ Low</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* GPS Verification */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📍</div>
                <div>
                  <h4 className="font-semibold text-sm">GPS Verification</h4>
                  <p className="text-xs text-gray-600">
                    Location authenticity confirmed
                  </p>
                </div>
              </div>
              <Badge variant={metrics.gpsVerified ? "default" : "secondary"}>
                {metrics.gpsVerified ? "✓ Verified" : "Pending"}
              </Badge>
            </div>
          </div>

          {/* IoT Sensor Data */}
          {showIoTData && (
            <Tabs
              value={selectedMetric}
              onValueChange={(v) => setSelectedMetric(v as any)}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="temperature">🌡️ Temperature</TabsTrigger>
                <TabsTrigger value="humidity">💧 Humidity</TabsTrigger>
              </TabsList>

              <TabsContent value="temperature" className="mt-4">
                <div className="border rounded-lg p-4 bg-white">
                  <h4 className="font-semibold mb-3 text-sm">
                    Temperature Monitoring
                  </h4>
                  <div className="space-y-2">
                    {metrics.temperatureLog.slice(-5).map((reading, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600">
                          {formatTimestamp(reading.timestamp)}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(reading.value / 40) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="font-semibold w-16 text-right">
                            {reading.value}°
                            {reading.unit === "celsius" ? "C" : "F"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    <p>
                      Average:{" "}
                      {(
                        metrics.temperatureLog.reduce(
                          (sum, r) => sum + r.value,
                          0
                        ) / metrics.temperatureLog.length
                      ).toFixed(1)}
                      °C
                    </p>
                    <p className="text-green-600">
                      ✓ Within optimal range (18-28°C)
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="humidity" className="mt-4">
                <div className="border rounded-lg p-4 bg-white">
                  <h4 className="font-semibold mb-3 text-sm">
                    Humidity Monitoring
                  </h4>
                  <div className="space-y-2">
                    {metrics.humidityLog.slice(-5).map((reading, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600">
                          {formatTimestamp(reading.timestamp)}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${reading.value}%` }}
                            />
                          </div>
                          <span className="font-semibold w-16 text-right">
                            {reading.value}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    <p>
                      Average:{" "}
                      {(
                        metrics.humidityLog.reduce(
                          (sum, r) => sum + r.value,
                          0
                        ) / metrics.humidityLog.length
                      ).toFixed(1)}
                      %
                    </p>
                    <p className="text-green-600">
                      ✓ Within optimal range (45-85%)
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Certifications */}
          {showCertifications && token.metadata.certifications.length > 0 && (
            <div className="border rounded-lg p-4 bg-white">
              <h4 className="font-semibold mb-3 text-sm">
                Active Certifications
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {token.metadata.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl">{getCertificationIcon(cert)}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {getCertificationName(cert)}
                      </p>
                      <p className="text-xs text-gray-600">ID: {cert}</p>
                    </div>
                    <Badge variant="default" className="bg-green-600 text-xs">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              📊 Download Report
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              📧 Share Certificate
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              🔍 View Full History
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Educational Tooltip */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-2xl">🔬</div>
            <div className="text-sm">
              <p className="font-semibold mb-1">Quality Assurance with IoT</p>
              <p className="text-gray-700">
                IoT sensors continuously monitor temperature, humidity, and
                other environmental factors throughout the supply chain. This
                data is recorded on the blockchain, providing verifiable proof
                of proper handling and storage conditions. Combined with
                certifications and quality testing, this creates a comprehensive
                quality assurance system that builds trust and commands premium
                prices.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
