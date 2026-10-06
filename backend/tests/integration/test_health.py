import pytest


@pytest.mark.parametrize("path", ["/", "/health"])
def test_health_routes_return_expected_message(client, path):
    response = client.get(path)

    assert response.status_code == 200
    assert response.json() == {"message": "Olá :)"}
