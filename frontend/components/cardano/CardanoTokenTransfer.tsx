/**
 * Cardano Token Transfer Component
 *
 * Provides a form for transferring tokens with fee display and transfer confirmation.
 * Requirements: 6.1, 6.3, 6.5
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  CardanoTokenService,
  TransferParams,
  TransferResult,
  TokenOperationError,
  TokenErrorCode,
} from "@/lib/cardano-token-service";
import { CardanoWalletConnector, Asset } from "@/lib/cardano-wallet-connector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CardanoTokenTransferProps {
  walletConnector: CardanoWalletConnector;
  onTransferSuccess?: (result: TransferResult) => void;
  className?: string;
}

interface FormData {
  selectedToken: string; // Format: policyId.assetName
  recipientAddress: string;
  quantity: string;
  memo: string;
}

interface TransferStatus {
  status:
    | "idle"
    | "validating"
    | "calculating"
    | "confirming"
    | "signing"
    | "submitting"
    | "success"
    | "error";
  message: string;
  result?: TransferResult;
}

export function CardanoTokenTransfer({
  walletConnector,
  onTransferSuccess,
  className = "",
}: CardanoTokenTransferProps) {
  const [tokenService] = useState(
    () => new CardanoTokenService(walletConnector)
  );

  const [availableTokens, setAvailableTokens] = useState<Asset[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(true);
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    selectedToken: "",
    recipientAddress: "",
    quantity: "",
    memo: "",
  });

  const [transferStatus, setTransferStatus] = useState<TransferStatus>({
    status: "idle",
    message: "",
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Load available tokens
  useEffect(() => {
    const loadTokens = async () => {
      try {
        setIsLoadingTokens(true);
        const assets = await walletConnector.getWalletAssets();
        setAvailableTokens(assets);
      } catch (error) {
        console.error("Failed to load tokens:", error);
      } finally {
        setIsLoadingTokens(false);
      }
    };

    const connection = walletConnector.getConnectedWallet();
    if (connection) {
      loadTokens();
    }
  }, [walletConnector]);

  // Calculate fee when form is ready
  useEffect(() => {
    const calculateFee = async () => {
      if (
        formData.selectedToken &&
        formData.recipientAddress &&
        formData.quantity &&
        !validationErrors.recipientAddress &&
        !validationErrors.quantity
      ) {
        try {
          setIsCalculatingFee(true);
          const [policyId, assetName] = formData.selectedToken.split(".");

          const fee = await tokenService.estimateTransferFee({
            recipientAddress: formData.recipientAddress,
            policyId,
            assetName,
            quantity: formData.quantity,
          });

          setEstimatedFee(fee);
        } catch (error) {
          console.error("Failed to calculate fee:", error);
          setEstimatedFee(null);
        } finally {
          setIsCalculatingFee(false);
        }
      } else {
        setEstimatedFee(null);
      }
    };

    const debounceTimer = setTimeout(calculateFee, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData, validationErrors, tokenService]);

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

    if (!formData.selectedToken) {
      errors.selectedToken = "Please select a token to transfer";
    }

    if (!formData.recipientAddress.trim()) {
      errors.recipientAddress = "Recipient address is required";
    } else {
      // Basic Cardano address validation
      const addressRegex = /^(addr1|addr_test1)[a-z0-9]{53,}$/;
      if (!addressRegex.test(formData.recipientAddress)) {
        errors.recipientAddress = "Invalid Cardano address format";
      }
    }

    if (!formData.quantity || Number(formData.quantity) <= 0) {
      errors.quantity = "Quantity must be greater than 0";
    } else {
      // Check if quantity exceeds available balance
      const selectedAsset = availableTokens.find(
        (token) =>
          `${token.policyId}.${token.assetName}` === formData.selectedToken
      );
      if (selectedAsset) {
        const available = BigInt(selectedAsset.quantity);
        const requested = BigInt(formData.quantity);
        if (requested > available) {
          errors.quantity = `Insufficient balance. Available: ${selectedAsset.quantity}`;
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle transfer initiation
  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setTransferStatus({
        status: "error",
        message: "Please fix the validation errors before transferring.",
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmation(true);
  };

  // Handle confirmed transfer
  const handleConfirmedTransfer = async () => {
    setShowConfirmation(false);

    const connection = walletConnector.getConnectedWallet();
    if (!connection) {
      setTransferStatus({
        status: "error",
        message: "Please connect your wallet before transferring tokens.",
      });
      return;
    }

    try {
      setTransferStatus({
        status: "validating",
        message: "Validating transfer parameters...",
      });

      const [policyId, assetName] = formData.selectedToken.split(".");

      const transferParams: TransferParams = {
        recipientAddress: formData.recipientAddress,
        policyId,
        assetName,
        quantity: formData.quantity,
        metadata: formData.memo ? { memo: formData.memo } : undefined,
      };

      setTransferStatus({
        status: "signing",
        message: "Please sign the transaction in your wallet...",
      });

      setTransferStatus({
        status: "submitting",
        message: "Submitting transaction to Cardano network...",
      });

      const result = await tokenService.transferToken(transferParams);

      setTransferStatus({
        status: "success",
        message: "Token transferred successfully!",
        result,
      });

      onTransferSuccess?.(result);

      // Reset form after successful transfer
      setTimeout(() => {
        setFormData({
          selectedToken: "",
          recipientAddress: "",
          quantity: "",
          memo: "",
        });
        setTransferStatus({ status: "idle", message: "" });
        setEstimatedFee(null);
      }, 5000);
    } catch (error) {
      console.error("Transfer error:", error);

      let errorMessage = "Failed to transfer token. Please try again.";

      if (error instanceof TokenOperationError) {
        switch (error.code) {
          case TokenErrorCode.USER_REJECTED:
            errorMessage =
              "Transaction was cancelled. Please try again if you want to transfer.";
            break;
          case TokenErrorCode.INSUFFICIENT_BALANCE:
            errorMessage = error.message;
            break;
          case TokenErrorCode.INVALID_ADDRESS:
            errorMessage =
              "Invalid recipient address. Please check and try again.";
            break;
          case TokenErrorCode.NETWORK_ERROR:
            errorMessage =
              "Network error. Please check your connection and try again.";
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      setTransferStatus({
        status: "error",
        message: errorMessage,
      });
    }
  };

  // Format ADA amount (convert lovelace to ADA)
  const formatAdaAmount = (lovelace: string): string => {
    const ada = Number(lovelace) / 1_000_000;
    return ada.toFixed(6);
  };

  // Get selected token details
  const getSelectedToken = (): Asset | undefined => {
    return availableTokens.find(
      (token) =>
        `${token.policyId}.${token.assetName}` === formData.selectedToken
    );
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (transferStatus.status) {
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
      case "calculating":
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
    "calculating",
    "signing",
    "submitting",
  ].includes(transferStatus.status);

  const selectedToken = getSelectedToken();

  return (
    <>
      <Card className={`p-6 ${className}`}>
        <h3 className="text-lg font-semibold mb-4">Transfer Token</h3>

        {isLoadingTokens ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading tokens...</p>
          </div>
        ) : availableTokens.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">No tokens available</p>
            <p className="text-sm text-gray-500">
              You need to mint or receive tokens before you can transfer them.
            </p>
          </div>
        ) : (
          <form onSubmit={handleInitiateTransfer} className="space-y-4">
            {/* Token Selection */}
            <div>
              <label
                htmlFor="selectedToken"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Token *
              </label>
              <select
                id="selectedToken"
                name="selectedToken"
                value={formData.selectedToken}
                onChange={handleChange}
                disabled={isProcessing}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.selectedToken
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              >
                <option value="">Select a token</option>
                {availableTokens.map((token, index) => (
                  <option
                    key={`${token.policyId}.${token.assetName}-${index}`}
                    value={`${token.policyId}.${token.assetName}`}
                  >
                    {token.metadata?.name || "Unknown Token"} (Balance:{" "}
                    {token.quantity})
                  </option>
                ))}
              </select>
              {validationErrors.selectedToken && (
                <p className="text-sm text-red-600 mt-1">
                  {validationErrors.selectedToken}
                </p>
              )}
            </div>

            {/* Selected Token Info */}
            {selectedToken && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  {selectedToken.metadata?.name || "Unknown Token"}
                </p>
                <p className="text-xs text-blue-700 font-mono">
                  Policy: {selectedToken.policyId.slice(0, 16)}...
                </p>
                <p className="text-xs text-blue-700">
                  Available Balance:{" "}
                  <span className="font-semibold">
                    {selectedToken.quantity}
                  </span>
                </p>
              </div>
            )}

            {/* Recipient Address */}
            <div>
              <label
                htmlFor="recipientAddress"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recipient Address *
              </label>
              <input
                type="text"
                id="recipientAddress"
                name="recipientAddress"
                value={formData.recipientAddress}
                onChange={handleChange}
                disabled={isProcessing}
                placeholder="addr_test1..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm ${
                  validationErrors.recipientAddress
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {validationErrors.recipientAddress && (
                <p className="text-sm text-red-600 mt-1">
                  {validationErrors.recipientAddress}
                </p>
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
                max={selectedToken?.quantity}
                placeholder="Enter amount to transfer"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.quantity
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />
              {validationErrors.quantity && (
                <p className="text-sm text-red-600 mt-1">
                  {validationErrors.quantity}
                </p>
              )}
            </div>

            {/* Memo (optional) */}
            <div>
              <label
                htmlFor="memo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Memo (optional)
              </label>
              <textarea
                id="memo"
                name="memo"
                value={formData.memo}
                onChange={handleChange}
                disabled={isProcessing}
                rows={2}
                placeholder="Add a note for this transfer..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Fee Display */}
            {estimatedFee && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Estimated Transaction Fee
                  </span>
                  <span className="font-semibold text-gray-900">
                    ₳ {formatAdaAmount(estimatedFee)}
                  </span>
                </div>
              </div>
            )}

            {isCalculatingFee && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>Calculating fee...</span>
              </div>
            )}

            {/* Status Display */}
            {transferStatus.status !== "idle" && (
              <div
                className={`p-4 rounded-lg ${
                  transferStatus.status === "error"
                    ? "bg-red-50 border border-red-200"
                    : transferStatus.status === "success"
                    ? "bg-green-50 border border-green-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon()}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        transferStatus.status === "error"
                          ? "text-red-900"
                          : transferStatus.status === "success"
                          ? "text-green-900"
                          : "text-blue-900"
                      }`}
                    >
                      {transferStatus.message}
                    </p>
                    {transferStatus.result && (
                      <div className="mt-2 space-y-1 text-sm text-gray-700">
                        <p>
                          <span className="font-medium">Transaction:</span>{" "}
                          <a
                            href={`https://preprod.cardanoscan.io/transaction/${transferStatus.result.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline font-mono text-xs"
                          >
                            {transferStatus.result.txHash.slice(0, 16)}...
                          </a>
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{" "}
                          <span className="capitalize">
                            {transferStatus.result.status}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isProcessing || !formData.selectedToken}
              className="w-full"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {transferStatus.message}
                </span>
              ) : (
                "Transfer Token"
              )}
            </Button>
          </form>
        )}
      </Card>

      {/* Confirmation Modal */}
      {showConfirmation && selectedToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Confirm Transfer</h3>

            <div className="space-y-3 mb-6">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Token</p>
                <p className="font-medium">
                  {selectedToken.metadata?.name || "Unknown Token"}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Quantity</p>
                <p className="font-medium">{formData.quantity}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Recipient</p>
                <p className="font-mono text-xs break-all">
                  {formData.recipientAddress}
                </p>
              </div>

              {estimatedFee && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Transaction Fee</p>
                  <p className="font-medium">
                    ₳ {formatAdaAmount(estimatedFee)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowConfirmation(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleConfirmedTransfer} className="flex-1">
                Confirm Transfer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
