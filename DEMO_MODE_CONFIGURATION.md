# Demo Mode Configuration

## Overview

HarvestLedger supports both **Demo Mode** and **Live Mode** to provide flexibility during development, testing, and production deployments.

- **Demo Mode**: Uses simulated blockchain data and mock GraphQL resolvers. No real blockchain transactions are made.
- **Live Mode**: Connects to real Hedera and Cardano blockchain networks and the backend API.

## Configuration

### Environment Variable

Demo mode can be controlled via the `NEXT_PUBLIC_DEMO_MODE` environment variable in your `.env` file:

```bash
# Enable demo mode by default
NEXT_PUBLIC_DEMO_MODE=true

# Disable demo mode (use live blockchain connections)
NEXT_PUBLIC_DEMO_MODE=false
```

### How It Works

1. **Initial State**: When the application starts, it checks the `NEXT_PUBLIC_DEMO_MODE` environment variable
2. **LocalStorage Override**: Users can toggle demo mode in the UI, which saves their preference to localStorage
3. **Priority**: LocalStorage settings take precedence over the environment variable (allows runtime toggling)

### Setting Demo Mode

#### Option 1: Environment Variable (Recommended for deployment)

Edit your `.env` file:

```bash
NEXT_PUBLIC_DEMO_MODE=true  # or false
```

Then restart your development server:

```bash
npm run dev
```

#### Option 2: Runtime Toggle (Development/Testing)

Users can toggle demo mode at runtime using the UI components:

- `<DemoModeToggle />` - Toggle switch component
- `<DemoModeBanner />` - Banner showing demo mode status
- `useDemoMode()` hook - Programmatic control

Example:

```typescript
import { useDemoMode } from "@/lib/demo-mode-context";

function MyComponent() {
  const { isDemoMode, enableDemoMode, disableDemoMode, toggleDemoMode } =
    useDemoMode();

  return (
    <button onClick={toggleDemoMode}>
      {isDemoMode ? "Switch to Live Mode" : "Switch to Demo Mode"}
    </button>
  );
}
```

## Use Cases

### Development

Set `NEXT_PUBLIC_DEMO_MODE=true` to work without blockchain connections:

- No need for Hedera/Cardano testnet accounts
- Faster development with simulated data
- No transaction fees

### Testing

Toggle between modes to test both:

- Demo mode: Test UI/UX without blockchain dependencies
- Live mode: Test real blockchain integrations

### Production

Set `NEXT_PUBLIC_DEMO_MODE=false` for production deployments:

- Real blockchain transactions
- Actual user data
- Production-ready behavior

### Demo/Showcase

Set `NEXT_PUBLIC_DEMO_MODE=true` for demos:

- Show platform features without setup
- No blockchain accounts needed
- Consistent demo data

## Demo Mode Features

When demo mode is enabled:

- ✅ Simulated blockchain transactions (Hedera & Cardano)
- ✅ Mock GraphQL resolvers with realistic data
- ✅ Configurable latency simulation
- ✅ Configurable error rate for testing
- ✅ Visual indicators (banner, toggle)
- ✅ No real blockchain fees
- ✅ Consistent demo data

## Configuration Options

The demo mode manager supports additional configuration:

```typescript
import { demoModeManager } from "@/lib/demo-apollo-client";

// Enable/disable latency simulation
demoModeManager.setConfig({
  simulateLatency: true, // Adds realistic delays
  errorRate: 0.02, // 2% error rate for testing
});
```

## Checking Demo Mode Status

### In React Components

```typescript
import { useIsDemoMode } from "@/lib/demo-mode-context";

function MyComponent() {
  const isDemoMode = useIsDemoMode();

  return <div>{isDemoMode ? "Demo Mode Active" : "Live Mode Active"}</div>;
}
```

### In Non-React Code

```typescript
import { demoModeManager } from "@/lib/demo-apollo-client";

if (demoModeManager.isDemoMode()) {
  console.log("Running in demo mode");
} else {
  console.log("Running in live mode");
}
```

## Troubleshooting

### Demo mode not activating

1. Check your `.env` file has `NEXT_PUBLIC_DEMO_MODE=true`
2. Restart your development server after changing `.env`
3. Clear localStorage: `localStorage.removeItem('demo_mode_config')`
4. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

### Demo mode stuck on

1. Check localStorage: Open DevTools → Application → Local Storage
2. Remove `demo_mode_config` key
3. Refresh the page

### Environment variable not working

- Ensure the variable starts with `NEXT_PUBLIC_` (required for Next.js client-side access)
- Restart the development server after changing `.env`
- Check that `.env` is in the `frontend/` directory

## Best Practices

1. **Development**: Use `NEXT_PUBLIC_DEMO_MODE=true` to avoid blockchain setup
2. **CI/CD**: Use `NEXT_PUBLIC_DEMO_MODE=true` for automated tests
3. **Staging**: Use `NEXT_PUBLIC_DEMO_MODE=false` to test real integrations
4. **Production**: Use `NEXT_PUBLIC_DEMO_MODE=false` for live deployments
5. **Demos**: Use `NEXT_PUBLIC_DEMO_MODE=true` for showcasing features

## Security Note

Demo mode is safe for production as it only affects the frontend behavior. However, for production deployments, it's recommended to set `NEXT_PUBLIC_DEMO_MODE=false` to ensure users interact with real blockchain data.
