def test_item_endpoints_support_crud_and_query_filter(client):
    created_response = client.post(
        "/items/",
        json={"name": "Caderno", "description": "Capa azul"},
    )

    assert created_response.status_code == 201
    created_item = created_response.json()
    item_id = created_item["id"]
    assert created_item == {
        "id": item_id,
        "name": "Caderno",
        "description": "Capa azul",
    }

    list_response = client.get("/items/", params={"name": "CAD"})
    assert list_response.status_code == 200
    assert list_response.json() == [created_item]

    get_response = client.get(f"/items/{item_id}")
    assert get_response.status_code == 200
    assert get_response.json() == created_item

    replace_response = client.put(
        f"/items/{item_id}",
        json={"name": "Agenda", "description": "Capa preta"},
    )
    assert replace_response.status_code == 200
    assert replace_response.json() == {
        "id": item_id,
        "name": "Agenda",
        "description": "Capa preta",
    }

    patch_response = client.patch(
        f"/items/{item_id}",
        json={"description": "Capa vermelha"},
    )
    assert patch_response.status_code == 200
    assert patch_response.json() == {
        "id": item_id,
        "name": "Agenda",
        "description": "Capa vermelha",
    }

    delete_response = client.delete(f"/items/{item_id}")
    assert delete_response.status_code == 204
    assert delete_response.content == b""
    assert client.get(f"/items/{item_id}").status_code == 404


def test_item_endpoints_validate_payloads_and_path_parameters(client):
    assert client.post("/items/", json={"description": "Sem nome"}).status_code == 422
    assert client.get("/items/0").status_code == 422
    assert client.patch("/items/1", json={"name": None}).status_code == 422


def test_update_and_delete_missing_items_return_not_found(client):
    payload = {"name": "Item", "description": None}

    assert client.put("/items/99", json=payload).status_code == 404
    assert client.patch("/items/99", json={"name": "Novo"}).status_code == 404
    assert client.delete("/items/99").status_code == 404


def test_list_items_returns_empty_list_when_no_items_match(client):
    assert client.get("/items/").json() == []

    client.post("/items/", json={"name": "Caderno"})

    response = client.get("/items/", params={"name": "Lápis"})
    assert response.status_code == 200
    assert response.json() == []


def test_get_missing_item_returns_not_found_detail(client):
    response = client.get("/items/99")

    assert response.status_code == 404
    assert response.json() == {"detail": "Item não encontrado"}


def test_create_item_without_optional_description(client):
    first_response = client.post("/items/", json={"name": "Caderno"})
    second_response = client.post("/items/", json={"name": "Caneta"})

    assert first_response.status_code == 201
    assert first_response.json()["description"] is None
    assert second_response.json()["id"] == first_response.json()["id"] + 1


def test_put_item_replaces_fields_and_clears_omitted_description(client):
    item_id = client.post(
        "/items/",
        json={"name": "Caderno", "description": "Azul"},
    ).json()["id"]

    response = client.put(f"/items/{item_id}", json={"name": "Agenda"})

    assert response.status_code == 200
    assert response.json() == {
        "id": item_id,
        "name": "Agenda",
        "description": None,
    }


def test_patch_item_is_noop_when_empty_and_can_clear_description(client):
    item_id = client.post(
        "/items/",
        json={"name": "Caderno", "description": "Azul"},
    ).json()["id"]

    empty_patch_response = client.patch(f"/items/{item_id}", json={})
    assert empty_patch_response.status_code == 200
    assert empty_patch_response.json()["description"] == "Azul"

    clear_description_response = client.patch(
        f"/items/{item_id}",
        json={"description": None},
    )
    assert clear_description_response.status_code == 200
    assert clear_description_response.json()["description"] is None


def test_item_endpoints_reject_blank_names_and_non_integer_ids(client):
    assert client.post("/items/", json={"name": ""}).status_code == 422
    assert client.put("/items/1", json={"name": ""}).status_code == 422
    assert client.patch("/items/1", json={"name": ""}).status_code == 422
    assert client.get("/items/not-an-id").status_code == 422
