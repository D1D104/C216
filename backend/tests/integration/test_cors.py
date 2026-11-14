from fastapi.testclient import TestClient

from app.main import create_app

ALLOWED_ORIGIN = "http://localhost:5173"


def test_allowed_origin_receives_cors_headers(client: TestClient) -> None:
    response = client.get("/items/", headers={"Origin": ALLOWED_ORIGIN})

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == ALLOWED_ORIGIN


def test_preflight_allows_frontend_methods(client: TestClient) -> None:
    response = client.options(
        "/items/1",
        headers={
            "Origin": ALLOWED_ORIGIN,
            "Access-Control-Request-Method": "PUT",
            "Access-Control-Request-Headers": "Content-Type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == ALLOWED_ORIGIN
    assert "PUT" in response.headers["access-control-allow-methods"]


def test_unknown_origin_does_not_receive_cors_headers(client: TestClient) -> None:
    response = client.get("/items/", headers={"Origin": "http://malicioso.example"})

    assert "access-control-allow-origin" not in response.headers


def test_cors_origins_can_be_configured_per_app() -> None:
    application = create_app(cors_origins=["http://frontend.local"])

    with TestClient(application) as test_client:
        response = test_client.options(
            "/health",
            headers={
                "Origin": "http://frontend.local",
                "Access-Control-Request-Method": "GET",
            },
        )

    assert response.headers["access-control-allow-origin"] == "http://frontend.local"
