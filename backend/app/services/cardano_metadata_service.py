"""
Cardano Metadata Service

Handles encoding and decoding of supply chain event metadata for Cardano transactions.
"""

import json
from typing import Dict, Any, Optional
from datetime import datetime


class SupplyChainEvent:
    """Represents a supply chain event"""
    
    def __init__(
        self,
        event_type: str,
        timestamp: str,
        location: str,
        actor_id: str,
        product_id: str,
        details: Dict[str, Any]
    ):
        self.event_type = event_type
        self.timestamp = timestamp
        self.location = location
        self.actor_id = actor_id
        self.product_id = product_id
        self.details = details
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary"""
        return {
            'event_type': self.event_type,
            'timestamp': self.timestamp,
            'location': self.location,
            'actor_id': self.actor_id,
            'product_id': self.product_id,
            'details': self.details
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'SupplyChainEvent':
        """Create event from dictionary"""
        return cls(
            event_type=data['event_type'],
            timestamp=data['timestamp'],
            location=data['location'],
            actor_id=data['actor_id'],
            product_id=data['product_id'],
            details=data['details']
        )
    
    def __eq__(self, other):
        """Check equality"""
        if not isinstance(other, SupplyChainEvent):
            return False
        return self.to_dict() == other.to_dict()


class CardanoMetadataService:
    """Service for creating and decoding Cardano transaction metadata"""
    
    # Standard metadata label for supply chain events
    SUPPLY_CHAIN_LABEL = 1337
    
    @staticmethod
    def create_supply_chain_metadata(event: SupplyChainEvent) -> Dict[str, Any]:
        """
        Create Cardano transaction metadata from a supply chain event.
        
        Args:
            event: SupplyChainEvent object
            
        Returns:
            Dictionary with metadata label and JSON metadata
        """
        metadata = {
            'label': CardanoMetadataService.SUPPLY_CHAIN_LABEL,
            'json_metadata': event.to_dict()
        }
        
        return metadata
    
    @staticmethod
    def decode_metadata(metadata: Dict[str, Any]) -> Optional[SupplyChainEvent]:
        """
        Decode Cardano transaction metadata into a supply chain event.
        
        Args:
            metadata: Dictionary containing metadata label and json_metadata
            
        Returns:
            SupplyChainEvent object or None if decoding fails
        """
        try:
            # Check if metadata has the expected structure
            if not isinstance(metadata, dict):
                return None
            
            # Extract json_metadata
            json_metadata = metadata.get('json_metadata')
            if not json_metadata:
                return None
            
            # Validate required fields
            required_fields = ['event_type', 'timestamp', 'location', 'actor_id', 'product_id', 'details']
            if not all(field in json_metadata for field in required_fields):
                return None
            
            # Create and return SupplyChainEvent
            return SupplyChainEvent.from_dict(json_metadata)
            
        except Exception as e:
            print(f"Error decoding metadata: {e}")
            return None
    
    @staticmethod
    def encode_for_transaction(event: SupplyChainEvent) -> str:
        """
        Encode supply chain event as JSON string for transaction submission.
        
        Args:
            event: SupplyChainEvent object
            
        Returns:
            JSON string representation
        """
        metadata = CardanoMetadataService.create_supply_chain_metadata(event)
        return json.dumps(metadata)
    
    @staticmethod
    def decode_from_transaction(metadata_json: str) -> Optional[SupplyChainEvent]:
        """
        Decode supply chain event from transaction metadata JSON string.
        
        Args:
            metadata_json: JSON string from transaction
            
        Returns:
            SupplyChainEvent object or None if decoding fails
        """
        try:
            metadata = json.loads(metadata_json)
            return CardanoMetadataService.decode_metadata(metadata)
        except json.JSONDecodeError:
            return None

