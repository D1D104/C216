from app.repositories.item_repository import ItemRepository
from app.schemas.items import ItemCreate, ItemPatch, ItemRead, ItemUpdate


class ItemService:
    def __init__(self, repository: ItemRepository) -> None:
        self._repository = repository

    def list_items(self, name: str | None = None) -> list[ItemRead]:
        items = self._repository.list()
        if name is None:
            return items

        normalized_name = name.casefold()
        return [item for item in items if normalized_name in item.name.casefold()]

    def get_item(self, item_id: int) -> ItemRead | None:
        return self._repository.get(item_id)

    def create_item(self, item: ItemCreate) -> ItemRead:
        return self._repository.create(item)

    def replace_item(self, item_id: int, item: ItemUpdate) -> ItemRead | None:
        return self._repository.replace(item_id, item)

    def patch_item(self, item_id: int, item: ItemPatch) -> ItemRead | None:
        changes = item.model_dump(exclude_unset=True)
        return self._repository.patch(item_id, changes)

    def delete_item(self, item_id: int) -> bool:
        return self._repository.delete(item_id)
