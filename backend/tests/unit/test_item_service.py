from app.schemas.items import ItemCreate, ItemPatch, ItemUpdate
from app.services.item_service import ItemService


def test_create_and_get_item(service: ItemService) -> None:
    created_item = service.create_item(
        ItemCreate(name="Caderno", description="Capa azul")
    )

    assert created_item.id == 1
    assert service.get_item(created_item.id) == created_item


def test_list_items_filters_names_case_insensitively(service: ItemService) -> None:
    service.create_item(ItemCreate(name="Caderno"))
    service.create_item(ItemCreate(name="Caneta"))

    assert [item.name for item in service.list_items(name="CAD")] == ["Caderno"]


def test_replace_item_replaces_all_mutable_fields(service: ItemService) -> None:
    item = service.create_item(ItemCreate(name="Rascunho", description="Antigo"))

    replaced_item = service.replace_item(
        item.id,
        ItemUpdate(name="Caderno", description="Novo"),
    )

    assert replaced_item is not None
    assert replaced_item.name == "Caderno"
    assert replaced_item.description == "Novo"


def test_patch_item_changes_only_provided_fields(service: ItemService) -> None:
    item = service.create_item(ItemCreate(name="Caderno", description="Azul"))

    patched_item = service.patch_item(item.id, ItemPatch(description="Verde"))

    assert patched_item is not None
    assert patched_item.name == "Caderno"
    assert patched_item.description == "Verde"


def test_delete_item_removes_it(service: ItemService) -> None:
    item = service.create_item(ItemCreate(name="Caderno"))

    assert service.delete_item(item.id) is True
    assert service.get_item(item.id) is None
    assert service.delete_item(item.id) is False


def test_list_items_returns_empty_list_when_repository_is_empty(
    service: ItemService,
) -> None:
    assert service.list_items() == []


def test_replace_and_patch_return_none_for_missing_items(service: ItemService) -> None:
    assert service.replace_item(99, ItemUpdate(name="Caderno")) is None
    assert service.patch_item(99, ItemPatch(name="Caderno")) is None
