# Demo Mode Environment Variable Implementation Summary

## Overview

Successfully implemented environment variable-based demo mode switching for the HarvestLedger application. Users can now control whether the application runs in demo mode (simulated data) or live mode (real blockchain) via the `.env` file.

## Changes Made

### 1. Environment Variables

**Files Modified:**

- `.env`
- `.env.example`

**Added Variable:**

```bash
NEXT_PUBLIC_DEMO_MODE=false  # Set to 'true' for demo mode, 'false' for live mode
```

### 2. Demo Mode Manager

**File Modified:** `frontend/lib/demo-apollo-client.ts`

**Changes:**

- Updated `DemoModeManager` constructor to check `NEXT_PUBLIC_DEMO_MODE` environment variable
- Falls back to localStorage if available, otherwise uses environment variable
- Server-side rendering respects environment variable

**Logic:**

1. Check environment variable `NEXT_PUBLIC_DEMO_MODE`
2. If localStorage has saved config, use that (allows runtime toggling)
3. If localStorage parsing fails, fall back to environment variable
4. On server-side, always use environment variable

### 3. Demo Mode Provider

**File Modified:** `frontend/lib/demo-mode-context.tsx`

**Changes:**

- Updated `DemoModeProvider` to initialize with environment variable value
- Sets initial state based on `NEXT_PUBLIC_DEMO_MODE`
- Maintains backward compatibility with runtime toggling

### 4. Documentation

**Files Created:**

- `DEMO_MODE_CONFIGURATION.md` - Comprehensive guide on using demo mode
- `DEMO_MODE_IMPLEMENTATION_SUMMARY.md` - This file
- `frontend/components/DemoModeExample.tsx` - Example component demonstrating usage

## How It Works

### Priority Order

1. **LocalStorage** (highest priority) - User's runtime toggle preference
2. **Environment Variable** - Default setting from `.env` file
3. **Fallback** - `false` (live mode) if neither is set

### Use Cases

#### Development

```bash
# .env
NEXT_PUBLIC_DEMO_MODE=true
```

- Work without blockchain setup
- Faster development
- No transaction fees

#### Production

```bash
# .env
NEXT_PUBLIC_DEMO_MODE=false
```

- Real blockchain connections
- Actual user data
- Production behavior

#### Testing

```bash
# .env
NEXT_PUBLIC_DEMO_MODE=true
```

- Consistent test data
- No external dependencies
- Faster CI/CD

## Usage Examples

### Setting via Environment Variable

```bash
# In .env file
NEXT_PUBLIC_DEMO_MODE=true

# Restart server
npm run dev
```

### Checking Demo Mode in Components

```typescript
import { useIsDemoMode } from "@/lib/demo-mode-context";

function MyComponent() {
  const isDemoMode = useIsDemoMode();

  return <div>{isDemoMode ? "Demo" : "Live"}</div>;
}
```

### Toggling at Runtime

```typescript
import { useDemoMode } from "@/lib/demo-mode-context";

function ToggleButton() {
  const { toggleDemoMode } = useDemoMode();

  return <button onClick={toggleDemoMode}>Toggle Mode</button>;
}
```

### Programmatic Control

```typescript
import { demoModeManager } from "@/lib/demo-apollo-client";

// Check status
if (demoModeManager.isDemoMode()) {
  console.log("Demo mode active");
}

// Enable/disable
demoModeManager.enableDemoMode();
demoModeManager.disableDemoMode();
```

## Benefits

1. **Flexible Configuration**: Set default mode via environment variable
2. **Runtime Override**: Users can still toggle in UI
3. **Persistent Preference**: LocalStorage saves user choice
4. **Environment-Specific**: Different settings for dev/staging/prod
5. **Backward Compatible**: Existing demo mode features still work
6. **No Breaking Changes**: All existing code continues to work

## Testing

### Test Demo Mode Enabled

```bash
# Set in .env
NEXT_PUBLIC_DEMO_MODE=true

# Restart server
npm run dev

# Verify in browser console
localStorage.getItem('demo_mode_config')
```

### Test Demo Mode Disabled

```bash
# Set in .env
NEXT_PUBLIC_DEMO_MODE=false

# Restart server
npm run dev

# Verify in browser console
localStorage.getItem('demo_mode_config')
```

### Test Runtime Toggle

1. Set `NEXT_PUBLIC_DEMO_MODE=false` in `.env`
2. Start server
3. Use `<DemoModeToggle />` component to enable demo mode
4. Refresh page - demo mode should persist (localStorage)
5. Clear localStorage - should revert to environment variable setting

## Migration Guide

### For Existing Deployments

No migration needed! The implementation is backward compatible:

1. If you don't set `NEXT_PUBLIC_DEMO_MODE`, it defaults to `false` (live mode)
2. Existing localStorage settings continue to work
3. Runtime toggling still works as before

### For New Deployments

1. Add `NEXT_PUBLIC_DEMO_MODE=false` to your `.env` file
2. Set to `true` for demo/development environments
3. Set to `false` for production environments

## Troubleshooting

### Demo mode not activating

- Check `.env` has `NEXT_PUBLIC_DEMO_MODE=true`
- Restart development server
- Clear localStorage: `localStorage.removeItem('demo_mode_config')`

### Demo mode stuck on

- Check localStorage in DevTools
- Remove `demo_mode_config` key
- Refresh page

### Environment variable not working

- Ensure variable starts with `NEXT_PUBLIC_`
- Restart server after changing `.env`
- Verify `.env` is in `frontend/` directory

## Next Steps

### Recommended Enhancements

1. **Admin Panel**: Add UI to view/change environment variables
2. **Deployment Scripts**: Automatically set based on environment
3. **Monitoring**: Log demo mode status in analytics
4. **Feature Flags**: Extend to other feature toggles

### Optional Improvements

1. Add demo mode indicator in navigation
2. Create demo mode onboarding flow
3. Add demo mode analytics tracking
4. Create demo mode preset configurations

## Files Changed

```
.env                                          # Added NEXT_PUBLIC_DEMO_MODE
.env.example                                  # Added NEXT_PUBLIC_DEMO_MODE
frontend/lib/demo-apollo-client.ts            # Updated DemoModeManager
frontend/lib/demo-mode-context.tsx            # Updated DemoModeProvider
DEMO_MODE_CONFIGURATION.md                    # New documentation
DEMO_MODE_IMPLEMENTATION_SUMMARY.md           # This file
frontend/components/DemoModeExample.tsx       # New example component
```

## Conclusion

The environment variable-based demo mode switching is now fully implemented and ready for use. The implementation is:

- ✅ Backward compatible
- ✅ Flexible (env variable + runtime toggle)
- ✅ Well documented
- ✅ Production ready
- ✅ Easy to use

Users can now control demo mode via `.env` file while maintaining the ability to toggle at runtime.
