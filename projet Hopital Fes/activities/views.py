from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Activity, SystemLog
from .serializers import ActivitySerializer, SystemLogSerializer

class ActivityListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer
    
    def get_queryset(self):
        queryset = Activity.objects.all()
        
        # Filtrage par utilisateur (si pas admin, voir seulement ses activités)
        if not self.request.user.is_staff:
            queryset = queryset.filter(user=self.request.user)
        
        # Filtrage par action
        action = self.request.query_params.get('action', None)
        if action:
            queryset = queryset.filter(action=action)
        
        # Filtrage par sévérité
        severity = self.request.query_params.get('severity', None)
        if severity:
            queryset = queryset.filter(severity=severity)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ActivityDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Activity.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer

class SystemLogListView(generics.ListAPIView):
    queryset = SystemLog.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = SystemLogSerializer
    
    def get_queryset(self):
        queryset = SystemLog.objects.all()
        
        # Filtrage par action
        action = self.request.query_params.get('action', None)
        if action:
            queryset = queryset.filter(action=action)
        
        # Filtrage par sévérité
        severity = self.request.query_params.get('severity', None)
        if severity:
            queryset = queryset.filter(severity=severity)
        
        return queryset.order_by('-created_at')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activity_stats_view(request):
    """Vue pour les statistiques des activités"""
    total_activities = Activity.objects.count()
    user_activities = Activity.objects.filter(user=request.user).count()
    
    # Activités par action
    activities_by_action = {}
    for action, _ in Activity.ACTION_CHOICES:
        count = Activity.objects.filter(action=action).count()
        if count > 0:
            activities_by_action[action] = count
    
    return Response({
        'total': total_activities,
        'user_activities': user_activities,
        'by_action': activities_by_action
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recent_activities_view(request):
    """Vue pour les activités récentes"""
    limit = int(request.query_params.get('limit', 10))
    
    activities = Activity.objects.all()[:limit]
    serializer = ActivitySerializer(activities, many=True)
    
    return Response({'activities': serializer.data})