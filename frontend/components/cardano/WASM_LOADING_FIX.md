# Cardano WASM Loading Fix

## Problem

The original Cardano wallet connector was importing `@meshsdk/core` at the module level, which caused WASM file loading errors during Next.js server-side rendering (SSR) and initial client hydration. This resulted in errors like:

```
Failed to load WASM file
Module not found: Can't resolve '*.wasm'
```

## Solution

We implemented a three-part solution to fix the WASM loading issue:

### 1. Next.js Configuration Updates

**File**: `frontend/next.config.ts`

- Added `serverExternalPackages: ["@meshsdk/core"]` to prevent SSR processing of the MeshJS library
- Configured webpack to support async WebAssembly with `asyncWebAssembly: true`
- Added WASM file handling rules for webpack
- Configured module resolution fallbacks for Node.js modules
- Added empty `turbopack: {}` config to work with Next.js 16

### 2. Enhanced Wallet Connector with Lazy Loading

**File**: `frontend/lib/cardano-wallet-connector-enhanced.ts`

Created a new `CardanoWalletConnectorEnhanced` class that:

- Uses dynamic imports to load `@meshsdk/core` only when needed
- Implements lazy initialization pattern
- Checks if code is running in browser environment before loading WASM
- Provides `initialize()` method for explicit initialization
- Auto-initializes when wallet operations are called
- Includes `isInitialized()` method to check initialization state

**Key Features**:

```typescript
// Lazy loading pattern
const connector = new CardanoWalletConnectorEnhanced({
  lazyLoad: true,
  network: "preprod",
});

// WASM is loaded only when needed
await connector.connectWallet("nami");
```

### 3. Updated CardanoWalletConnect Component

**File**: `frontend/components/cardano/CardanoWalletConnect.tsx`

- Modified to use dynamic imports for the enhanced connector
- Added loading state during connector initialization
- Implemented error handling for initialization failures
- Shows loading spinner while connector is initializing
- Gracefully handles errors with user-friendly messages

### 4. Error Boundary Component

**File**: `frontend/components/cardano/CardanoWalletErrorBoundary.tsx`

Created an error boundary to catch and handle WASM loading errors:

- Catches runtime errors in Cardano wallet components
- Displays user-friendly error messages
- Provides retry and reload options
- Shows detailed error information in development mode
- Detects WASM-specific errors for better messaging

## Usage

### Basic Usage

```tsx
import {
  CardanoWalletConnect,
  CardanoWalletErrorBoundary,
} from "@/components/cardano";

function MyComponent() {
  return (
    <CardanoWalletErrorBoundary>
      <CardanoWalletConnect
        onConnect={(connection) => console.log("Connected:", connection)}
        onDisconnect={() => console.log("Disconnected")}
      />
    </CardanoWalletErrorBoundary>
  );
}
```

### Advanced Usage with Enhanced Connector

```tsx
import { CardanoWalletConnectorEnhanced } from "@/lib/cardano-wallet-connector-enhanced";

async function connectWallet() {
  const connector = new CardanoWalletConnectorEnhanced({
    lazyLoad: true,
    network: "preprod",
  });

  // Initialize explicitly (optional - auto-initializes on first use)
  await connector.initialize();

  // Connect to wallet
  const connection = await connector.connectWallet("nami");
  console.log("Connected:", connection);
}
```

## Benefits

1. **No SSR Errors**: WASM files are only loaded in the browser, preventing SSR errors
2. **Faster Initial Load**: Wallet connector code is not loaded until needed
3. **Better Error Handling**: Graceful error handling with user-friendly messages
4. **Backward Compatible**: Original connector still works for non-SSR contexts
5. **Type Safe**: Full TypeScript support with proper type definitions

## Testing

Tests are included in `frontend/lib/__tests__/cardano-wallet-connector-enhanced.test.ts`:

- Lazy loading behavior
- Initialization checks
- Auto-initialization on wallet operations
- Error handling for non-browser environments

Run tests with:

```bash
npm test -- cardano-wallet-connector-enhanced.test.ts
```

## Requirements Validated

- **4.1**: Dashboard initializes without WASM errors
- **4.2**: Next.js properly serves WASM files from node_modules
- **4.3**: BrowserWallet successfully initializes from @meshsdk/core
- **4.4**: User-friendly error messages for wallet connection failures
- **4.5**: Lazy loading prevents blocking initial dashboard render

## Migration Guide

To migrate existing code to use the enhanced connector:

1. Replace imports:

   ```typescript
   // Old
   import { CardanoWalletConnector } from "@/lib/cardano-wallet-connector";

   // New
   import { CardanoWalletConnectorEnhanced } from "@/lib/cardano-wallet-connector-enhanced";
   ```

2. Update initialization:

   ```typescript
   // Old
   const connector = new CardanoWalletConnector();

   // New
   const connector = new CardanoWalletConnectorEnhanced({
     lazyLoad: true,
     network: "preprod",
   });
   ```

3. Wrap components in error boundary:
   ```tsx
   <CardanoWalletErrorBoundary>
     <YourCardanoComponent />
   </CardanoWalletErrorBoundary>
   ```

## Notes

- The original `CardanoWalletConnector` is still available for backward compatibility
- The enhanced version is recommended for all new code
- Error boundary is optional but recommended for production use
- WASM files are loaded asynchronously and cached by the browser
