# Backend Tests

This directory contains tests for the HarvestLedger backend, including property-based tests for the Cardano integration.

## Running Tests

### Property-Based Tests for Metadata Round-Trip

The metadata round-trip property test validates that supply chain event metadata can be reliably encoded and decoded without data loss.

**Feature**: cardano-integration, Property 15: Metadata round-trip consistency  
**Validates**: Requirements 3.5

#### Run with standalone test runner (recommended):

```bash
cd backend
python tests/run_metadata_test.py
```

This runs:

- Unit tests for metadata structure validation
- Property-based tests with 100 random examples each
- Tests for invalid metadata handling
- Tests for all event types

#### Run with pytest (if environment is configured):

```bash
cd backend
pytest tests/test_cardano_metadata_roundtrip.py -v
```

Note: There may be dependency conflicts with web3 pytest plugins. Use the standalone runner if you encounter issues.

## Test Coverage

### Metadata Round-Trip Tests

1. **Metadata round-trip consistency**: For any valid supply chain event, encoding as metadata and decoding should return an equivalent event
2. **JSON encoding round-trip**: For any valid supply chain event, encoding as JSON and decoding should return an equivalent event
3. **Metadata structure validation**: Metadata has the expected structure with correct label
4. **Invalid metadata handling**: Decoding invalid metadata returns None gracefully
5. **Specific event types**: Round-trip works for all event types (harvest, processing, quality_check, transfer, certification)

## Dependencies

- pytest==7.4.3
- pytest-asyncio==0.21.1
- hypothesis==6.92.1

Install with:

```bash
pip install -r requirements-dev.txt
```

## Property-Based Testing

Property-based tests use Hypothesis to generate random test cases. Each test runs 100 examples by default, testing the property across a wide range of inputs.

The tests generate random:

- Event types (harvest, processing, quality_check, transfer, certification)
- Timestamps (ISO format with UTC timezone)
- Locations (strings of various lengths)
- Actor IDs and Product IDs
- Details dictionaries with various data types

This ensures the metadata encoding/decoding is robust across all possible inputs.
