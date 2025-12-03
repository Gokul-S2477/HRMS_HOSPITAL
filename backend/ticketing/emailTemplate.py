Hello {{ recipient.get_full_name() or recipient.username }},

A new ticket has been created.

Ticket: {{ ticket.ticket_number }}
Title: {{ ticket.title }}
Category: {{ ticket.category.name }}
Priority: {{ ticket.get_priority_display }}
Stage: {{ ticket.current_stage.name if ticket.current_stage else 'N/A' }}
Raised by: {{ actor.get_full_name() or actor.username }}
Due date: {{ ticket.due_date }}

View: {{ base_url }}/tickets/{{ ticket.id }}
