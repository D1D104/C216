import os
from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.engine import URL, make_url
from sqlalchemy.orm import Session


def get_database_url(value: str | None = None) -> URL:
    database_url = value or os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("A variável de ambiente DATABASE_URL não foi definida")

    url = make_url(database_url)
    if url.drivername == "postgresql":
        return url.set(drivername="postgresql+psycopg")
    return url


@lru_cache
def get_engine() -> Engine:
    return create_engine(get_database_url(), pool_pre_ping=True)


def get_session() -> Iterator[Session]:
    with Session(get_engine()) as session:
        yield session
