def test_ticket_create_api(api_client, user, category, stage):
    api_client.force_authenticate(user=user)
    resp = api_client.post('/api/tickets/', {
        "title": "Test",
        "category": str(category.id),
        "current_stage": str(stage.id),
    })
    assert resp.status_code == 201
