# Cardano Wallet Connection Fix

## Issues Fixed

### 1. Signature Verification Error

**Problem**: The Cardano signature verification was failing with "The signature must be exactly 64 bytes long" error. The signature was 1235 bytes instead of 64 bytes.

**Root Cause**:

- Cardano wallets (Lace, Nami, Eternl, etc.) use CIP-30 standard which returns signatures in COSE_Sign1 format
- COSE_Sign1 is a CBOR-encoded array: `[protected, unprotected, payload, signature]`
- The actual Ed25519 signature (64 bytes) is the 4th element of this array
- The backend was trying to use the entire CBOR structure as the signature

**Solution**:

- Updated `backend/app/core/wallet_auth.py` to properly decode the CBOR structure
- Extract the actual 64-byte signature from the COSE_Sign1 array (4th element)
- Also decode the COSE_Key structure to extract the 32-byte public key

### 2. COSE_Sign1 Verification

**Problem**: The signature verification was failing because we weren't using the correct verification method for COSE_Sign1.

**Solution**:

- Extract the payload (element 2) from the COSE_Sign1 array - this is what was actually signed
- Implement two verification methods:
  1. **Direct payload verification**: Some wallets sign just the payload bytes
  2. **Sig_structure verification**: Proper COSE_Sign1 verification per RFC 8152
     - Sig_structure = ["Signature1", protected_headers, external_aad, payload]
     - This is the standard way to verify COSE_Sign1 signatures per CIP-30
- The backend now tries both methods to support different wallet implementations

### 3. Multiple Wallets Connecting

**Problem**: All installed wallets were trying to connect when clicking just one wallet button.

**Solution**:

- Added error handling in the wallet availability check loop
- Wrapped each wallet check in a try-catch to prevent cascading failures
- This prevents one wallet's check from affecting others

## Technical Details

### CIP-30 Signature Format

```
COSE_Sign1 = [
  protected: bstr,      // Protected headers (CBOR-encoded)
  unprotected: {},      // Unprotected headers
  payload: bstr,        // The signed message (hex-encoded)
  signature: bstr       // The actual Ed25519 signature (64 bytes)
]
```

### COSE_Key Format

```
COSE_Key = {
  1: 1,                 // kty: OKP (Octet Key Pair)
  3: -8,                // alg: EdDSA
  -1: 6,                // crv: Ed25519
  -2: bstr              // x: public key bytes (32 bytes)
}
```

## Testing

1. Restart the backend: `docker compose restart backend`
2. Try connecting with Lace wallet during signup
3. Watch the logs for verification details:
   ```bash
   docker compose logs backend -f | grep -A 5 "Cardano\|signature"
   ```
4. Look for these success indicators:
   - `📦 Extracted signature length: 64 bytes`
   - `✅ Cardano signature verified` (either direct or with Sig_structure)

## Troubleshooting

If verification still fails, check the logs for:

- The COSE_Sign1 array structure (should have 4 elements)
- The payload length (should match the message length)
- Whether direct or Sig_structure verification was attempted
- Any CBOR decoding errors

## Files Modified

- `backend/app/core/wallet_auth.py` - Fixed CBOR decoding for signatures and keys
- `frontend/components/ProgressiveAuthForm.tsx` - Added error handling for wallet checks
