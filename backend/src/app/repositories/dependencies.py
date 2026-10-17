from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.repositories.item_repository import ItemRepository


def get_item_repository(
    session: Annotated[Session, Depends(get_session)],
) -> ItemRepository:
    return ItemRepository(session)
