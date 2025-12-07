# Cardano GraphQL API Documentation

This document describes the GraphQL API endpoints for Cardano blockchain integration.

## Overview

The Cardano GraphQL API provides queries and mutations for:

- Wallet connection and management
- Token minting and transfers
- Transaction history and details
- Blockchain data queries via Blockfrost

## Queries

### `cardanoWallet`

Get Cardano wallet information by ID or address.

**Arguments:**

- `wallet_id` (UUID, optional): Wallet ID
- `address` (String, optional): Wallet address

**Returns:** `CardanoWallet`

**Authentication:** Required

**Example:**

```graphql
query {
  cardanoWallet(address: "addr_test1...") {
    id
    address
    stakeAddress
    walletType
    isPrimary
    createdAt
  }
}
```

### `cardanoTokens`

Get Cardano tokens owned by user's wallet.

**Arguments:**

- `wallet_id` (UUID, optional): Filter by wallet ID
- `policy_id` (String, optional): Filter by policy ID

**Returns:** `[CardanoToken]`

**Authentication:** Required

**Example:**

```graphql
query {
  cardanoTokens(walletId: "...") {
    id
    policyId
    assetName
    assetNameReadable
    quantity
    metadata
    mintingTxHash
  }
}
```

### `cardanoTransactions`

Get Cardano transaction history for user's wallets.

**Arguments:**

- `wallet_id` (UUID, optional): Filter by wallet ID
- `transaction_type` (String, optional): Filter by type ('mint', 'transfer', 'metadata')
- `limit` (Int, default: 50): Maximum number of results

**Returns:** `[CardanoTransaction]`

**Authentication:** Required

**Example:**

```graphql
query {
  cardanoTransactions(limit: 20) {
    id
    txHash
    transactionType
    amountAda
    fee
    metadata
    blockHeight
    blockTime
    status
  }
}
```

### `cardanoTokenInfo`

Get token information from Cardano blockchain via Blockfrost.

**Arguments:**

- `policy_id` (String, required): Token policy ID
- `asset_name` (String, optional): Asset name (hex)

**Returns:** `CardanoToken`

**Authentication:** Not required (public query)

**Example:**

```graphql
query {
  cardanoTokenInfo(policyId: "abc123...") {
    policyId
    assetName
    fingerprint
    quantity
    metadata
    mintingTxHash
  }
}
```

### `cardanoTransactionDetails`

Get transaction details from Cardano blockchain via Blockfrost.

**Arguments:**

- `tx_hash` (String, required): Transaction hash

**Returns:** `CardanoTransaction`

**Authentication:** Not required (public query)

**Example:**

```graphql
query {
  cardanoTransactionDetails(txHash: "abc123...") {
    txHash
    blockHeight
    blockTime
    fee
    metadata
    status
  }
}
```

## Mutations

### `connectCardanoWallet`

Connect a Cardano wallet to user account.

**Arguments:**

- `input` (ConnectCardanoWalletInput):
  - `address` (String, required): Wallet address
  - `wallet_type` (String, required): Wallet type ('nami', 'eternl', 'flint', 'lace', 'typhon')
  - `stake_address` (String, optional): Stake address

**Returns:** `CardanoWalletResponse`

**Authentication:** Required

**Example:**

```graphql
mutation {
  connectCardanoWallet(
    input: {
      address: "addr_test1..."
      walletType: "nami"
      stakeAddress: "stake_test1..."
    }
  ) {
    success
    message
    wallet {
      id
      address
      walletType
      isPrimary
    }
  }
}
```

### `mintCardanoToken`

Record a minted Cardano token in the database.

**Note:** Actual minting happens on frontend with MeshJS. This mutation stores the result.

**Arguments:**

