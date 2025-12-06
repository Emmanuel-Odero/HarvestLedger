/**
 * Dashboard Components Integration Tests
 *
 * Tests that all dashboard components properly integrate with the demo data service
 * and render without errors.
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import { demoDataService } from "@/lib/demo-data-service";

describe("Dashboard Components Data Integration", () => {
  beforeAll(async () => {
    // Initialize demo data service before tests
    if (!demoDataService.isInitialized()) {
      await demoDataService.initialize();
    }
  });

  describe("LiveHCSTopicViewer Data", () => {
    it("should have HCS messages available", () => {
      const messages = demoDataService.getHCSMessages();
      expect(messages.length).toBeGreaterThan(0);
    });

    it("should have messages for coffee topic", () => {
      const coffeeMessages = demoDataService.getHCSMessagesByTopic("0.0.1001");
      expect(coffeeMessages.length).toBeGreaterThan(0);
    });

    it("should have valid message structure", () => {
      const messages = demoDataService.getHCSMessages();
      const firstMessage = messages[0];

      expect(firstMessage).toHaveProperty("consensusTimestamp");
      expect(firstMessage).toHaveProperty("message");
      expect(firstMessage).toHaveProperty("payerAccountId");
      expect(firstMessage).toHaveProperty("sequenceNumber");
      expect(firstMessage).toHaveProperty("topicId");
      expect(firstMessage).toHaveProperty("transactionId");
      expect(firstMessage).toHaveProperty("runningHash");
    });

    it("should have parseable message content", () => {
      const messages = demoDataService.getHCSMessages();
      const firstMessage = messages[0];

      expect(() => JSON.parse(firstMessage.message)).not.toThrow();

      const parsed = JSON.parse(firstMessage.message);
      expect(parsed).toHaveProperty("cropBatchId");
      expect(parsed).toHaveProperty("farmerId");
    });
  });

  describe("SupplyChainVisualization Data", () => {
    it("should have HTS tokens available", () => {
      const tokens = demoDataService.getHTSTokens();
      expect(tokens.length).toBeGreaterThan(0);
    });

    it("should have valid token structure", () => {
      const tokens = demoDataService.getHTSTokens();
      const firstToken = tokens[0];

      expect(firstToken).toHaveProperty("tokenId");
      expect(firstToken).toHaveProperty("name");
      expect(firstToken).toHaveProperty("symbol");
      expect(firstToken).toHaveProperty("metadata");
      expect(firstToken.metadata).toHaveProperty("provenance");
      expect(firstToken.metadata).toHaveProperty("qualityMetrics");
    });

    it("should have provenance records", () => {
      const tokens = demoDataService.getHTSTokens();
      const firstToken = tokens[0];

      expect(firstToken.metadata.provenance.length).toBeGreaterThan(0);

      const firstRecord = firstToken.metadata.provenance[0];
      expect(firstRecord).toHaveProperty("stage");
      expect(firstRecord).toHaveProperty("timestamp");
      expect(firstRecord).toHaveProperty("location");
      expect(firstRecord).toHaveProperty("actor");
      expect(firstRecord).toHaveProperty("hederaTransactionId");
    });

    it("should have transfer history", () => {
      const tokens = demoDataService.getHTSTokens();
      const tokensWithTransfers = tokens.filter(
        (t) => t.transferHistory.length > 0
      );

      expect(tokensWithTransfers.length).toBeGreaterThan(0);
    });
  });

  describe("TokenizationInterface Data", () => {
    it("should have farms available", () => {
      const farms = demoDataService.getFarms();
      expect(farms.length).toBeGreaterThan(0);
    });

    it("should have transactions available", () => {
      const transactions = demoDataService.getTransactions();
      expect(transactions.length).toBeGreaterThan(0);
    });

    it("should have harvest transactions", () => {
      const transactions = demoDataService.getTransactions();
      const harvestTransactions = transactions.filter(
        (t) => t.type === "harvest"
      );

      expect(harvestTransactions.length).toBeGreaterThan(0);
    });

    it("should be able to simulate token creation", async () => {
      const newToken = await demoDataService.simulateHTSTokenCreation({
        name: "Test Token",
        symbol: "TEST",
        cropBatchId: "test-batch-123",
        totalSupply: 1000,
      });

      expect(newToken).toHaveProperty("tokenId");
      expect(newToken).toHaveProperty("name");
      expect(newToken.name).toBe("Test Token");
      expect(newToken.symbol).toBe("TEST");
    });
  });

  describe("QualityAssuranceDisplay Data", () => {
    it("should have quality metrics in tokens", () => {
      const tokens = demoDataService.getHTSTokens();
      const firstToken = tokens[0];

      expect(firstToken.metadata.qualityMetrics).toHaveProperty(
        "moistureContent"
      );
      expect(firstToken.metadata.qualityMetrics).toHaveProperty("defectCount");
      expect(firstToken.metadata.qualityMetrics).toHaveProperty("overallGrade");
      expect(firstToken.metadata.qualityMetrics).toHaveProperty(
        "certificationScore"
      );
      expect(firstToken.metadata.qualityMetrics).toHaveProperty("gpsVerified");
    });

    it("should have temperature readings", () => {
      const tokens = demoDataService.getHTSTokens();
      const firstToken = tokens[0];

      expect(
        firstToken.metadata.qualityMetrics.temperatureLog.length
      ).toBeGreaterThan(0);

      const firstReading = firstToken.metadata.qualityMetrics.temperatureLog[0];
      expect(firstReading).toHaveProperty("timestamp");
      expect(firstReading).toHaveProperty("value");
      expect(firstReading).toHaveProperty("unit");
      expect(firstReading).toHaveProperty("sensorId");
    });

    it("should have humidity readings", () => {
      const tokens = demoDataService.getHTSTokens();
      const firstToken = tokens[0];

      expect(
        firstToken.metadata.qualityMetrics.humidityLog.length
      ).toBeGreaterThan(0);

      const firstReading = firstToken.metadata.qualityMetrics.humidityLog[0];
      expect(firstReading).toHaveProperty("timestamp");
      expect(firstReading).toHaveProperty("value");
      expect(firstReading).toHaveProperty("unit");
      expect(firstReading).toHaveProperty("sensorId");
    });

    it("should have certifications", () => {
      const tokens = demoDataService.getHTSTokens();
      const tokensWithCerts = tokens.filter(
        (t) => t.metadata.certifications.length > 0
      );

      expect(tokensWithCerts.length).toBeGreaterThan(0);
    });

    it("should have valid certification IDs", () => {
      const tokens = demoDataService.getHTSTokens();
      const firstToken = tokens.find(
        (t) => t.metadata.certifications.length > 0
      );

      if (firstToken) {
        const firstCert = firstToken.metadata.certifications[0];
        expect(firstCert).toMatch(/^(ORG|FT|RA|UTZ)-\d+$/);
      }
    });
  });

  describe("Cross-Component Data Consistency", () => {
    it("should have matching crop batch IDs between transactions and tokens", () => {
      const transactions = demoDataService.getTransactions();
      const tokens = demoDataService.getHTSTokens();

      const harvestTransactions = transactions.filter(
        (t) => t.type === "harvest"
      );
      const batchIds = new Set(harvestTransactions.map((t) => t.cropBatchId));

      const tokenBatchIds = tokens.map((t) => t.metadata.cropBatchId);
      const matchingBatches = tokenBatchIds.filter((id) => batchIds.has(id));

      expect(matchingBatches.length).toBeGreaterThan(0);
    });

    it("should have consistent transaction IDs between HCS messages and transactions", () => {
      const messages = demoDataService.getHCSMessages();
      const transactions = demoDataService.getTransactions();

      const transactionIds = new Set(
        transactions.map((t) => t.hederaTransactionId)
      );
      const messageTransactionIds = messages.map((m) => m.transactionId);

      const matchingIds = messageTransactionIds.filter((id) =>
        transactionIds.has(id)
      );
      expect(matchingIds.length).toBeGreaterThan(0);
    });

    it("should have wallet addresses for farms", () => {
      const wallets = demoDataService.getWalletAddresses();
      const farms = demoDataService.getFarms();

      expect(wallets.length).toBeGreaterThanOrEqual(farms.length);
    });
  });

  describe("Data Quality Checks", () => {
    it("should have realistic quality scores", () => {
      const tokens = demoDataService.getHTSTokens();

      tokens.forEach((token) => {
        const score = token.metadata.qualityMetrics.certificationScore;
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it("should have realistic temperature readings", () => {
      const tokens = demoDataService.getHTSTokens();
      const firstToken = tokens[0];

      firstToken.metadata.qualityMetrics.temperatureLog.forEach((reading) => {
        expect(reading.value).toBeGreaterThan(0);
        expect(reading.value).toBeLessThan(50); // Reasonable range for Celsius
      });
    });

    it("should have realistic humidity readings", () => {
      const tokens = demoDataService.getHTSTokens();
      const firstToken = tokens[0];

      firstToken.metadata.qualityMetrics.humidityLog.forEach((reading) => {
        expect(reading.value).toBeGreaterThanOrEqual(0);
        expect(reading.value).toBeLessThanOrEqual(100);
      });
    });

    it("should have valid Hedera account IDs", () => {
      const wallets = demoDataService.getWalletAddresses();

      wallets.forEach((wallet) => {
        expect(wallet.accountId).toMatch(/^0\.0\.\d+$/);
      });
    });

    it("should have valid consensus timestamps", () => {
      const messages = demoDataService.getHCSMessages();

      messages.forEach((message) => {
        expect(message.consensusTimestamp).toMatch(/^\d+\.\d+$/);
      });
    });
  });
});
