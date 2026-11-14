import pytest

from app.config import DEFAULT_CORS_ORIGINS, get_cors_origins


def test_cors_origins_default_to_local_frontend(monkeypatch) -> None:
    monkeypatch.delenv("CORS_ORIGINS", raising=False)

    assert get_cors_origins() == list(DEFAULT_CORS_ORIGINS)


def test_cors_origins_are_read_from_environment(monkeypatch) -> None:
    monkeypatch.setenv(
        "CORS_ORIGINS", " http://localhost:3000/ , http://app.local:8080,, "
    )

    assert get_cors_origins() == ["http://localhost:3000", "http://app.local:8080"]


@pytest.mark.parametrize("value", ["*", "http://localhost:5173,*", " , "])
def test_cors_origins_reject_wildcard_or_empty_values(value: str) -> None:
    with pytest.raises(RuntimeError):
        get_cors_origins(value)
