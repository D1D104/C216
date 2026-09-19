import pytest
from fastapi.testclient import TestClient

from app.main import app, home


@pytest.fixture
def client():
    return TestClient(app)


def test_home_returns_expected_message():
    assert home() == {"message": "Olá :)"}


def test_root_returns_successful_response(client):
    response = client.get("/")

    assert response.status_code == 200


@pytest.mark.parametrize(
    ("path", "expected_status"),
    [
        ("/", 200),
        ("/docs", 200),
        ("/openapi.json", 200),
    ],
)
def test_public_routes_return_expected_status(client, path, expected_status):
    response = client.get(path)

    assert response.status_code == expected_status


@pytest.mark.parametrize("path", ["/missing", "/unknown"])
def test_unknown_routes_return_not_found(client, path):
    response = client.get(path)

    assert response.status_code == 404


def test_root_returns_json_message(client):
    response = client.get("/")

    assert response.json() == {"message": "Olá :)"}
