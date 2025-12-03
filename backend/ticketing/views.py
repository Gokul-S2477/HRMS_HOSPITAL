from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Ticket, TicketComment, TicketCategory, WorkflowStage, TicketAssignment, TicketActivity
from .serializers import (
    TicketSerializer,
    TicketCreateSerializer,
    CommentSerializer,
    TicketCategorySerializer,
    WorkflowStageSerializer
)
from .permissions import CanViewTicket, CanTransitionTicket, IsAdmin


# -----------------------------
# Ticket ViewSet
# -----------------------------
class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all().select_related(
        'category', 'current_stage', 'assigned_to', 'raised_by'
    )
    filterset_fields = ['category', 'status', 'assigned_to', 'priority', 'current_stage']
    search_fields = ['ticket_number', 'title', 'description']

    def get_serializer_class(self):
        if self.action == 'create':
            return TicketCreateSerializer
        return TicketSerializer

    def get_permissions(self):
        if self.action in ['create', 'list']:
            return [IsAuthenticated()]
        if self.action == 'retrieve':
            return [CanViewTicket()]
        if self.action == 'transition':
            return [CanTransitionTicket()]
        if self.action == 'destroy':
            return [IsAdmin()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def transition(self, request, pk=None):
        ticket = self.get_object()
        to_stage_id = request.data.get('to_stage_id')
        comment_text = request.data.get('comment')
        assign_to = request.data.get('assign_to')

        try:
            to_stage = WorkflowStage.objects.get(id=to_stage_id)
        except WorkflowStage.DoesNotExist:
            return Response({'detail': 'Stage not found'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from .services import transition_ticket
            ticket = transition_ticket(ticket, to_stage, actor=request.user,
                                       comment=comment_text, assign_to=assign_to)
            return Response(TicketSerializer(ticket, context={'request': request}).data)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        ticket = self.get_object()
        to_user_id = request.data.get('to_user')
        reason = request.data.get('reason', '')

        # lookup user
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            to_user = User.objects.get(id=to_user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

        # create assignment record
        TicketAssignment.objects.create(
            ticket=ticket,
            from_user=ticket.assigned_to,
            to_user=to_user,
            performed_by=request.user,
            reason=reason,
        )

        ticket.assigned_to = to_user
        ticket.save(update_fields=['assigned_to'])

        # activity log
        TicketActivity.objects.create(
            ticket=ticket,
            actor=request.user,
            action='assigned',
            meta={'to': str(to_user.id)}
        )

        # notifications
        from .notifications import notify_assignment
        notify_assignment(ticket, request.user, to_user)

        return Response(TicketSerializer(ticket, context={'request': request}).data)


# -----------------------------
# Comment ViewSet
# -----------------------------
class TicketCommentViewSet(viewsets.ModelViewSet):
    queryset = TicketComment.objects.all()
    serializer_class = CommentSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


# -----------------------------
# Category ViewSet
# -----------------------------
class TicketCategoryViewSet(viewsets.ModelViewSet):
    queryset = TicketCategory.objects.all()
    serializer_class = TicketCategorySerializer


# -----------------------------
# Workflow Stage ViewSet
# -----------------------------
class WorkflowStageViewSet(viewsets.ModelViewSet):
    queryset = WorkflowStage.objects.all()
    serializer_class = WorkflowStageSerializer
