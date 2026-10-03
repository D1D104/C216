from app.schemas.items import ItemCreate, ItemRead, ItemUpdate


class ItemRepository:
    def __init__(self) -> None:
        self._items: dict[int, ItemRead] = {}
        self._next_id = 1

    def list(self) -> list[ItemRead]:
        return list(self._items.values())

    def get(self, item_id: int) -> ItemRead | None:
        return self._items.get(item_id)

    def create(self, item: ItemCreate) -> ItemRead:
        created_item = ItemRead(id=self._next_id, **item.model_dump())
        self._items[self._next_id] = created_item
        self._next_id += 1
        return created_item

    def replace(self, item_id: int, item: ItemUpdate) -> ItemRead | None:
        if item_id not in self._items:
            return None

        updated_item = ItemRead(id=item_id, **item.model_dump())
        self._items[item_id] = updated_item
        return updated_item

    def patch(self, item_id: int, changes: dict[str, str | None]) -> ItemRead | None:
        item = self.get(item_id)
        if item is None:
            return None

        updated_item = item.model_copy(update=changes)
        self._items[item_id] = updated_item
        return updated_item

    def delete(self, item_id: int) -> bool:
        return self._items.pop(item_id, None) is not None
