def get_auth_headers(client, username="TestUser", password="TestPassword1!"):
    resp = client.post("/users", json={"username": username, "email": f"{username}@example.com", "plain_password": password})
    if resp.status_code == 201:
        user_id = resp.json()["id"]
    else:
        # User already exists in DB from another test, we don't have id easily. But let's assume we use unique usernames from now on!
        user_id = 1
        
    login_response = client.post("/auth/token", data={"username": username, "password": password})
    token = login_response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"} if token else {}, user_id

def test_create_api_key(client):
    headers, _ = get_auth_headers(client, "TestUser1")

    response = client.post(
        "/apikeys?name=MyKey",
        headers=headers
    )

    assert response.status_code == 201
    assert "api_key" in response.json()

def test_delete_api_key(client):
    headers, u_id = get_auth_headers(client, "TestUser2")
    created = client.post(
        "/apikeys?name=MyKey",
        headers=headers
    )
    key_id = created.json().get("id", 1)

    response = client.delete(
        f"/apikeys/{key_id}?user_id={u_id}", headers=headers
    )

    assert response.status_code == 200
    assert response.json() == {"message": "api key revoked"}

def test_get_my_keys(client):
    headers, u_id = get_auth_headers(client, "TestUser3")
    client.post(
        "/apikeys?name=MyKey", headers=headers
    )

    response = client.get(f"/apikeys?user_id={u_id}", headers=headers)

    assert response.status_code == 200
    assert "key_hint" in response.json()[0]
