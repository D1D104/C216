import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.dependencies import get_item_repository
from app.repositories.item_repository import ItemRepository


@pytest.fixture
def client():
    app.dependency_overrides[get_item_repository] = ItemRepository
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
