# Harvest GraphQL Mutations Fix

## Issue

Build error: `Export RECORD_HARVEST doesn't exist in target module`

The dashboard page was trying to import `RECORD_HARVEST` from `@/lib/graphql/auth`, but harvest-related mutations should be in a separate file.

## Root Cause

Missing GraphQL file for harvest operations. The auth.ts file only contains authentication-related mutations.

## Fix Applied

### 1. Created Harvest GraphQL File

Created `frontend/lib/graphql/harvest.ts` with:

**Mutations:**

- `RECORD_HARVEST` - Record a new harvest
- `TOKENIZE_HARVEST` - Tokenize a harvest for trading

**Queries:**

- `GET_HARVESTS` - Get harvests (optionally filtered by farmer)

**TypeScript Interfaces:**

- `HarvestInput` - Input for recording harvest
- `Harvest` - Harvest data structure

### 2. Fixed Dashboard Import

Updated `frontend/app/dashboard/page.tsx`:

```typescript
// Before
import { RECORD_HARVEST } from "@/lib/graphql/auth";

// After
import { RECORD_HARVEST } from "@/lib/graphql/harvest";
```

## Files Created

- `frontend/lib/graphql/harvest.ts` - Harvest GraphQL operations

## Files Modified

- `frontend/app/dashboard/page.tsx` - Fixed import path

## Status

✅ **FIXED** - Dashboard can now record harvests

## Available Harvest Operations

### Record Harvest

```typescript
import { RECORD_HARVEST } from "@/lib/graphql/harvest";

const [recordHarvest] = useMutation(RECORD_HARVEST);

await recordHarvest({
  variables: {
    input: {
      cropType: "CORN",
      quantity: 1000,
      unit: "kg",
      farmLocation: "Field A",
      organicCertified: true,
    },
  },
});
```

### Get Harvests

```typescript
import { GET_HARVESTS } from "@/lib/graphql/harvest";

const { data } = useQuery(GET_HARVESTS, {
  variables: {
    farmerId: user.id, // optional
  },
});
```

### Tokenize Harvest

```typescript
import { TOKENIZE_HARVEST } from "@/lib/graphql/harvest";

const [tokenizeHarvest] = useMutation(TOKENIZE_HARVEST);

await tokenizeHarvest({
  variables: {
    harvestId: "harvest-id-here",
  },
});
```

## Backend Mutations

These mutations connect to the backend resolvers:

- `recordHarvest` - Creates harvest record and submits to Hedera HCS
- `tokenizeHarvest` - Creates HTS token for the harvest
- `harvests` - Queries harvest records

## Testing

1. Complete registration and reach dashboard
2. Try recording a harvest
3. Should successfully create harvest record
4. Should receive HCS transaction ID
5. Harvest should appear in your records

## Related Files

- Backend: `backend/app/graphql/resolvers.py` - Harvest mutations
- Backend: `backend/app/graphql/types.py` - Harvest types
- Backend: `backend/app/models/harvest.py` - Harvest model

## Next Steps

You can now:

- ✅ Record harvests from dashboard
- ✅ View harvest records
- ✅ Tokenize harvests
- ✅ Track on Hedera blockchain
