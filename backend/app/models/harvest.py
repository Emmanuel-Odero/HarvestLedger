from sqlalchemy import Column, String, Integer, Float, DateTime, Enum, Text, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base


class HarvestStatus(str, enum.Enum):
    PLANTED = "planted"
    GROWING = "growing"
    HARVESTED = "harvested"
    TOKENIZED = "tokenized"
    SOLD = "sold"


class CropType(str, enum.Enum):
    CORN = "corn"
    WHEAT = "wheat"
    SOYBEANS = "soybeans"
    RICE = "rice"
    COTTON = "cotton"
    TOMATOES = "tomatoes"
    POTATOES = "potatoes"
    OTHER = "other"


class Harvest(Base):
    __tablename__ = "harvests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Crop information
    crop_type = Column(Enum(CropType), nullable=False)
    variety = Column(String, nullable=True)
    quantity = Column(Float, nullable=False)  # in tons
    unit = Column(String, default="tons")
    
    # Location and farming details
    farm_location = Column(String, nullable=False)
    field_coordinates = Column(JSON, nullable=True)  # GPS coordinates
    planting_date = Column(DateTime(timezone=True), nullable=True)
    harvest_date = Column(DateTime(timezone=True), nullable=True)
    
    # Quality metrics
    quality_grade = Column(String, nullable=True)
    moisture_content = Column(Float, nullable=True)
    organic_certified = Column(String, default=False)
    
    # Blockchain integration
    hcs_transaction_id = Column(String, nullable=True)  # HCS message transaction ID
    hts_token_id = Column(String, nullable=True)  # HTS token ID if tokenized
    
    # Status and metadata
    status = Column(Enum(HarvestStatus), default=HarvestStatus.PLANTED)
    notes = Column(Text, nullable=True)
    extra_data = Column(JSON, nullable=True)  # Additional flexible data (renamed from metadata)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    farmer = relationship("User", back_populates="harvests")

    def __repr__(self):
        return f"<Harvest(id={self.id}, crop_type={self.crop_type}, quantity={self.quantity})>"


# Add relationship to User model
from app.models.user import User
User.harvests = relationship("Harvest", back_populates="farmer")