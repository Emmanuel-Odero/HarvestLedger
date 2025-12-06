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
import type { Loan, CollateralValuation } from "@/lib/demo-data-service";

interface LoanManagementDashboardProps {
  demoMode?: boolean;
}

export function LoanManagementDashboard({
  demoMode = true,
}: LoanManagementDashboardProps) {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [repaying, setRepaying] = useState(false);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "repaid" | "defaulted" | "liquidated"
  >("all");

  useEffect(() => {
    loadLoanData();
  }, []);

  const loadLoanData = async () => {
    try {
      setLoading(true);
      if (!demoDataService.isInitialized()) {
        await demoDataService.initialize();
      }

      const allLoans = demoDataService.getLoans();
      setLoans(allLoans);

      if (allLoans.length > 0) {
        setSelectedLoan(allLoans[0]);
      }
    } catch (error) {
      console.error("Error loading loan data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepayment = async (loanId: string) => {
    try {
      setRepaying(true);
      const loan = loans.find((l) => l.id === loanId);
      if (!loan) return;

      const repaymentAmount = Math.min(
        loan.remainingBalance,
        loan.amount * 0.2
      );

      await demoDataService.simulateLoanRepayment(loanId, repaymentAmount);

      // Refresh loan data
      await loadLoanData();
    } catch (error) {
      console.error("Error processing repayment:", error);
    } finally {
      setRepaying(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: Loan["status"]): string => {
    const colors = {
      active: "bg-blue-600",
      repaid: "bg-green-600",
      defaulted: "bg-red-600",
      liquidated: "bg-orange-600",
    };
    return colors[status];
  };

  const getRiskColor = (riskLevel: string): string => {
    const colors = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-red-600",
    };
    return colors[riskLevel as keyof typeof colors] || "text-gray-600";
  };

  const filteredLoans = loans.filter((loan) => {
    if (filterStatus === "all") return true;
    return loan.status === filterStatus;
  });

  const loanStats = {
    total: loans.length,
    active: loans.filter((l) => l.status === "active").length,
    totalValue: loans.reduce((sum, l) => sum + l.amount, 0),
    totalRepaid: loans.reduce((sum, l) => sum + l.amountRepaid, 0),
    avgInterestRate:
      loans.reduce((sum, l) => sum + l.interestRate, 0) / loans.length || 0,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            Loading loan management data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{loanStats.total}</div>
            <div className="text-sm text-gray-600">Total Loans</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{loanStats.active}</div>
            <div className="text-sm text-gray-600">Active Loans</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {formatCurrency(loanStats.totalValue)}
            </div>
            <div className="text-sm text-gray-600">Total Loan Value</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {loanStats.avgInterestRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Avg Interest Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Loan Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Loan Management Dashboard</CardTitle>
              <CardDescription>
                Track loans, collateral, and automated settlements via smart
                contracts
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
              All ({loans.length})
            </Button>
            <Button
              size="sm"
              variant={filterStatus === "active" ? "default" : "outline"}
              onClick={() => setFilterStatus("active")}
            >
              Active ({loans.filter((l) => l.status === "active").length})
            </Button>
            <Button
              size="sm"
              variant={filterStatus === "repaid" ? "default" : "outline"}
              onClick={() => setFilterStatus("repaid")}
            >
              Repaid ({loans.filter((l) => l.status === "repaid").length})
            </Button>
            <Button
              size="sm"
              variant={filterStatus === "defaulted" ? "default" : "outline"}
              onClick={() => setFilterStatus("defaulted")}
            >
              Defaulted ({loans.filter((l) => l.status === "defaulted").length})
            </Button>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Loan List</TabsTrigger>
              <TabsTrigger value="details">
                {selectedLoan ? "Loan Details" : "Select a Loan"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-3 mt-4">
              {filteredLoans.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No loans found matching the selected filter.
                </div>
              ) : (
                filteredLoans.map((loan) => (
                  <div
                    key={loan.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLoan(loan)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{loan.borrowerName}</h4>
                        <p className="text-sm text-gray-600">
                          Lender: {loan.lenderName}
                        </p>
                      </div>
                      <Badge
                        variant="default"
                        className={getStatusColor(loan.status)}
                      >
                        {loan.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Loan Amount:</span>
                        <p className="font-semibold">
                          {formatCurrency(loan.amount)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Interest Rate:</span>
                        <p className="font-semibold">{loan.interestRate}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Remaining:</span>
                        <p className="font-semibold">
                          {formatCurrency(loan.remainingBalance)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Due Date:</span>
                        <p className="font-semibold">
                          {formatDate(loan.dueDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (loan.amountRepaid /
                                (loan.amount * (1 + loan.interestRate / 100))) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {Math.round(
                          (loan.amountRepaid /
                            (loan.amount * (1 + loan.interestRate / 100))) *
                            100
                        )}
                        % repaid
                      </span>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              {!selectedLoan ? (
                <div className="text-center py-8 text-gray-500">
                  Select a loan from the list to view details
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Loan Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {selectedLoan.borrowerName}
                      </CardTitle>
                      <CardDescription>
                        Loan ID: {selectedLoan.id.slice(0, 8)}...
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Loan Amount:</span>
                          <p className="font-semibold text-lg">
                            {formatCurrency(selectedLoan.amount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Interest Rate:</span>
                          <p className="font-semibold text-lg">
                            {selectedLoan.interestRate}%
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Amount Repaid:</span>
                          <p className="font-semibold text-lg">
                            {formatCurrency(selectedLoan.amountRepaid)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Remaining Balance:
                          </span>
                          <p className="font-semibold text-lg">
                            {formatCurrency(selectedLoan.remainingBalance)}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-sm mb-2">
                          Loan Terms
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Term:</span>
                            <p>{selectedLoan.termMonths} months</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Created:</span>
                            <p>{formatDate(selectedLoan.createdDate)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Due Date:</span>
                            <p>{formatDate(selectedLoan.dueDate)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <Badge
                              className={getStatusColor(selectedLoan.status)}
                            >
                              {selectedLoan.status}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {selectedLoan.status === "active" && (
                        <Button
                          className="w-full"
                          onClick={() => handleRepayment(selectedLoan.id)}
                          disabled={repaying}
                        >
                          {repaying ? "Processing..." : "Make Repayment"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Collateral Tracking */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Collateral Tracking
                      </CardTitle>
                      <CardDescription>
                        Real-time asset valuation and risk assessment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">
                              Collateral Token:
                            </span>
                            <p className="font-mono text-xs">
                              {selectedLoan.collateralTokenId}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Collateral Value:
                            </span>
                            <p className="font-semibold">
                              {formatCurrency(selectedLoan.collateralValue)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Collateral Type:
                            </span>
                            <p className="capitalize">
                              {selectedLoan.collateralType.replace("_", " ")}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">
                              Current LTV Ratio:
                            </span>
                            <p className="font-semibold">
                              {selectedLoan.collateralValuationHistory.length >
                              0
                                ? selectedLoan.collateralValuationHistory[
                                    selectedLoan.collateralValuationHistory
                                      .length - 1
                                  ].loanToValueRatio.toFixed(1)
                                : "N/A"}
                              %
                            </p>
                          </div>
                        </div>

                        {selectedLoan.collateralValuationHistory.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm mb-2">
                              Valuation History (Last 6 Months)
                            </h4>
                            <div className="space-y-2">
                              {selectedLoan.collateralValuationHistory
                                .slice(-6)
                                .reverse()
                                .map((valuation, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center text-sm border-b pb-2"
                                  >
                                    <span className="text-gray-600">
                                      {formatDate(valuation.timestamp)}
                                    </span>
                                    <div className="flex items-center gap-4">
                                      <span>
                                        {formatCurrency(valuation.value)}
                                      </span>
                                      <span
                                        className={`font-semibold ${getRiskColor(
                                          valuation.riskLevel
                                        )}`}
                                      >
                                        {valuation.riskLevel.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Smart Contract Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Smart Contract Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contract ID:</span>
                          <span className="font-mono text-xs">
                            {selectedLoan.smartContractId}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-mono text-xs">
                            {selectedLoan.hederaTransactionId}
                          </span>
                        </div>
                        <Button size="sm" variant="outline" className="w-full">
                          View on HashScan
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Repayment History */}
                  {selectedLoan.repaymentHistory.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Repayment History
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedLoan.repaymentHistory.map((repayment) => (
                            <div
                              key={repayment.id}
                              className="flex justify-between items-center text-sm border-b pb-2"
                            >
                              <div>
                                <p className="font-semibold">
                                  {formatCurrency(repayment.amount)}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {formatDate(repayment.timestamp)}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {repayment.paymentType}
                              </Badge>
                            </div>
                          ))}
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
            <div className="text-2xl">💰</div>
            <div className="text-sm">
              <p className="font-semibold mb-1">
                DeFi Loans with Smart Contracts
              </p>
              <p className="text-gray-700">
                Blockchain-based loans use smart contracts for automated
                settlement and collateral management. Tokenized crops serve as
                collateral with real-time valuation, enabling farmers to access
                capital while maintaining transparency and reducing default risk
                through automated liquidation mechanisms.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
