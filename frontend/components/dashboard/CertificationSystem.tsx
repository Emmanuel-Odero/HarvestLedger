"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoDataService } from "@/lib/demo-data-service";

interface Certification {
  id: string;
  type:
    | "organic"
    | "fair_trade"
    | "rainforest_alliance"
    | "utz"
    | "gap"
    | "iso";
  name: string;
  issuer: string;
  issuedDate: Date;
  expiryDate: Date;
  status: "active" | "expiring_soon" | "expired" | "pending_renewal";
  farmId: string;
  farmName: string;
  certificateNumber: string;
  blockchainVerified: boolean;
  hederaTransactionId?: string;
  documents: Array<{
    name: string;
    type: string;
    uploadDate: Date;
  }>;
  inspections: Array<{
    date: Date;
    inspector: string;
    result: "passed" | "failed" | "conditional";
    notes: string;
  }>;
  notifications: Array<{
    type: "renewal" | "expiry" | "inspection" | "approval";
    message: string;
    date: Date;
    read: boolean;
  }>;
}

interface CertificationSystemProps {
  farmerId?: string;
  demoMode?: boolean;
}

export function CertificationSystem({
  farmerId,
  demoMode = true,
}: CertificationSystemProps) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [filter, setFilter] = useState<
    "all" | "active" | "expiring" | "expired"
  >("all");
  const [notifications, setNotifications] = useState<
    Certification["notifications"]
  >([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertifications();
  }, []);

  const loadCertifications = async () => {
    setLoading(true);
    try {
      await demoDataService.initialize();
      const farms = demoDataService.getFarms();

      // Generate certifications for farms
      const certs: Certification[] = [];
      const allNotifications: Certification["notifications"] = [];

      farms.slice(0, 10).forEach((farm) => {
        farm.certifications.forEach((cert, index) => {
          const issuedDate = new Date(cert.validUntil);
          issuedDate.setFullYear(issuedDate.getFullYear() - 2);

          const daysUntilExpiry = Math.floor(
            (cert.validUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          let status: Certification["status"];
          if (daysUntilExpiry < 0) {
            status = "expired";
          } else if (daysUntilExpiry < 90) {
            status = "expiring_soon";
          } else if (daysUntilExpiry < 180 && Math.random() > 0.7) {
            status = "pending_renewal";
          } else {
            status = "active";
          }

          const certNotifications: Certification["notifications"] = [];

          if (status === "expiring_soon") {
            certNotifications.push({
              type: "expiry",
              message: `${getCertificationName(
                cert.type
              )} certification expires in ${daysUntilExpiry} days`,
              date: new Date(),
              read: Math.random() > 0.5,
            });
          }

          if (status === "pending_renewal") {
            certNotifications.push({
              type: "renewal",
              message: `Renewal application submitted for ${getCertificationName(
                cert.type
              )}`,
              date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              read: Math.random() > 0.3,
            });
          }

          // Add random inspection notifications
          if (Math.random() > 0.6) {
            certNotifications.push({
              type: "inspection",
              message: `Upcoming inspection scheduled for ${getCertificationName(
                cert.type
              )}`,
              date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              read: false,
            });
          }

          allNotifications.push(...certNotifications);

          certs.push({
            id: `${farm.id}-${cert.type}-${index}`,
            type: cert.type,
            name: getCertificationName(cert.type),
            issuer: cert.issuer,
            issuedDate,
            expiryDate: cert.validUntil,
            status,
            farmId: farm.id,
            farmName: farm.name,
            certificateNumber: cert.certificateId,
            blockchainVerified: Math.random() > 0.1,
            hederaTransactionId:
              Math.random() > 0.1
                ? demoDataService.generateHederaTransactionId()
                : undefined,
            documents: generateDocuments(cert.type),
            inspections: generateInspections(),
            notifications: certNotifications,
          });
        });
      });

      setCertifications(certs);
      setNotifications(
        allNotifications.sort((a, b) => b.date.getTime() - a.date.getTime())
      );
    } catch (err) {
      console.error("Failed to load certifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const getCertificationName = (type: string): string => {
    const names: Record<string, string> = {
      organic: "Organic Certification",
      fair_trade: "Fair Trade Certified",
      rainforest_alliance: "Rainforest Alliance Certified",
      utz: "UTZ Certified",
      gap: "Good Agricultural Practices (GAP)",
      iso: "ISO 22000 Food Safety",
    };
    return names[type] || type;
  };

  const generateDocuments = (certType: string) => {
    return [
      {
        name: "Certificate of Compliance",
        type: "PDF",
        uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        name: "Inspection Report",
        type: "PDF",
        uploadDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        name: "Audit Documentation",
        type: "PDF",
        uploadDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    ];
  };

  const generateInspections = () => {
    const inspections = [];
    const inspectorNames = [
      "Dr. James Omondi",
      "Sarah Wanjiku",
      "Michael Kipchoge",
      "Grace Achieng",
    ];

    for (let i = 0; i < 3; i++) {
      inspections.push({
        date: new Date(Date.now() - (i + 1) * 180 * 24 * 60 * 60 * 1000),
        inspector:
          inspectorNames[Math.floor(Math.random() * inspectorNames.length)],
        result: (Math.random() > 0.2 ? "passed" : "conditional") as
          | "passed"
          | "conditional",
        notes:
          Math.random() > 0.5
            ? "All standards met. Excellent compliance."
            : "Minor improvements needed in record keeping.",
      });
    }

    return inspections;
  };

  const getStatusColor = (status: Certification["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expiring_soon":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending_renewal":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCertTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      organic: "bg-green-100 text-green-800",
      fair_trade: "bg-blue-100 text-blue-800",
      rainforest_alliance: "bg-emerald-100 text-emerald-800",
      utz: "bg-purple-100 text-purple-800",
      gap: "bg-orange-100 text-orange-800",
      iso: "bg-indigo-100 text-indigo-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntilExpiry = (expiryDate: Date) => {
    return Math.floor(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
  };

  const filteredCertifications = certifications.filter((cert) => {
    if (filter === "all") return true;
    if (filter === "active") return cert.status === "active";
    if (filter === "expiring")
      return (
        cert.status === "expiring_soon" || cert.status === "pending_renewal"
      );
    if (filter === "expired") return cert.status === "expired";
    return true;
  });

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (index: number) => {
    setNotifications((prev) =>
      prev.map((n, i) => (i === index ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Certification Management System
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Track certifications with regulatory approvals and expiration
            monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          {demoMode && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Demo Mode
            </Badge>
          )}
          <Button
            onClick={() => setShowNotifications(!showNotifications)}
            variant="outline"
            className="relative"
          >
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-4">
              No notifications
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  onClick={() => markNotificationAsRead(index)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    notification.read
                      ? "bg-gray-50"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        notification.read ? "bg-gray-400" : "bg-blue-600"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Total Certifications</p>
          <p className="text-2xl font-bold">{certifications.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {certifications.filter((c) => c.status === "active").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Expiring Soon</p>
          <p className="text-2xl font-bold text-yellow-600">
            {certifications.filter((c) => c.status === "expiring_soon").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600 mb-1">Expired</p>
          <p className="text-2xl font-bold text-red-600">
            {certifications.filter((c) => c.status === "expired").length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-2">
          {[
            { value: "all", label: "All Certifications" },
            { value: "active", label: "Active" },
            { value: "expiring", label: "Expiring Soon" },
            { value: "expired", label: "Expired" },
          ].map((f) => (
            <Button
              key={f.value}
              onClick={() => setFilter(f.value as any)}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Certifications List */}
      {loading ? (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certifications...</p>
        </Card>
      ) : selectedCert ? (
        /* Certification Details */
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{selectedCert.name}</h3>
              <p className="text-gray-600">{selectedCert.farmName}</p>
            </div>
            <Button
              onClick={() => setSelectedCert(null)}
              variant="outline"
              size="sm"
            >
              Back to List
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <Badge className={getStatusColor(selectedCert.status)}>
                {selectedCert.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Certificate Number</p>
              <p className="font-mono text-sm">
                {selectedCert.certificateNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Issued Date</p>
              <p className="font-semibold">
                {formatDate(selectedCert.issuedDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
              <p className="font-semibold">
                {formatDate(selectedCert.expiryDate)}
              </p>
              {selectedCert.status !== "expired" && (
                <p className="text-xs text-gray-500 mt-1">
                  {getDaysUntilExpiry(selectedCert.expiryDate)} days remaining
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Issuing Authority</p>
              <p className="font-semibold">{selectedCert.issuer}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Blockchain Verification
              </p>
              <div className="flex items-center gap-2">
                {selectedCert.blockchainVerified ? (
                  <>
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
                    <span className="text-sm font-semibold text-green-700">
                      Verified
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">Not verified</span>
                )}
              </div>
            </div>
          </div>

          {selectedCert.hederaTransactionId && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600 mb-1">
                Hedera Transaction ID
              </p>
              <p className="font-mono text-xs break-all">
                {selectedCert.hederaTransactionId}
              </p>
            </div>
          )}

          {/* Inspection History */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Inspection History</h4>
            <div className="space-y-3">
              {selectedCert.inspections.map((inspection, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">
                      {formatDate(inspection.date)}
                    </span>
                    <Badge
                      className={
                        inspection.result === "passed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {inspection.result.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Inspector: {inspection.inspector}
                  </p>
                  <p className="text-sm">{inspection.notes}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h4 className="font-semibold mb-3">Documents</h4>
            <div className="space-y-2">
              {selectedCert.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-sm">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        Uploaded {formatDate(doc.uploadDate)}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        /* Certifications Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertifications.map((cert) => (
            <Card
              key={cert.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCert(cert)}
            >
              <div className="flex items-start justify-between mb-4">
                <Badge className={getCertTypeColor(cert.type)}>
                  {cert.type.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(cert.status)}>
                  {cert.status.replace("_", " ")}
                </Badge>
              </div>

              <h3 className="font-semibold mb-2">{cert.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{cert.farmName}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className="font-semibold">
                    {formatDate(cert.expiryDate)}
                  </span>
                </div>
                {cert.status !== "expired" && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days left:</span>
                    <span
                      className={`font-semibold ${
                        getDaysUntilExpiry(cert.expiryDate) < 90
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {getDaysUntilExpiry(cert.expiryDate)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Blockchain:</span>
                  {cert.blockchainVerified ? (
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
                  ) : (
                    <span className="text-xs text-gray-500">Not verified</span>
                  )}
                </div>
              </div>

              <Button className="w-full mt-4" variant="outline" size="sm">
                View Details
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
