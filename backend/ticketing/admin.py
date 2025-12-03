from django.contrib import admin
from .models import Ticket, TicketCategory, WorkflowStage, WorkflowTransition, TicketComment

@admin.register(TicketCategory)
class TicketCategoryAdmin(admin.ModelAdmin):
    list_display = ('name','key','is_active')

@admin.register(WorkflowStage)
class WorkflowStageAdmin(admin.ModelAdmin):
    list_display = ('name','category','position','sla_hours')

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_number','title','category','current_stage','status','assigned_to')
    list_filter = ('category','status','priority')
    search_fields = ('ticket_number','title','description')
