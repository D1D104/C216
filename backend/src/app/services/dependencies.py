from app.repositories.dependencies import get_item_repository
from app.services.item_service import ItemService


def get_item_service() -> ItemService:
    return ItemService(get_item_repository())
