from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session

from app.database.base import Base
from app.database.session import get_session
from app.main import create_app
from app.repositories.item_repository import ItemRepository
from app.services.item_service import ItemService


@pytest.fixture
def db_engine(tmp_path: Path) -> Iterator[Engine]:
    engine = create_engine(
        f"sqlite:///{tmp_path / 'test.db'}",
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def service(db_engine: Engine) -> Iterator[ItemService]:
    with Session(db_engine) as session:
        yield ItemService(ItemRepository(session))


@pytest.fixture
def client(db_engine: Engine) -> Iterator[TestClient]:
    application = create_app()

    def override_session() -> Iterator[Session]:
        with Session(db_engine) as session:
            yield session

    application.dependency_overrides[get_session] = override_session
    with TestClient(application) as test_client:
        yield test_client
    application.dependency_overrides.clear()
