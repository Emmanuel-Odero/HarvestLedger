"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoDataService, HCSMessage } from "@/lib/demo-data-service";

interface HarvestRecordingWorkflowProps {
  farmerId?: string;
  demoMode?: boolean;
  onHarvestRecorded?: (message: HCSMessage) => void;
}

interface HarvestFormData {
  cropType: "coffee" | "maize" | "wheat";
  quantity: number;
  qualityGrade: string;
  harvestDate: string;
  gpsCoordinates: [number, number] | null;
  moistureContent: number;
  defectCount: number;
  certifications: string[];
}

export function HarvestRecordingWorkflow({
  farmerId,
  demoMode = true,
  onHarvestRecorded,
}: HarvestRecordingWorkflowProps) {
  const [step, setStep] = useState<
    "form" | "gps" | "quality" | "review" | "submitting" | "success"
  >("form");
  const [formData, setFormData] = useState<HarvestFormData>({
    cropType: "coffee",
    quantity: 0,
    qualityGrade: "AA",
    harvestDate: new Date().toISOString().split("T")[0],
    gpsCoordinates: null,
    moistureContent: 11.5,
    defectCount: 2,
    certifications: [],
  });
  const [recordedMessage, setRecordedMessage] = useState<HCSMessage | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [gpsVerifying, setGpsVerifying] = useState(false);

  const cropTypes = [
    { value: "coffee", label: "Coffee" },
    { value: "maize", label: "Maize" },
    { value: "wheat", label: "Wheat" },
  ];

  const qualityGrades = {
    coffee: ["AA", "AB", "C", "PB", "E"],
    maize: ["Grade 1", "Grade 2", "Grade 3"],
    wheat: ["Grade 1", "Grade 2", "Grade 3"],
  };

  const certificationOptions = [
    { id: "organic", label: "Organic" },
    { id: "fair_trade", label: "Fair Trade" },
    { id: "rainforest_alliance", label: "Rainforest Alliance" },
    { id: "utz", label: "UTZ Certified" },
  ];

  const handleInputChange = (field: keyof HarvestFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCertificationToggle = (certId: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(certId)
        ? prev.certifications.filter((c) => c !== certId)
        : [...prev.certifications, certId],
    }));
  };

  const handleGPSVerification = async () => {
    setGpsVerifying(true);
    setError(null);

    // Simulate GPS verification
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate realistic coordinates for East African agricultural regions
    const coordinates: [number, number] = [
      -0.0236 + (Math.random() - 0.5) * 0.2,
      37.9062 + (Math.random() - 0.5) * 0.2,
    ];

    setFormData((prev) => ({ ...prev, gpsCoordinates: coordinates }));
    setGpsVerifying(false);
    setStep("quality");
  };

  const handleSubmit = async () => {
    setStep("submitting");
    setError(null);

    try {
      // Prepare harvest data
      const harvestData = {
        farmerId: farmerId || demoDataService.generateUUID(),
        cropType: formData.cropType,
        quantity: formData.quantity,
        qualityGrade: formData.qualityGrade,
        harvestDate: formData.harvestDate,
        gpsCoordinates: formData.gpsCoordinates,
        qualityMetrics: {
          moistureContent: formData.moistureContent,
          defectCount: formData.defectCount,
          overallGrade: formData.qualityGrade,
        },
        certifications: formData.certifications,
      };

      // Submit to HCS
      const message = await demoDataService.simulateHCSMessage(harvestData);
      setRecordedMessage(message);
      setStep("success");

      if (onHarvestRecorded) {
        onHarvestRecorded(message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record harvest");
      setStep("review");
    }
  };

  const handleReset = () => {
    setStep("form");
    setFormData({
      cropType: "coffee",
      quantity: 0,
      qualityGrade: "AA",
      harvestDate: new Date().toISOString().split("T")[0],
      gpsCoordinates: null,
      moistureContent: 11.5,
      defectCount: 2,
      certifications: [],
    });
    setRecordedMessage(null);
    setError(null);
  };

  const formatCoordinates = (coords: [number, number]) => {
    return `${coords[0].toFixed(4)}°, ${coords[1].toFixed(4)}°`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Harvest Recording Workflow</h2>
          <p className="text-sm text-gray-600 mt-1">
            Record harvest with GPS verification and blockchain immutability
          </p>
        </div>
        {demoMode && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Demo Mode
          </Badge>
        )}
      </div>

      {/* Progress Steps */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          {[
            { id: "form", label: "Harvest Details" },
            { id: "gps", label: "GPS Verification" },
            { id: "quality", label: "Quality Metrics" },
            { id: "review", label: "Review & Submit" },
          ].map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step === s.id ||
                  (step === "submitting" && s.id === "review") ||
                  (step === "success" && s.id === "review")
                    ? "bg-blue-600 text-white"
                    : ["form", "gps", "quality", "review"].indexOf(step) >
                      ["form", "gps", "quality", "review"].indexOf(s.id)
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {["form", "gps", "quality", "review"].indexOf(step) >
                ["form", "gps", "quality", "review"].indexOf(s.id) ? (
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className="ml-2 text-sm font-medium">{s.label}</span>
              {index < 3 && <div className="w-12 h-0.5 bg-gray-300 mx-2"></div>}
            </div>
          ))}
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

      {/* Step 1: Harvest Details Form */}
      {step === "form" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Harvest Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Crop Type
              </label>
              <select
                value={formData.cropType}
                onChange={(e) =>
                  handleInputChange(
                    "cropType",
                    e.target.value as "coffee" | "maize" | "wheat"
                  )
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cropTypes.map((crop) => (
                  <option key={crop.value} value={crop.value}>
                    {crop.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quantity (kg)
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  handleInputChange("quantity", parseFloat(e.target.value))
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Quality Grade
              </label>
              <select
                value={formData.qualityGrade}
                onChange={(e) =>
                  handleInputChange("qualityGrade", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {qualityGrades[formData.cropType].map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Harvest Date
              </label>
              <input
                type="date"
                value={formData.harvestDate}
                onChange={(e) =>
                  handleInputChange("harvestDate", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Certifications
              </label>
              <div className="space-y-2">
                {certificationOptions.map((cert) => (
                  <label key={cert.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.certifications.includes(cert.id)}
                      onChange={() => handleCertificationToggle(cert.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{cert.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={() => setStep("gps")}
              className="w-full"
              disabled={formData.quantity <= 0}
            >
              Continue to GPS Verification
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: GPS Verification */}
      {step === "gps" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">GPS Verification</h3>
          <div className="text-center py-8">
            {!formData.gpsCoordinates && !gpsVerifying && (
              <>
                <svg
                  className="w-16 h-16 mx-auto text-blue-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h4 className="text-lg font-semibold mb-2">
                  Verify Harvest Location
                </h4>
                <p className="text-gray-600 mb-6">
                  GPS verification ensures harvest authenticity and prevents
                  fraud
                </p>
                <Button onClick={handleGPSVerification} className="mb-2">
                  Verify GPS Location
                </Button>
                <p className="text-xs text-gray-500">
                  This will capture your current location
                </p>
              </>
            )}

            {gpsVerifying && (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h4 className="text-lg font-semibold mb-2">
                  Verifying Location...
                </h4>
                <p className="text-gray-600">
                  Acquiring GPS coordinates and validating against farm
                  boundaries
                </p>
              </>
            )}

            {formData.gpsCoordinates && !gpsVerifying && (
              <>
                <svg
                  className="w-16 h-16 mx-auto text-green-600 mb-4"
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
                <h4 className="text-lg font-semibold mb-2 text-green-700">
                  GPS Verified Successfully
                </h4>
                <div className="bg-green-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600 mb-1">Coordinates</p>
                  <p className="font-mono text-lg">
                    {formatCoordinates(formData.gpsCoordinates)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Location verified within farm boundaries
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        gpsCoordinates: null,
                      }));
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Retry Verification
                  </Button>
                  <Button onClick={() => setStep("quality")} className="flex-1">
                    Continue
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Step 3: Quality Metrics */}
      {step === "quality" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quality Metrics</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Moisture Content (%)
              </label>
              <input
                type="number"
                value={formData.moistureContent}
                onChange={(e) =>
                  handleInputChange(
                    "moistureContent",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optimal range: 10-12% for coffee
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Defect Count (per 300g sample)
              </label>
              <input
                type="number"
                value={formData.defectCount}
                onChange={(e) =>
                  handleInputChange("defectCount", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Lower defect count indicates higher quality
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Quality Assessment</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Grade:</span>
                  <span className="font-semibold">{formData.qualityGrade}</span>
                </div>
                <div className="flex justify-between">
                  <span>Moisture:</span>
                  <span
                    className={
                      formData.moistureContent >= 10 &&
                      formData.moistureContent <= 12
                        ? "text-green-600 font-semibold"
                        : "text-yellow-600 font-semibold"
                    }
                  >
                    {formData.moistureContent}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Defects:</span>
                  <span
                    className={
                      formData.defectCount <= 5
                        ? "text-green-600 font-semibold"
                        : "text-yellow-600 font-semibold"
                    }
                  >
                    {formData.defectCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep("gps")}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={() => setStep("review")} className="flex-1">
                Review & Submit
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Review & Submit */}
      {step === "review" && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Review Harvest Record</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Crop Type</p>
                <p className="font-semibold capitalize">{formData.cropType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="font-semibold">{formData.quantity} kg</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quality Grade</p>
                <p className="font-semibold">{formData.qualityGrade}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Harvest Date</p>
                <p className="font-semibold">{formData.harvestDate}</p>
              </div>
            </div>

            {formData.gpsCoordinates && (
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
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
                  <span className="font-semibold text-green-700">
                    GPS Verified
                  </span>
                </div>
                <p className="text-sm font-mono">
                  {formatCoordinates(formData.gpsCoordinates)}
                </p>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-2">Quality Metrics</p>
              <div className="bg-gray-50 p-3 rounded space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Moisture Content:</span>
                  <span className="font-semibold">
                    {formData.moistureContent}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Defect Count:</span>
                  <span className="font-semibold">{formData.defectCount}</span>
                </div>
              </div>
            </div>

            {formData.certifications.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map((certId) => (
                    <Badge key={certId} className="bg-blue-100 text-blue-800">
                      {certificationOptions.find((c) => c.id === certId)?.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-blue-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 mb-1">
                    Blockchain Recording
                  </p>
                  <p className="text-blue-700">
                    This harvest record will be permanently stored on Hedera
                    Consensus Service (HCS) and cannot be altered or deleted.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setStep("quality")}
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Submit to Blockchain
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Submitting State */}
      {step === "submitting" && (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Recording to Blockchain...
          </h3>
          <p className="text-gray-600">
            Submitting harvest record to Hedera Consensus Service
          </p>
        </Card>
      )}

      {/* Success State */}
      {step === "success" && recordedMessage && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="text-center mb-6">
            <svg
              className="w-16 h-16 mx-auto text-green-600 mb-4"
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
            <h3 className="text-2xl font-bold text-green-700 mb-2">
              Harvest Recorded Successfully!
            </h3>
            <p className="text-gray-700">
              Your harvest has been permanently recorded on the blockchain
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
              <p className="font-mono text-sm break-all">
                {recordedMessage.transactionId}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Topic ID</p>
              <p className="font-mono text-sm">{recordedMessage.topicId}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Sequence Number</p>
              <p className="font-semibold">{recordedMessage.sequenceNumber}</p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Consensus Timestamp</p>
              <p className="font-mono text-sm">
                {recordedMessage.consensusTimestamp}
              </p>
            </div>
          </div>

          <Button onClick={handleReset} className="w-full">
            Record Another Harvest
          </Button>
        </Card>
      )}
    </div>
  );
}
