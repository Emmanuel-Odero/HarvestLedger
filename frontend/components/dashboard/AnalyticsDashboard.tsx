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
  AnalyticsData,
  YieldPrediction,
  MarketTrend,
  SustainabilityMetric,
  FinancialMetric,
} from "@/lib/demo-data-service";

interface AnalyticsDashboardProps {
  demoMode?: boolean;
}

export function AnalyticsDashboard({
  demoMode = true,
}: AnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<
    "all" | "coffee" | "maize" | "wheat"
  >("all");
  const [timePeriod, setTimePeriod] = useState<"month" | "quarter" | "year">(
    "quarter"
  );

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      if (!demoDataService.isInitialized()) {
        await demoDataService.initialize();
      }

      const data = demoDataService.getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCropIcon = (cropType: string): string => {
    const icons: Record<string, string> = {
      coffee: "☕",
      maize: "🌽",
      wheat: "🌾",
    };
    return icons[cropType] || "🌱";
  };

  const getTrendIcon = (change: number): string => {
    if (change > 0) return "📈";
    if (change < 0) return "📉";
    return "➡️";
  };

  const getTrendColor = (change: number): string => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getSustainabilityColor = (score: number): string => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

  if (loading || !analyticsData) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            Loading analytics data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredYieldPredictions =
    selectedCrop === "all"
      ? analyticsData.yieldPredictions
      : analyticsData.yieldPredictions.filter(
          (p) => p.cropType === selectedCrop
        );

  const filteredMarketTrends =
    selectedCrop === "all"
      ? analyticsData.marketTrends
      : analyticsData.marketTrends.filter((t) => t.cropType === selectedCrop);

  return (
    <div className="space-y-4">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Data-driven insights from blockchain-verified information
              </CardDescription>
            </div>
            {demoMode && (
              <Badge variant="secondary" className="text-xs">
                Demo Mode
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={selectedCrop === "all" ? "default" : "outline"}
              onClick={() => setSelectedCrop("all")}
            >
              All Crops
            </Button>
            <Button
              size="sm"
              variant={selectedCrop === "coffee" ? "default" : "outline"}
              onClick={() => setSelectedCrop("coffee")}
            >
              ☕ Coffee
            </Button>
            <Button
              size="sm"
              variant={selectedCrop === "maize" ? "default" : "outline"}
              onClick={() => setSelectedCrop("maize")}
            >
              🌽 Maize
            </Button>
            <Button
              size="sm"
              variant={selectedCrop === "wheat" ? "default" : "outline"}
              onClick={() => setSelectedCrop("wheat")}
            >
              🌾 Wheat
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="market" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="market">Market Trends</TabsTrigger>
          <TabsTrigger value="yield">Yield Predictions</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Market Trends Tab */}
        <TabsContent value="market" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredMarketTrends.map((trend) => (
              <Card key={trend.cropType}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {getCropIcon(trend.cropType)}
                    </span>
                    <CardTitle className="text-lg capitalize">
                      {trend.cropType}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold">
                      ${trend.currentPrice.toFixed(2)}
                    </div>
                    <div
                      className={`text-sm flex items-center gap-1 ${getTrendColor(
                        trend.priceChange
                      )}`}
                    >
                      <span>{getTrendIcon(trend.priceChange)}</span>
                      <span>
                        {trend.priceChange >= 0 ? "+" : ""}
                        {trend.priceChange.toFixed(2)} (
                        {trend.priceChangePercent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volume:</span>
                      <span className="font-semibold">
                        {trend.volume.toLocaleString()} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Volume Change:</span>
                      <span className={getTrendColor(trend.volumeChange)}>
                        {trend.volumeChange >= 0 ? "+" : ""}
                        {trend.volumeChange.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-semibold text-sm mb-2">Forecast</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Month:</span>
                        <span className="font-semibold">
                          ${trend.forecast.nextMonth.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Quarter:</span>
                        <span className="font-semibold">
                          ${trend.forecast.nextQuarter.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span
                          className={`font-semibold ${getConfidenceColor(
                            trend.forecast.confidence
                          )}`}
                        >
                          {(trend.forecast.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market Insights */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="text-2xl">📊</div>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Market Insights</p>
                  <p className="text-gray-700">
                    Market trends are calculated from blockchain-verified
                    transactions across the network. Price forecasts use
                    historical data, seasonal patterns, and supply chain
                    analytics to predict future market conditions with high
                    confidence.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yield Predictions Tab */}
        <TabsContent value="yield" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredYieldPredictions.slice(0, 6).map((prediction, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getCropIcon(prediction.cropType)}
                      </span>
                      <div>
                        <CardTitle className="text-base capitalize">
                          {prediction.cropType}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {prediction.region}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={getConfidenceColor(prediction.confidence)}
                    >
                      {(prediction.confidence * 100).toFixed(0)}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {prediction.predictedYield.toFixed(1)} kg/ha
                    </div>
                    <div className="text-sm text-gray-600">
                      {prediction.timeframe}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">
                      Contributing Factors
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Weather</span>
                          <span className="font-semibold">
                            {(prediction.factors.weather * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${prediction.factors.weather * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Soil Quality</span>
                          <span className="font-semibold">
                            {(prediction.factors.soilQuality * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${prediction.factors.soilQuality * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            Historical Performance
                          </span>
                          <span className="font-semibold">
                            {(
                              prediction.factors.historicalPerformance * 100
                            ).toFixed(0)}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${
                                prediction.factors.historicalPerformance * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Crop Variety</span>
                          <span className="font-semibold">
                            {(prediction.factors.cropVariety * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-600 h-2 rounded-full"
                            style={{
                              width: `${prediction.factors.cropVariety * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Yield Insights */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="text-2xl">🌱</div>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Yield Prediction Model</p>
                  <p className="text-gray-700">
                    Predictions combine blockchain-verified historical yields,
                    IoT sensor data, weather patterns, and soil analysis to
                    forecast future crop performance. This helps farmers make
                    informed decisions about planting and resource allocation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sustainability Tab */}
        <TabsContent value="sustainability" className="space-y-4 mt-4">
          <div className="space-y-3">
            {analyticsData.sustainabilityMetrics.slice(0, 10).map((metric) => (
              <Card key={metric.farmId}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-semibold">{metric.farmName}</h4>
                      <p className="text-sm text-gray-600">
                        Overall Score: {metric.overallScore.toFixed(1)}/100
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className={getSustainabilityColor(metric.overallScore)}
                    >
                      {metric.overallScore >= 80
                        ? "Excellent"
                        : metric.overallScore >= 60
                        ? "Good"
                        : "Needs Improvement"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">
                        Carbon Footprint
                      </div>
                      <div className="text-lg font-semibold">
                        {metric.carbonFootprint.toFixed(1)} tCO₂
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Water Usage</div>
                      <div className="text-lg font-semibold">
                        {metric.waterUsage.toLocaleString()} L
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Soil Health</div>
                      <div className="text-lg font-semibold">
                        {metric.soilHealth.toFixed(1)}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Biodiversity</div>
                      <div className="text-lg font-semibold">
                        {metric.biodiversityScore.toFixed(1)}/100
                      </div>
                    </div>
                  </div>

                  {metric.certifications.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-2">
                        Certifications:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {metric.certifications.map((cert, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {cert.replace("_", " ").toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {metric.improvements.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">
                        Suggested Improvements:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {metric.improvements.map((improvement, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            💡 {improvement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sustainability Insights */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="text-2xl">🌍</div>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Sustainability Tracking</p>
                  <p className="text-gray-700">
                    Blockchain-verified sustainability metrics provide
                    transparent tracking of environmental impact. IoT sensors
                    monitor resource usage, while certifications are immutably
                    recorded, enabling premium pricing for sustainable
                    practices.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Metrics Tab */}
        <TabsContent value="financial" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData.financialMetrics.map((metric) => (
              <Card key={metric.period}>
                <CardHeader>
                  <CardTitle className="text-lg">{metric.period}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(metric.totalRevenue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Loans</div>
                      <div className="text-2xl font-bold">
                        {metric.totalLoans}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Loan Size:</span>
                      <span className="font-semibold">
                        {formatCurrency(metric.averageLoanSize)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Default Rate:</span>
                      <span
                        className={
                          metric.defaultRate < 5
                            ? "text-green-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }
                      >
                        {metric.defaultRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Collateral Utilization:
                      </span>
                      <span className="font-semibold">
                        {metric.collateralUtilization.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tokenization Rate:</span>
                      <span className="font-semibold">
                        {metric.tokenizationRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Financial Insights */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="text-2xl">💼</div>
                <div className="text-sm">
                  <p className="font-semibold mb-1">Financial Analytics</p>
                  <p className="text-gray-700">
                    All financial metrics are derived from blockchain-verified
                    transactions, providing accurate and tamper-proof financial
                    reporting. Smart contracts ensure automated settlements and
                    reduce default risk through collateral management.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
