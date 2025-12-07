# Cardano UI Components

This directory contains React components for interacting with the Cardano blockchain in the HarvestLedger application.

## Components

### CardanoWalletConnect

Displays wallet selection UI and shows connection status and balance.

**Requirements:** 1.1, 1.3

**Features:**

- Detects installed Cardano wallets (Nami, Eternl, Flint, Lace, Typhon)
- Displays wallet selection interface
- Shows connected wallet address and balance
- Displays native token holdings
- Handles connection errors gracefully

**Usage:**

```tsx
import { CardanoWalletConnect } from "@/components/cardano";

<CardanoWalletConnect
  onConnect={(connection) => console.log("Connected:", connection)}
  onDisconnect={() => console.log("Disconnected")}
/>;
```

### CardanoTokenMinting

Provides a form for crop tokenization and displays minting status.

**Requirements:** 2.1, 2.3, 2.5

**Features:**

- Comprehensive crop tokenization form
- Real-time validation
- Minting status tracking
- Transaction confirmation display
- Support for optional metadata (image, certifications)

**Usage:**

```tsx
import { CardanoTokenMinting } from '@/components/cardano'
import { CardanoWalletConnector } from '@/lib/cardano-wallet-connector'

const walletConnector = new CardanoWalletConnector()

<CardanoTokenMinting
  walletConnector={walletConnector}
  onMintSuccess={(result) => console.log('Minted:', result)}
/>
```

### CardanoTokenTransfer

Provides a form for transferring tokens with fee display and transfer confirmation.

**Requirements:** 6.1, 6.3, 6.5

**Features:**

- Token selection from wallet
- Recipient address validation
- Real-time fee calculation
- Transfer confirmation modal
- Balance checking
- Transaction status tracking

**Usage:**

```tsx
import { CardanoTokenTransfer } from '@/components/cardano'
import { CardanoWalletConnector } from '@/lib/cardano-wallet-connector'

const walletConnector = new CardanoWalletConnector()

<CardanoTokenTransfer
  walletConnector={walletConnector}
  onTransferSuccess={(result) => console.log('Transferred:', result)}
/>
```

## Integration Example

See `frontend/app/dashboard/cardano-showcase/page.tsx` for a complete integration example that demonstrates:

- Wallet connection flow
- Token minting workflow
- Token transfer workflow
- Blockchain selection
- Error handling

## Dependencies

These components require:

- `@meshsdk/core` - Cardano blockchain interaction
- `@meshsdk/react` - React hooks for MeshJS
- Cardano wallet browser extensions (Nami, Eternl, etc.)
- Blockfrost API key (for token queries)

## Environment Variables

```env
NEXT_PUBLIC_BLOCKFROST_API_KEY=your_blockfrost_api_key
NEXT_PUBLIC_BLOCKFROST_NETWORK=preprod
```

## Testing

All components are designed to work with Cardano Preprod testnet. Make sure your wallet is connected to the testnet before testing.

To get testnet ADA:

1. Visit the [Cardano Testnet Faucet](https://docs.cardano.org/cardano-testnet/tools/faucet/)
2. Enter your testnet address
3. Request test ADA

## Notes

- All components handle wallet connection errors gracefully
- Form validation is performed before blockchain operations
- Transaction fees are estimated before submission
- All blockchain operations require user approval in their wallet
- Components use the Cardano Preprod testnet by default
