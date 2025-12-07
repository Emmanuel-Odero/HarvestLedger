/**
 * Cardano Token Minting Component
 *
 * Provides a form for crop tokenization and displays minting status.
 * Requirements: 2.1, 2.3, 2.5
 */

"use client";

import React, { useState } from "react";
import {
  CardanoTokenService,
  MintTokenParams,
  MintResult,
  TokenOperationError,
  TokenErrorCode,
} from "@/lib/cardano-token-service";
import { CardanoWalletConnector } from "@/lib/cardano-wallet-connector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CardanoTokenMintingProps {
  walletConnector: CardanoWalletConnector;
  onMintSuccess?: (result: MintResult) => void;
  className?: string;
}

interface FormData {
  cropType: string;
  quantity: number;
  name: string;
  description: string;
  harvestDate: string;
  location: string;
  certifications: string;
  image: string;
  recipientAddress: string;
}

interface MintingStatus {
  status:
    | "idle"
    | "validating"
    | "building"
    | "signing"
    | "submitting"
    | "success"
    | "error";
  message: string;
  result?: MintResult;
}

export function CardanoTokenMinting({
  walletConnector,
  onMintSuccess,
  className = "",
}: CardanoTokenMintingProps) {
  const [tokenService] = useState(
    () => new CardanoTokenService(walletConnector)
  );

  const [formData, setFormData] = useState<FormData>({
    cropType: "",
    quantity: 1,
    name: "",
    description: "",
    harvestDate: new Date().toISOString().split("T")[0],
    location: "",
    certifications: "",
    image: "",
    recipientAddress: "",
  });

  const [mintingStatus, setMintingStatus] = useState<MintingStatus>({
    status: "idle",
    message: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.cropType.trim()) {
      errors.cropType = "Crop type is required";
    }

    if (formData.quantity <= 0) {
      errors.quantity = "Quantity must be greater than 0";
    }

    if (!formData.name.trim()) {
      errors.name = "Token name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.harvestDate) {
      errors.harvestDate = "Harvest date is required";
    }

    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      setMintingStatus({
        status: "error",
        message: "Please fix the validation errors before minting.",
      });
      return;
    }

    // Check wallet connection
    const connection = walletConnector.getConnectedWallet();
    if (!connection) {
      setMintingStatus({
        status: "error",
        message: "Please connect your wallet before minting tokens.",
      });
      return;
    }

    try {
      // Prepare minting parameters
      setMintingStatus({
        status: "validating",
        message: "Validating token parameters...",
      });

      const certifications = formData.certifications
        .split(",")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const mintParams: MintTokenParams = {
        cropType: formData.cropType,
        quantity: formData.quantity,
        metadata: {
          name: formData.name,
          description: formData.description,
          image: formData.image || undefined,
          cropType: formData.cropType,
          harvestDate: formData.harvestDate,
          location: formData.location,
          certifications,
          attributes: {
            quantity: formData.quantity,
          },
        },
        recipientAddress: formData.recipientAddress || undefined,
      };

      // Build transaction
      setMintingStatus({
        status: "building",
        message: "Building minting transaction...",
      });

      // Sign transaction
      setMintingStatus({
        status: "signing",
        message: "Please sign the transaction in your wallet...",
      });

      // Submit transaction
      setMintingStatus({
        status: "submitting",
        message: "Submitting transaction to Cardano network...",
      });

      const result = await tokenService.mintCropToken(mintParams);

      // Success
      setMintingStatus({
        status: "success",
        message: "Token minted successfully!",
        result,
      });

      onMintSuccess?.(result);

      // Reset form after successful mint
      setTimeout(() => {
        setFormData({
          cropType: "",
          quantity: 1,
          name: "",
          description: "",
          harvestDate: new Date().toISOString().split("T")[0],
          location: "",
          certifications: "",
          image: "",
          recipientAddress: "",
        });
        setMintingStatus({ status: "idle", message: "" });
      }, 5000);
    } catch (error) {
      console.error("Minting error:", error);

      let errorMessage = "Failed to mint token. Please try again.";

      if (error instanceof TokenOperationError) {
        switch (error.code) {
          case TokenErrorCode.USER_REJECTED:
            errorMessage =
              "Transaction was cancelled. Please try again if you want to mint.";
            break;
          case TokenErrorCode.INVALID_PARAMS:
          case TokenErrorCode.INVALID_METADATA:
            errorMessage = error.message;
            break;
          case TokenErrorCode.NETWORK_ERROR:
            errorMessage =
              "Network error. Please check your connection and try again.";
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      setMintingStatus({
        status: "error",
        message: errorMessage,
      });
    }
  };

  // Get status badge color
  const getStatusBadgeColor = () => {
    switch (mintingStatus.status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "validating":
      case "building":
      case "signing":
      case "submitting":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (mintingStatus.status) {
      case "success":
        return (
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case "validating":
      case "building":
      case "signing":
      case "submitting":
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        );
      default:
        return null;
    }
  };

  const isProcessing = [
    "validating",
    "building",
    "signing",
    "submitting",
  ].includes(mintingStatus.status);

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Mint Crop Token</h3>

      <form onSubmit={handleMint} className="space-y-4">
        {/* Crop Type */}
        <div>
          <label
            htmlFor="cropType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Crop Type *
          </label>
          <select
            id="cropType"
            name="cropType"
            value={formData.cropType}
            onChange={handleChange}
            disabled={isProcessing}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.cropType ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select crop type</option>
            <option value="wheat">Wheat</option>
            <option value="corn">Corn</option>
            <option value="rice">Rice</option>
            <option value="soybeans">Soybeans</option>
            <option value="coffee">Coffee</option>
            <option value="cocoa">Cocoa</option>
            <option value="cotton">Cotton</option>
            <option value="other">Other</option>
          </select>
          {validationErrors.cropType && (
            <p className="text-sm text-red-600 mt-1">
              {validationErrors.cropType}
            </p>
          )}
        </div>

        {/* Token Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Token Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={isProcessing}
            placeholder="e.g., Premium Organic Wheat 2024"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.name ? "border-red-500" : "border-gray-300"
            }`}
          />
          {validationErrors.name && (
            <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Quantity *
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            disabled={isProcessing}
            min="1"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.quantity ? "border-red-500" : "border-gray-300"
            }`}
          />
          {validationErrors.quantity && (
            <p className="text-sm text-red-600 mt-1">
              {validationErrors.quantity}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={isProcessing}
            rows={3}
            placeholder="Describe the crop, quality, and any special characteristics..."
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.description
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {validationErrors.description && (
            <p className="text-sm text-red-600 mt-1">
              {validationErrors.description}
            </p>
          )}
        </div>

        {/* Harvest Date */}
        <div>
          <label
            htmlFor="harvestDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Harvest Date *
          </label>
          <input
            type="date"
            id="harvestDate"
            name="harvestDate"
            value={formData.harvestDate}
            onChange={handleChange}
            disabled={isProcessing}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.harvestDate
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {validationErrors.harvestDate && (
            <p className="text-sm text-red-600 mt-1">
              {validationErrors.harvestDate}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            disabled={isProcessing}
            placeholder="e.g., Iowa, USA"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.location ? "border-red-500" : "border-gray-300"
            }`}
          />
          {validationErrors.location && (
            <p className="text-sm text-red-600 mt-1">
              {validationErrors.location}
            </p>
          )}
        </div>

        {/* Certifications */}
        <div>
          <label
            htmlFor="certifications"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Certifications (comma-separated)
          </label>
          <input
            type="text"
            id="certifications"
            name="certifications"
            value={formData.certifications}
            onChange={handleChange}
            disabled={isProcessing}
            placeholder="e.g., Organic, Fair Trade, Non-GMO"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Image URL (optional) */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Image URL (optional)
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            disabled={isProcessing}
            placeholder="https://example.com/crop-image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Recipient Address (optional) */}
        <div>
          <label
            htmlFor="recipientAddress"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Recipient Address (optional)
          </label>
          <input
            type="text"
            id="recipientAddress"
            name="recipientAddress"
            value={formData.recipientAddress}
            onChange={handleChange}
            disabled={isProcessing}
            placeholder="Leave empty to mint to your wallet"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
        </div>

        {/* Status Display */}
        {mintingStatus.status !== "idle" && (
          <div
            className={`p-4 rounded-lg ${
              mintingStatus.status === "error"
                ? "bg-red-50 border border-red-200"
                : mintingStatus.status === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-blue-50 border border-blue-200"
            }`}
          >
            <div className="flex items-start space-x-3">
              {getStatusIcon()}
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    mintingStatus.status === "error"
                      ? "text-red-900"
                      : mintingStatus.status === "success"
                      ? "text-green-900"
                      : "text-blue-900"
                  }`}
                >
                  {mintingStatus.message}
                </p>
                {mintingStatus.result && (
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Policy ID:</span>{" "}
                      <span className="font-mono text-xs">
                        {mintingStatus.result.policyId}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Asset Name:</span>{" "}
                      <span className="font-mono text-xs">
                        {mintingStatus.result.assetName}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Transaction:</span>{" "}
                      <a
                        href={`https://preprod.cardanoscan.io/transaction/${mintingStatus.result.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline font-mono text-xs"
                      >
                        {mintingStatus.result.txHash.slice(0, 16)}...
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button type="submit" disabled={isProcessing} className="w-full">
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {mintingStatus.message}
            </span>
          ) : (
            "Mint Token"
          )}
        </Button>
      </form>
    </Card>
  );
}
