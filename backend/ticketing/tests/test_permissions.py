def test_non_assignee_cannot_transition(api_client, ticket, user2):
    api_client.force_authenticate(user2)
    resp = api_client.post(f'/api/tickets/{ticket.id}/transition/', {
        "to_stage_id": ticket.current_stage.id
    })
    assert resp.status_code == 403