- `input` (MintCardanoTokenInput):
  - `wallet_id` (UUID, required): Wallet ID
  - `policy_id` (String, required): Token policy ID
  - `asset_name` (String, required): Asset name (hex)
  - `asset_name_readable` (String, optional): Human-readable name
  - `fingerprint` (String, optional): Asset fingerprint
  - `quantity` (String, required): Token quantity
  - `metadata` (JSON, optional): Token metadata
  - `tx_hash` (String, required): Transaction hash
  - `fee` (String, optional): Transaction fee

**Returns:** `CardanoTokenResponse`

**Authentication:** Required

**Example:**

```graphql
mutation {
  mintCardanoToken(
    input: {
      walletId: "..."
      policyId: "abc123..."
      assetName: "436f726e546f6b656e"
      assetNameReadable: "CornToken"
      quantity: "1000"
      metadata: {
        name: "Corn Harvest 2024"
        description: "Organic corn from Farm A"
        cropType: "corn"
      }
      txHash: "def456..."
      fee: "170000"
    }
  ) {
    success
    message
    token {
      id
      policyId
      assetNameReadable
      quantity
      mintingTxHash
    }
  }
}
```

### `transferCardanoToken`

Record a Cardano token transfer in the database.

**Note:** Actual transfer happens on frontend with MeshJS. This mutation stores the result.

**Arguments:**

- `input` (TransferCardanoTokenInput):
  - `from_wallet_id` (UUID, required): Sender wallet ID
  - `to_address` (String, required): Recipient address
  - `token_id` (UUID, required): Token ID
  - `quantity` (String, required): Transfer quantity
  - `tx_hash` (String, required): Transaction hash
  - `fee` (String, optional): Transaction fee
  - `metadata` (JSON, optional): Transaction metadata

**Returns:** `CardanoTransactionResponse`

**Authentication:** Required

**Example:**

```graphql
mutation {
  transferCardanoToken(
    input: {
      fromWalletId: "..."
      toAddress: "addr_test1..."
      tokenId: "..."
      quantity: "100"
      txHash: "ghi789..."
      fee: "180000"
    }
  ) {
    success
    message
    transaction {
      id
      txHash
      transactionType
      status
    }
  }
}
```

## Types

### CardanoWallet

```graphql
type CardanoWallet {
  id: UUID
  userId: UUID
  address: String!
  stakeAddress: String
  walletType: String!
  isPrimary: Boolean!
  createdAt: DateTime
  updatedAt: DateTime
  lastSyncedAt: DateTime
}
```

### CardanoToken

```graphql
type CardanoToken {
  id: UUID
  policyId: String!
  assetName: String!
  assetNameReadable: String
  fingerprint: String
  ownerWalletId: UUID
  quantity: String!
  metadata: JSON
  mintingTxHash: String
  createdAt: DateTime
  updatedAt: DateTime
}
```

### CardanoTransaction

```graphql
type CardanoTransaction {
  id: UUID
  txHash: String!
  walletId: UUID
  transactionType: String!
  amountAda: String
  fee: String
  metadata: JSON
  blockHeight: Int
  blockTime: DateTime
  status: String!
  createdAt: DateTime
}
```

## Requirements Validation

This implementation satisfies the following requirements from the design document:

- **Requirement 1.2**: Wallet connection process using wallet connector ✅
- **Requirement 2.2**: Token minting transaction construction ✅
- **Requirement 6.2**: Token transfer transaction construction ✅
- **Requirement 4.1**: Token information retrieval via Blockfrost ✅
- **Requirement 8.1**: Transaction history queries ✅

## Integration with Frontend

The frontend should:

1. Use MeshJS to construct and sign transactions
2. Submit transactions to Cardano network via Blockfrost
3. Call these GraphQL mutations to record results in database
4. Query these endpoints to display wallet, token, and transaction data

## Testing

Run the validation script:

```bash
cd backend
python test_cardano_graphql.py
```

Expected output:

```
✅ Cardano types imported successfully
✅ Cardano resolvers imported successfully
📊 CardanoQuery methods: 5
📊 CardanoMutation methods: 3
✅ All Cardano GraphQL components validated successfully!
```
