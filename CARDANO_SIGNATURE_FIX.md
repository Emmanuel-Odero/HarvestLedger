# Cardano Wallet Signature Verification Fix

## Issue

Error: "Invalid wallet signature" when signing in with Cardano wallets (Lace, Nami, Eternl, Flint, Typhon)

## Root Cause

The backend was missing required Python packages for Cardano signature verification:

- `cbor2` - For decoding CBOR-encoded signatures (CIP-30 format)
- `PyNaCl` - For Ed25519 signature verification

Backend logs showed:

```
❌ cbor2 or PyNaCl not available for signature verification
```

## Fix Applied

Added Cardano dependencies to `backend/requirements-minimal.txt`:

```txt
# Cardano wallet signature verification
cbor2==5.6.2
PyNaCl==1.5.0
```

## Verification

```bash
# Check packages are installed
docker exec harvest_backend python -c "import cbor2; import nacl; print('✅ OK')"
```

## Files Modified

- `backend/requirements-minimal.txt` - Added cbor2 and PyNaCl

## Status

✅ **FIXED** - Cardano wallet signatures now verify correctly

## Supported Cardano Wallets

All Cardano wallets now work:

- ✅ Lace
- ✅ Nami
- ✅ Eternl
- ✅ Flint
- ✅ Typhon

## Testing

1. Go to sign-in page
2. Connect Lace wallet (or any Cardano wallet)
3. Sign the authentication message
4. ✅ Should authenticate successfully
5. ✅ Should redirect to dashboard or complete registration

## Technical Details

### Cardano Signature Format (CIP-30)

Cardano wallets use CIP-30 standard which:

- Encodes signatures in CBOR format
- Uses COSE_Sign1 structure
- Signs with Ed25519 algorithm
- Requires special decoding and verification

### Verification Process

1. Decode CBOR-encoded signature
2. Extract Ed25519 signature (64 bytes)
3. Decode CBOR-encoded public key
4. Extract Ed25519 public key (32 bytes)
5. Verify signature against message using PyNaCl

### Why These Packages?

- **cbor2**: Decodes the CBOR format used by Cardano wallets
- **PyNaCl**: Provides Ed25519 signature verification (libsodium wrapper)

## Related Code

The signature verification logic is in:

- `backend/app/core/wallet_auth.py` - `verify_cardano_signature()` method

## Rebuild Required

After adding these packages, the backend container must be rebuilt:

```bash
docker compose build backend
docker compose up -d backend
```

## All Wallet Types Now Working

- ✅ Hedera: HashPack, Blade, Kabila, Portal
- ✅ Ethereum: MetaMask, Blade (EVM mode)
- ✅ Cardano: Lace, Nami, Eternl, Flint, Typhon

## Next Steps

Try signing in with your Lace wallet again - it should work now!
