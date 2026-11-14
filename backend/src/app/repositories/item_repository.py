from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.item import Item
from app.schemas.items import ItemCreate, ItemUpdate


class ItemRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list(self) -> list[Item]:
        statement = select(Item).order_by(Item.id)
        return list(self._session.scalars(statement))

    def get(self, item_id: int) -> Item | None:
        return self._session.get(Item, item_id)

    def create(self, item: ItemCreate) -> Item:
        created_item = Item(**item.model_dump())
        self._session.add(created_item)
        self._session.commit()
        self._session.refresh(created_item)
        return created_item

    def replace(self, item_id: int, item: ItemUpdate) -> Item | None:
        existing_item = self.get(item_id)
        if existing_item is None:
            return None

        for field, value in item.model_dump().items():
            setattr(existing_item, field, value)
        self._session.commit()
        self._session.refresh(existing_item)
        return existing_item

    def patch(self, item_id: int, changes: dict[str, str | None]) -> Item | None:
        existing_item = self.get(item_id)
        if existing_item is None:
            return None

        for field, value in changes.items():
            setattr(existing_item, field, value)
        self._session.commit()
        self._session.refresh(existing_item)
        return existing_item

    def delete(self, item_id: int) -> bool:
        item = self.get(item_id)
        if item is None:
            return False

        self._session.delete(item)
        self._session.commit()
        return True
