import strawberry
from strawberry.fastapi import BaseContext
from sqlalchemy.orm import Session
from typing import Optional
from fastapi import Request

from app.graphql.resolvers import Query, Mutation
from app.graphql.cardano_resolvers import CardanoQuery, CardanoMutation
from app.core.auth import verify_token
from app.models.user import User


class Context(BaseContext):
    def __init__(self, db: Session, current_user: Optional[User] = None):
        self.db = db
        self.current_user = current_user


def get_context(request: Request, db: Session = None):
    """Extract JWT token from request and get current user"""
    current_user = None
    
    # Try to get token from Authorization header
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = verify_token(token)
        
        if payload:
            from app.core.database import SessionLocal
            from app.models.user import User as UserModel
            temp_db = SessionLocal()
            try:
                user_id = payload.get("sub")
                hedera_account_id = payload.get("hedera_account_id")
                
                if hedera_account_id:
                    current_user = temp_db.query(UserModel).filter(
                        UserModel.hedera_account_id == hedera_account_id
                    ).first()
                elif user_id:
                    current_user = temp_db.query(UserModel).filter(
                        UserModel.id == user_id
                    ).first()
            finally:
                temp_db.close()
    
    return Context(db=db, current_user=current_user)


# Combine existing and Cardano queries
@strawberry.type
class CombinedQuery(Query, CardanoQuery):
    """Combined GraphQL queries including Hedera and Cardano operations"""
    pass


# Combine existing and Cardano mutations
@strawberry.type
class CombinedMutation(Mutation, CardanoMutation):
    """Combined GraphQL mutations including Hedera and Cardano operations"""
    pass


# Create the GraphQL schema
schema = strawberry.Schema(
    query=CombinedQuery,
    mutation=CombinedMutation
)