import pytest
from django.contrib.auth import get_user_model
from ticketing.models import TicketCategory, WorkflowStage, Ticket

@pytest.fixture
def user(db):
    return get_user_model().objects.create_user("testuser", "user@test.com", "password")

@pytest.fixture
def category(db):
    return TicketCategory.objects.create(name="Recruit", key="RECRUIT")

@pytest.fixture
def stage(db, category):
    return WorkflowStage.objects.create(category=category, name="Shortlisted", key="SHORTLISTED", position=1)

@pytest.fixture
def ticket(db, user, category, stage):
    return Ticket.objects.create(
        title="Test Ticket",
        ticket_number="TCK-123456",
        category=category,
        current_stage=stage,
        raised_by=user
    )
