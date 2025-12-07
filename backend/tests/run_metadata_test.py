"""
Standalone test runner for metadata round-trip property tests.
This avoids pytest plugin conflicts.
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from hypothesis import given, strategies as st, settings
from datetime import datetime, timezone

from app.services.cardano_metadata_service import (
    CardanoMetadataService,
    SupplyChainEvent
)


# Custom strategies for generating valid supply chain events
@st.composite
def supply_chain_event_strategy(draw):
    """
    Generate random but valid supply chain events for property testing.
    """
    event_type = draw(st.sampled_from([
        'harvest',
        'processing',
        'quality_check',
        'transfer',
        'certification'
    ]))
    
    # Generate valid ISO timestamp (without timezone in min/max, add it after)
    dt = draw(st.datetimes(
        min_value=datetime(2020, 1, 1),
        max_value=datetime(2030, 12, 31)
    ))
    # Add UTC timezone and convert to ISO format
    timestamp = dt.replace(tzinfo=timezone.utc).isoformat()
    
    # Generate location string (simpler, faster generation)
    location = draw(st.text(min_size=1, max_size=50))
    
    # Generate actor_id (simpler, faster generation)
    actor_id = draw(st.text(min_size=1, max_size=30))
    
    # Generate product_id (simpler, faster generation)
    product_id = draw(st.text(min_size=1, max_size=30))
    
    # Generate details dictionary with simpler types
    details = draw(st.dictionaries(
        keys=st.text(min_size=1, max_size=10),
        values=st.one_of(
            st.text(max_size=50),
            st.integers(min_value=-1000000, max_value=1000000),
            st.floats(allow_nan=False, allow_infinity=False, min_value=-1e6, max_value=1e6),
            st.booleans()
        ),
        min_size=0,
        max_size=5
    ))
    
    return SupplyChainEvent(
        event_type=event_type,
        timestamp=timestamp,
        location=location,
        actor_id=actor_id,
        product_id=product_id,
        details=details
    )


# Feature: cardano-integration, Property 15: Metadata round-trip consistency
# Validates: Requirements 3.5
@given(event=supply_chain_event_strategy())
@settings(max_examples=100)
def test_metadata_round_trip_consistency(event: SupplyChainEvent):
    """
    Property: For any valid supply chain event, encoding it as metadata
    and then decoding it should return an equivalent event.
    
    This validates that metadata can be reliably stored on-chain and
    retrieved without data loss or corruption.
    """
    # Encode the event as metadata
    metadata = CardanoMetadataService.create_supply_chain_metadata(event)
    
    # Decode the metadata back to an event
    decoded_event = CardanoMetadataService.decode_metadata(metadata)
    
    # Assert that the decoded event matches the original
    assert decoded_event is not None, "Decoded event should not be None"
    assert decoded_event == event, f"Decoded event should match original event.\nOriginal: {event.to_dict()}\nDecoded: {decoded_event.to_dict()}"
    
    # Verify all fields individually for better error messages
    assert decoded_event.event_type == event.event_type
    assert decoded_event.timestamp == event.timestamp
    assert decoded_event.location == event.location
    assert decoded_event.actor_id == event.actor_id
    assert decoded_event.product_id == event.product_id
    assert decoded_event.details == event.details


@given(event=supply_chain_event_strategy())
@settings(max_examples=100)
def test_json_encoding_round_trip(event: SupplyChainEvent):
    """
    Property: For any valid supply chain event, encoding it as JSON
    and then decoding it should return an equivalent event.
    
    This validates the full serialization path used for transaction submission.
    """
    # Encode as JSON string (as would be done for transaction)
    json_string = CardanoMetadataService.encode_for_transaction(event)
    
    # Decode from JSON string
    decoded_event = CardanoMetadataService.decode_from_transaction(json_string)
    
    # Assert round-trip consistency
    assert decoded_event is not None, "Decoded event should not be None"
    assert decoded_event == event, "Decoded event should match original event"


def test_metadata_structure_validation():
    """
    Test that metadata has the expected structure with correct label.
    """
    event = SupplyChainEvent(
        event_type='harvest',
        timestamp='2024-01-01T00:00:00+00:00',
        location='Test Farm',
        actor_id='farmer123',
        product_id='crop456',
        details={'quantity': 100, 'unit': 'kg'}
    )
    
    metadata = CardanoMetadataService.create_supply_chain_metadata(event)
    
    # Verify structure
    assert 'label' in metadata
    assert 'json_metadata' in metadata
    assert metadata['label'] == CardanoMetadataService.SUPPLY_CHAIN_LABEL
    assert isinstance(metadata['json_metadata'], dict)
    
    # Verify all required fields are present
    json_metadata = metadata['json_metadata']
    assert 'event_type' in json_metadata
    assert 'timestamp' in json_metadata
    assert 'location' in json_metadata
    assert 'actor_id' in json_metadata
    assert 'product_id' in json_metadata
    assert 'details' in json_metadata
    
    print("✅ Metadata structure validation passed")


def test_decode_invalid_metadata():
    """
    Test that decoding invalid metadata returns None gracefully.
    """
    # Test with None
    assert CardanoMetadataService.decode_metadata(None) is None
    
    # Test with empty dict
    assert CardanoMetadataService.decode_metadata({}) is None
    
    # Test with missing json_metadata
    assert CardanoMetadataService.decode_metadata({'label': 1337}) is None
    
    # Test with incomplete json_metadata
    incomplete = {
        'label': 1337,
        'json_metadata': {
            'event_type': 'harvest',
            'timestamp': '2024-01-01T00:00:00+00:00'
            # Missing other required fields
        }
    }
    assert CardanoMetadataService.decode_metadata(incomplete) is None
    
    print("✅ Invalid metadata handling passed")


def test_specific_event_types():
    """
    Test round-trip for each specific event type.
    """
    event_types = ['harvest', 'processing', 'quality_check', 'transfer', 'certification']
    
    for event_type in event_types:
        event = SupplyChainEvent(
            event_type=event_type,
            timestamp='2024-01-01T00:00:00+00:00',
            location='Test Location',
            actor_id='actor123',
            product_id='product456',
            details={'test': 'data'}
        )
        
        metadata = CardanoMetadataService.create_supply_chain_metadata(event)
        decoded = CardanoMetadataService.decode_metadata(metadata)
        
        assert decoded is not None
        assert decoded.event_type == event_type
        assert decoded == event
    
    print("✅ Specific event types test passed")


if __name__ == '__main__':
    print("=" * 70)
    print("Running Cardano Metadata Round-Trip Property Tests")
    print("Feature: cardano-integration, Property 15: Metadata round-trip consistency")
    print("Validates: Requirements 3.5")
    print("=" * 70)
    print()
    
    # Run unit tests first
    print("Running unit tests...")
    try:
        test_metadata_structure_validation()
        test_decode_invalid_metadata()
        test_specific_event_types()
        print()
    except AssertionError as e:
        print(f"❌ Unit test failed: {e}")
        sys.exit(1)
    
    # Run property-based tests
    print("Running property-based tests (100 examples each)...")
    print()
    
    try:
        print("Test 1: Metadata round-trip consistency...")
        test_metadata_round_trip_consistency()
        print("✅ Metadata round-trip test passed (100 examples)")
        print()
        
        print("Test 2: JSON encoding round-trip...")
        test_json_encoding_round_trip()
        print("✅ JSON encoding round-trip test passed (100 examples)")
        print()
        
        print("=" * 70)
        print("✅ ALL TESTS PASSED!")
        print("=" * 70)
        
    except AssertionError as e:
        print(f"❌ Property test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

