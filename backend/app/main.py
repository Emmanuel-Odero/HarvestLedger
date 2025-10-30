from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
# Removed GraphQL imports for now
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.api.routes import health, email
from app.core.hedera import hedera_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting HarvestLedger backend...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize Hedera client
    await hedera_client.initialize()
    
    yield
    
    # Shutdown
    print("Shutting down HarvestLedger backend...")
    await hedera_client.close()


# Create FastAPI app
app = FastAPI(
    title="HarvestLedger API",
    description="Agriculture Supply Chain & Financing Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include REST API routes
app.include_router(health.router, prefix="", tags=["health"])
app.include_router(email.router, prefix="/api/email", tags=["email"])


@app.get("/")
async def root():
    return {
        "message": "HarvestLedger API",
        "version": "1.0.0",
        "docs": "/docs",
        "graphql": "/graphql"
    }