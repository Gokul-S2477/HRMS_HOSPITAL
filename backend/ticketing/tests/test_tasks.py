def test_sla_task(db, ticket):
    result = check_sla_breaches()
    assert SLARecord.objects.filter(ticket=ticket, breached=True).exists()
