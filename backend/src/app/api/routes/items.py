from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status

from app.schemas.items import ItemCreate, ItemPatch, ItemRead, ItemUpdate
from app.services.dependencies import get_item_service
from app.services.item_service import ItemService

router = APIRouter(prefix="/items", tags=["items"])


@router.get("/", response_model=list[ItemRead])
def list_items(
    service: Annotated[ItemService, Depends(get_item_service)],
    name: Annotated[str | None, Query(description="Filtra por parte do nome")] = None,
) -> list[ItemRead]:
    return service.list_items(name=name)


@router.post("/", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(
    item: ItemCreate,
    service: Annotated[ItemService, Depends(get_item_service)],
) -> ItemRead:
    return service.create_item(item)


@router.get("/{item_id}", response_model=ItemRead)
def get_item(
    item_id: Annotated[int, Path(gt=0)],
    service: Annotated[ItemService, Depends(get_item_service)],
) -> ItemRead:
    item = service.get_item(item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado"
        )
    return item


@router.put("/{item_id}", response_model=ItemRead)
def replace_item(
    item: ItemUpdate,
    item_id: Annotated[int, Path(gt=0)],
    service: Annotated[ItemService, Depends(get_item_service)],
) -> ItemRead:
    updated_item = service.replace_item(item_id, item)
    if updated_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado"
        )
    return updated_item


@router.patch("/{item_id}", response_model=ItemRead)
def patch_item(
    item: ItemPatch,
    item_id: Annotated[int, Path(gt=0)],
    service: Annotated[ItemService, Depends(get_item_service)],
) -> ItemRead:
    updated_item = service.patch_item(item_id, item)
    if updated_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado"
        )
    return updated_item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: Annotated[int, Path(gt=0)],
    service: Annotated[ItemService, Depends(get_item_service)],
) -> Response:
    if not service.delete_item(item_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item não encontrado"
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
