import pytest

from app.config import DEFAULT_CORS_ORIGINS, get_cors_origins
from app.database.session import get_database_url


def test_cors_usa_origens_padrao_sem_variavel(monkeypatch):
    monkeypatch.delenv("CORS_ORIGINS", raising=False)

    assert get_cors_origins() == list(DEFAULT_CORS_ORIGINS)


def test_cors_le_origens_da_variavel(monkeypatch):
    monkeypatch.setenv("CORS_ORIGINS", " http://localhost:3000/ , http://app.local,, ")

    assert get_cors_origins() == ["http://localhost:3000", "http://app.local"]


@pytest.mark.parametrize("valor", ["*", "http://localhost:5173,*", " , "])
def test_cors_recusa_curinga_ou_vazio(valor):
    with pytest.raises(RuntimeError):
        get_cors_origins(valor)


def test_database_url_usa_driver_psycopg():
    url = get_database_url("postgresql://u:s@localhost:5432/db")

    assert url.drivername == "postgresql+psycopg"


def test_database_url_obrigatoria(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)

    with pytest.raises(RuntimeError):
        get_database_url()
