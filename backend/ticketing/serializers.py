from rest_framework import serializers
from .models import Ticket, TicketComment, TicketAttachment, TicketCategory, WorkflowStage

class TicketCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketCategory
        fields = '__all__'

class WorkflowStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStage
        fields = '__all__'

class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        read_only_fields = ('ticket_number','created_at','updated_at','sla_deadline')
        fields = ('id','ticket_number','title','description','priority','category',
                  'current_stage','assigned_to','due_date','is_internal','source_system','source_id')

    def create(self, validated_data):
        from .services import generate_ticket_number, compute_sla_deadline
        user = self.context['request'].user
        validated_data.setdefault('raised_by', user)
        validated_data['ticket_number'] = generate_ticket_number()
        ticket = super().create(validated_data)
        # compute SLA deadline
        compute_sla_deadline(ticket)
        # create initial activity
        from .models import TicketActivity
        TicketActivity.objects.create(ticket=ticket, actor=user, action='ticket_created', meta={})
        return ticket

class TicketSerializer(serializers.ModelSerializer):
    category = TicketCategorySerializer(read_only=True)
    current_stage = WorkflowStageSerializer(read_only=True)
    class Meta:
        model = Ticket
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = TicketComment
        fields = '__all__'
        read_only_fields = ('author','created_at','updated_at')

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['author'] = user
        comment = super().create(validated_data)
        # parse mentions and create TicketActivity + mention records and send notifications
        from .services import handle_comment_mentions
        handle_comment_mentions(comment)
        return comment
