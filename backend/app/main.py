from fastapi import FastAPI, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.api.routes import health
# from app.api.routes import email  # Temporarily disabled
from app.core.hedera import hedera_client
from app.core.redis_client import redis_client
from app.graphql.schema import schema, get_context

# Import all models to register them with SQLAlchemy Base
from app.models import user, user_wallet, harvest, loan, transaction

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting HarvestLedger backend...")
    
    try:
        # Create database tables
        print("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
        
        # Initialize Redis client
        print("Connecting to Redis...")
        await redis_client.connect()
        print("Redis connected successfully")
        
        # Initialize Hedera client
        print("Initializing Hedera client...")
        await hedera_client.initialize()
        print("Hedera client initialized successfully")
        
    except Exception as e:
        print(f"Error during startup: {e}")
        raise
    
    yield
    
    # Shutdown
    print("Shutting down HarvestLedger backend...")
    try:
        await hedera_client.close()
        await redis_client.disconnect()
    except Exception as e:
        print(f"Error during shutdown: {e}")


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

# Create GraphQL router with custom context
async def get_graphql_context(request: Request, response: Response):
    db = next(get_db())
    try:
        from app.graphql.schema import get_context
        return get_context(request=request, db=db)
    finally:
        db.close()

graphql_app = GraphQLRouter(schema, context_getter=get_graphql_context)

# Include routes
app.include_router(health.router, prefix="", tags=["health"])
# app.include_router(email.router, prefix="/api/email", tags=["email"])  # Temporarily disabled
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
async def root():
    return {
        "message": "HarvestLedger API",
        "version": "1.0.0",
        "docs": "/docs",
        "graphql": "/graphql"
    }