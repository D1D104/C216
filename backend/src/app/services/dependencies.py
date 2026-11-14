from typing import Annotated

from fastapi import Depends

from app.repositories.dependencies import get_item_repository
from app.repositories.item_repository import ItemRepository
from app.services.item_service import ItemService


def get_item_service(
    repository: Annotated[ItemRepository, Depends(get_item_repository)],
) -> ItemService:
    return ItemService(repository)
