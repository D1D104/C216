from app.repositories.item_repository import ItemRepository
from app.schemas.items import ItemCreate, ItemPatch, ItemRead, ItemUpdate


class ItemService:
    def __init__(self, repository: ItemRepository) -> None:
        self._repository = repository

    def list_items(self, name: str | None = None) -> list[ItemRead]:
        items = self._repository.list()
        if name is not None:
            normalized_name = name.casefold()
            items = [item for item in items if normalized_name in item.name.casefold()]
        return [ItemRead.model_validate(item) for item in items]

    def get_item(self, item_id: int) -> ItemRead | None:
        item = self._repository.get(item_id)
        return ItemRead.model_validate(item) if item is not None else None

    def create_item(self, item: ItemCreate) -> ItemRead:
        return ItemRead.model_validate(self._repository.create(item))

    def replace_item(self, item_id: int, item: ItemUpdate) -> ItemRead | None:
        updated_item = self._repository.replace(item_id, item)
        return (
            ItemRead.model_validate(updated_item) if updated_item is not None else None
        )

    def patch_item(self, item_id: int, item: ItemPatch) -> ItemRead | None:
        changes = item.model_dump(exclude_unset=True)
        updated_item = self._repository.patch(item_id, changes)
        return (
            ItemRead.model_validate(updated_item) if updated_item is not None else None
        )

    def delete_item(self, item_id: int) -> bool:
        return self._repository.delete(item_id)
