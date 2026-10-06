from app.repositories.item_repository import ItemRepository

_item_repository = ItemRepository()


def get_item_repository() -> ItemRepository:
    return _item_repository
