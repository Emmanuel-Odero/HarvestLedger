from fastapi import FastAPI, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base, get_db
from app.api.routes import health, email
from app.core.hedera import hedera_client
from app.core.redis_client import redis_client
from app.graphql.schema import schema, get_context

# Import all models to register them with SQLAlchemy Base
from app.models import user, harvest, loan, transaction


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting HarvestLedger backend...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize Redis client
    await redis_client.connect()
    
    # Initialize Hedera client
    await hedera_client.initialize()
    
    yield
    
    # Shutdown
    print("Shutting down HarvestLedger backend...")
    await hedera_client.close()
    await redis_client.disconnect()


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
        return get_context(db=db)
    finally:
        db.close()

graphql_app = GraphQLRouter(schema, context_getter=get_graphql_context)

# Include routes
app.include_router(health.router, prefix="", tags=["health"])
app.include_router(email.router, prefix="/api/email", tags=["email"])
app.include_router(graphql_app, prefix="/graphql")


@app.get("/")
async def root():
    return {
        "message": "HarvestLedger API",
        "version": "1.0.0",
        "docs": "/docs",
        "graphql": "/graphql"
    }