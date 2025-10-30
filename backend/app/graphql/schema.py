import strawberry
from strawberry.fastapi import BaseContext
from sqlalchemy.orm import Session

from app.graphql.resolvers import Query, Mutation


class Context(BaseContext):
    def __init__(self, db: Session):
        self.db = db


def get_context(db: Session = None):
    return Context(db=db)


# Create the GraphQL schema
schema = strawberry.Schema(
    query=Query,
    mutation=Mutation
)