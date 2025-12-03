from celery import shared_task
from django.utils import timezone
from .models import Ticket, SLARecord
from .notifications import notify_sla_breach

@shared_task
def check_sla_breaches():
    now = timezone.now()
    qs = Ticket.objects.filter(sla_deadline__lte=now).exclude(status__in=['closed','resolved'])
    for ticket in qs:
        # avoid duplicate escalations — check SLARecord
        sr, created = SLARecord.objects.get_or_create(ticket=ticket)
        if not sr.breached:
            sr.breached = True
            sr.breached_at = now
            sr.save()
            # create activity
            from .models import TicketActivity
            TicketActivity.objects.create(ticket=ticket, action='sla_breached', actor=None, meta={})
            # escalate (notify role)
            notify_sla_breach(ticket)
