def test_ticket_creation(db, user, category, stage):
    ticket = Ticket.objects.create(
        title="Test Ticket",
        category=category,
        current_stage=stage,
        raised_by=user
    )
    assert ticket.id is not None
    assert ticket.ticket_number.startswith("TCK-")
