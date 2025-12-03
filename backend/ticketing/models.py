import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

def gen_uuid():
    return uuid.uuid4()

PRIORITY_CHOICES = (
    (1, 'Low'),
    (2, 'Medium'),
    (3, 'High'),
    (4, 'Critical'),
)

STATUS_CHOICES = (
    ('open', 'Open'),
    ('in_progress', 'In Progress'),
    ('on_hold', 'On Hold'),
    ('resolved', 'Resolved'),
    ('closed', 'Closed'),
)

class TicketCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    name = models.CharField(max_length=200)
    key = models.CharField(max_length=64, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    default_assignee_role = models.CharField(max_length=100, blank=True, null=True)
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class WorkflowStage(models.Model):
    id = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    category = models.ForeignKey(TicketCategory, related_name='stages', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    key = models.CharField(max_length=100)  # unique within category
    position = models.PositiveIntegerField(default=0)
    sla_hours = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    default_assignee_role = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('category', 'key')
        ordering = ['position']

    def __str__(self):
        return f"{self.category.key} - {self.name}"

class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    ticket_number = models.CharField(max_length=50, unique=True)  # generated human-friendly ID
    title = models.CharField(max_length=512)
    description = models.TextField(blank=True, null=True)
    priority = models.PositiveSmallIntegerField(choices=PRIORITY_CHOICES, default=2)
    category = models.ForeignKey(TicketCategory, related_name='tickets', on_delete=models.SET_NULL, null=True)
    current_stage = models.ForeignKey(WorkflowStage, related_name='tickets', on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='open')
    raised_by = models.ForeignKey(User, related_name='raised_tickets', on_delete=models.SET_NULL, null=True)
    assigned_to = models.ForeignKey(User, related_name='assigned_tickets', on_delete=models.SET_NULL, null=True, blank=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    due_date = models.DateTimeField(null=True, blank=True)
    sla_deadline = models.DateTimeField(null=True, blank=True)
    is_internal = models.BooleanField(default=False)
    source_system = models.CharField(max_length=100, null=True, blank=True)  # e.g., 'recruitment'
    source_id = models.CharField(max_length=200, null=True, blank=True)       # correlation id
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['ticket_number']),
            models.Index(fields=['category']),
            models.Index(fields=['assigned_to']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return self.ticket_number

class TicketComment(models.Model):
    id = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    ticket = models.ForeignKey(Ticket, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(User, related_name='ticket_comments', on_delete=models.SET_NULL, null=True)
    content = models.TextField()
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

class TicketActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    ticket = models.ForeignKey(Ticket, related_name='activities', on_delete=models.CASCADE)
    actor = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=200)
    meta = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

class TicketAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    ticket = models.ForeignKey(Ticket, related_name='attachments', on_delete=models.CASCADE)
    uploaded_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    file = models.FileField(upload_to='ticket_attachments/')  # configure storage backend
    filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100, blank=True, null=True)
    size = models.BigIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

class TicketAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    ticket = models.ForeignKey(Ticket, related_name='assignments', on_delete=models.CASCADE)
    from_user = models.ForeignKey(User, null=True, blank=True, related_name='+', on_delete=models.SET_NULL)
    to_user = models.ForeignKey(User, null=True, blank=True, related_name='+', on_delete=models.SET_NULL)
    to_role = models.CharField(max_length=100, blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    performed_by = models.ForeignKey(User, null=True, blank=True, related_name='+', on_delete=models.SET_NULL)
    created_at = models.DateTimeField(default=timezone.now)

class WorkflowTransition(models.Model):
    id = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    category = models.ForeignKey(TicketCategory, related_name='transitions', on_delete=models.CASCADE)
    from_stage = models.ForeignKey(WorkflowStage, related_name='transitions_from', on_delete=models.CASCADE)
    to_stage = models.ForeignKey(WorkflowStage, related_name='transitions_to', on_delete=models.CASCADE)
    condition = models.JSONField(null=True, blank=True)  # optional
    auto_create_ticket = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

class SLARecord(models.Model):
    id = models.UUIDField(primary_key=True, default=gen_uuid, editable=False)
    ticket = models.ForeignKey(Ticket, related_name='sla_records', on_delete=models.CASCADE)
    breached = models.BooleanField(default=False)
    breached_at = models.DateTimeField(null=True, blank=True)
    escalated = models.BooleanField(default=False)
    escalated_to = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

class TicketSequence(models.Model):
    id = models.CharField(max_length=20, primary_key=True)  # e.g., 'TCK-202511'
    seq = models.BigIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

