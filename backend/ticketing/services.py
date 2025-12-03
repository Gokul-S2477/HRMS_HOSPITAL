from django.db import transaction
from .models import TicketSequence, icketActivity, TicketAssignment, WorkflowTransition
from datetime import timedelta
from django.utils import timezone

def generate_ticket_number():
    # TCK-YYYYMM-XXXX
    prefix = timezone.now().strftime('TCK-%Y%m')
    with transaction.atomic():
        seq_obj, created = TicketSequence.objects.select_for_update().get_or_create(id=prefix)
        seq_obj.seq += 1
        seq = seq_obj.seq
        seq_obj.save()
    return f'{prefix}-{seq:06d}'

def compute_sla_deadline(ticket):
    stage = ticket.current_stage
    sla_hours = None
    if stage and stage.sla_hours:
        sla_hours = stage.sla_hours
    else:
        # fallback: category default (you might add a category field)
        sla_hours = getattr(ticket.category, 'default_sla_hours', None)
    if sla_hours:
        ticket.sla_deadline = timezone.now() + timedelta(hours=sla_hours)
        ticket.save(update_fields=['sla_deadline'])


@transaction.atomic
def transition_ticket(ticket, to_stage, actor, comment=None, assign_to=None):
    # validate
    valid = validate_transition(ticket, to_stage)
    if not valid:
        raise ValueError('Invalid transition')

    # record
    prev_stage = ticket.current_stage
    ticket.current_stage = to_stage
    if to_stage and to_stage.sla_hours:
        compute_sla_deadline(ticket)  # updates ticket
    ticket.updated_at = timezone.now()
    ticket.save()

    # activity
    TicketActivity.objects.create(ticket=ticket, actor=actor, action='stage_changed',
                                  meta={'from': str(prev_stage.id) if prev_stage else None, 'to': str(to_stage.id)})

    # optional assignment
    if assign_to:
        TicketAssignment.objects.create(ticket=ticket, from_user=ticket.assigned_to, to_user=assign_to, performed_by=actor)
        ticket.assigned_to = assign_to
        ticket.save(update_fields=['assigned_to'])

    # notifications
    from .notifications import notify_stage_change
    notify_stage_change(ticket, actor, comment)

    return ticket

