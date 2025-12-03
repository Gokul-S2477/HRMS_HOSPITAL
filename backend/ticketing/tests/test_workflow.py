def test_valid_transition(api_client, ticket, stage2):
    api_client.force_authenticate(ticket.assigned_to)
    resp = api_client.post(f'/api/tickets/{ticket.id}/transition/', {
        "to_stage_id": str(stage2.id)
    })
    assert resp.status_code == 200
