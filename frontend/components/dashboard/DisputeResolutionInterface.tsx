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
import type { DisputeRecord, DisputeEvidence } from "@/lib/demo-data-service";

interface DisputeResolutionInterfaceProps {
  demoMode?: boolean;
}

export function DisputeResolutionInterface({
  demoMode = true,
}: DisputeResolutionInterfaceProps) {
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [selectedDispute, setSelectedDispute] = useState<DisputeRecord | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "open" | "investigating" | "resolved" | "escalated"
  >("all");

  useEffect(() => {
    loadDisputeData();
  }, []);

  const loadDisputeData = async () => {
    try {
      setLoading(true);
      if (!demoDataService.isInitialized()) {
        await demoDataService.initialize();
      }

      const allDisputes = demoDataService.getDisputes();
      setDisputes(allDisputes);

      if (allDisputes.length > 0) {
        setSelectedDispute(allDisputes[0]);
      }
    } catch (error) {
      console.error("Error loading dispute data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: DisputeRecord["status"]): string => {
    const colors = {
      open: "bg-yellow-600",
      investigating: "bg-blue-600",
      resolved: "bg-green-600",
      escalated: "bg-red-600",
    };
    return colors[status];
  };

  const getTypeIcon = (type: DisputeRecord["type"]): string => {
    const icons = {
      quality: "⚠️",
      delivery: "🚚",
      payment: "💰",
      contract_breach: "📄",
    };
    return icons[type];
  };

  const getEvidenceIcon = (type: DisputeEvidence["type"]): string => {
    const icons = {
      blockchain_record: "🔗",
      iot_data: "📡",
      document: "📄",
      testimony: "💬",
    };
    return icons[type];
  };

  const filteredDisputes = disputes.filter((dispute) => {
    if (filterStatus === "all") return true;
    return dispute.status === filterStatus;
  });

  const disputeStats = {
    total: disputes.length,
    open: disputes.filter((d) => d.status === "open").length,
    investigating: disputes.filter((d) => d.status === "investigating").length,
    resolved: disputes.filter((d) => d.status === "resolved").length,
    escalated: disputes.filter((d) => d.status === "escalated").length,
    resolutionRate:
      disputes.length > 0
        ? (disputes.filter((d) => d.status === "resolved").length /
            disputes.length) *
          100
        : 0,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            Loading dispute resolution data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{disputeStats.total}</div>
            <div className="text-sm text-gray-600">Total Disputes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{disputeStats.open}</div>
            <div className="text-sm text-gray-600">Open</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {disputeStats.investigating}
            </div>
            <div className="text-sm text-gray-600">Investigating</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{disputeStats.resolved}</div>
            <div className="text-sm text-gray-600">Resolved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {disputeStats.resolutionRate.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Resolution Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dispute Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Dispute Resolution Interface</CardTitle>
              <CardDescription>
                Leverage immutable blockchain records for transparent dispute
                resolution
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
          {/* Filter Buttons */}
          <div className="mb-4 flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={filterStatus === "all" ? "default" : "outline"}
              onClick={() => setFilterStatus("all")}
            >
              All ({disputes.length})
            </Button>
            <Button
              size="sm"
              variant={filterStatus === "open" ? "default" : "outline"}
              onClick={() => setFilterStatus("open")}
            >
              Open ({disputeStats.open})
            </Button>
            <Button
              size="sm"
              variant={filterStatus === "investigating" ? "default" : "outline"}
              onClick={() => setFilterStatus("investigating")}
            >
              Investigating ({disputeStats.investigating})
            </Button>
            <Button
              size="sm"
              variant={filterStatus === "resolved" ? "default" : "outline"}
              onClick={() => setFilterStatus("resolved")}
            >
              Resolved ({disputeStats.resolved})
            </Button>
            <Button
              size="sm"
              variant={filterStatus === "escalated" ? "default" : "outline"}
              onClick={() => setFilterStatus("escalated")}
            >
              Escalated ({disputeStats.escalated})
            </Button>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Dispute List</TabsTrigger>
              <TabsTrigger value="details">
                {selectedDispute ? "Dispute Details" : "Select a Dispute"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-3 mt-4">
              {filteredDisputes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No disputes found matching the selected filter.
                </div>
              ) : (
                filteredDisputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedDispute(dispute)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {getTypeIcon(dispute.type)}
                        </span>
                        <div>
                          <h4 className="font-semibold capitalize">
                            {dispute.type.replace("_", " ")} Dispute
                          </h4>
                          <p className="text-sm text-gray-600">
                            {dispute.initiatedBy} vs {dispute.respondent}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="default"
                        className={getStatusColor(dispute.status)}
                      >
                        {dispute.status.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">
                      {dispute.description}
                    </p>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-4">
                        <span className="text-gray-600">
                          Created: {formatDate(dispute.createdDate)}
                        </span>
                        {dispute.resolvedDate && (
                          <span className="text-gray-600">
                            Resolved: {formatDate(dispute.resolvedDate)}
                          </span>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {dispute.evidence.length} Evidence Items
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              {!selectedDispute ? (
                <div className="text-center py-8 text-gray-500">
                  Select a dispute from the list to view details
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Dispute Overview */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {getTypeIcon(selectedDispute.type)}
                        </span>
                        <div className="flex-1">
                          <CardTitle className="text-lg capitalize">
                            {selectedDispute.type.replace("_", " ")} Dispute
                          </CardTitle>
                          <CardDescription>
                            Dispute ID: {selectedDispute.id.slice(0, 8)}...
                          </CardDescription>
                        </div>
                        <Badge
                          variant="default"
                          className={getStatusColor(selectedDispute.status)}
                        >
                          {selectedDispute.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Description
                        </h4>
                        <p className="text-sm text-gray-700">
                          {selectedDispute.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Initiated By:</span>
                          <p className="font-semibold">
                            {selectedDispute.initiatedBy}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Respondent:</span>
                          <p className="font-semibold">
                            {selectedDispute.respondent}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Created Date:</span>
                          <p className="font-semibold">
                            {formatDate(selectedDispute.createdDate)}
                          </p>
                        </div>
                        {selectedDispute.resolvedDate && (
                          <div>
                            <span className="text-gray-600">
                              Resolved Date:
                            </span>
                            <p className="font-semibold">
                              {formatDate(selectedDispute.resolvedDate)}
                            </p>
                          </div>
                        )}
                      </div>

                      {selectedDispute.resolution && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-sm mb-2">
                            Resolution
                          </h4>
                          <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">
                            {selectedDispute.resolution}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Blockchain Evidence */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Blockchain Evidence
                      </CardTitle>
                      <CardDescription>
                        Immutable records supporting dispute resolution
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedDispute.evidence.map((evidence, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-3 bg-gray-50"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">
                                {getEvidenceIcon(evidence.type)}
                              </span>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-semibold text-sm capitalize">
                                    {evidence.type.replace("_", " ")}
                                  </h5>
                                  {evidence.verified && (
                                    <Badge
                                      variant="default"
                                      className="bg-green-600 text-xs"
                                    >
                                      ✓ Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 mb-2">
                                  {evidence.description}
                                </p>
                                <div className="text-xs text-gray-600">
                                  <div>
                                    Timestamp: {formatDate(evidence.timestamp)}
                                  </div>
                                  {evidence.hederaTransactionId && (
                                    <div className="font-mono">
                                      TX: {evidence.hederaTransactionId}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">
                          Related Blockchain Records
                        </h4>
                        <div className="space-y-2">
                          {selectedDispute.blockchainRecords.map(
                            (record, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center text-sm bg-blue-50 p-2 rounded"
                              >
                                <span className="font-mono text-xs">
                                  {record}
                                </span>
                                <Button size="sm" variant="outline">
                                  View on HashScan
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  {selectedDispute.status !== "resolved" && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex gap-2">
                          {selectedDispute.status === "open" && (
                            <Button className="flex-1">
                              Begin Investigation
                            </Button>
                          )}
                          {selectedDispute.status === "investigating" && (
                            <>
                              <Button className="flex-1" variant="default">
                                Resolve Dispute
                              </Button>
                              <Button className="flex-1" variant="destructive">
                                Escalate
                              </Button>
                            </>
                          )}
                          {selectedDispute.status === "escalated" && (
                            <Button className="flex-1">
                              Request Arbitration
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Educational Tooltip */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-2xl">⚖️</div>
            <div className="text-sm">
              <p className="font-semibold mb-1">
                Blockchain-Powered Dispute Resolution
              </p>
              <p className="text-gray-700">
                Immutable blockchain records provide indisputable evidence for
                dispute resolution. All transactions, quality metrics, and
                delivery confirmations are permanently recorded on Hedera,
                enabling fair and transparent resolution of conflicts. This
                reduces resolution time and builds trust between trading
                partners.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
