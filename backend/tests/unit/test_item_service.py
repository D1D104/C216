from app.repositories.item_repository import ItemRepository
from app.schemas.items import ItemCreate, ItemPatch, ItemUpdate
from app.services.item_service import ItemService


def create_service() -> ItemService:
    return ItemService(ItemRepository())


def test_create_and_get_item():
    service = create_service()

    created_item = service.create_item(
        ItemCreate(name="Caderno", description="Capa azul")
    )

    assert created_item.id == 1
    assert service.get_item(created_item.id) == created_item


def test_list_items_filters_names_case_insensitively():
    service = create_service()
    service.create_item(ItemCreate(name="Caderno"))
    service.create_item(ItemCreate(name="Caneta"))

    assert [item.name for item in service.list_items(name="CAD")] == ["Caderno"]


def test_replace_item_replaces_all_mutable_fields():
    service = create_service()
    item = service.create_item(ItemCreate(name="Rascunho", description="Antigo"))

    replaced_item = service.replace_item(
        item.id,
        ItemUpdate(name="Caderno", description="Novo"),
    )

    assert replaced_item is not None
    assert replaced_item.name == "Caderno"
    assert replaced_item.description == "Novo"


def test_patch_item_changes_only_provided_fields():
    service = create_service()
    item = service.create_item(ItemCreate(name="Caderno", description="Azul"))

    patched_item = service.patch_item(item.id, ItemPatch(description="Verde"))

    assert patched_item is not None
    assert patched_item.name == "Caderno"
    assert patched_item.description == "Verde"


def test_delete_item_removes_it():
    service = create_service()
    item = service.create_item(ItemCreate(name="Caderno"))

    assert service.delete_item(item.id) is True
    assert service.get_item(item.id) is None
    assert service.delete_item(item.id) is False


def test_list_items_returns_empty_list_when_repository_is_empty():
    assert create_service().list_items() == []


def test_replace_and_patch_return_none_for_missing_items():
    service = create_service()

    assert service.replace_item(99, ItemUpdate(name="Caderno")) is None
    assert service.patch_item(99, ItemPatch(name="Caderno")) is None
