from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q
from django.conf import settings
from .models import Patient, PatientDocument
from .serializers import PatientSerializer, PatientCreateSerializer, PatientDocumentSerializer

class PatientListCreateView(generics.ListCreateAPIView):
    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PatientCreateSerializer
        return PatientSerializer
    
    def get_queryset(self):
        queryset = Patient.objects.all()
        
        # Filtrage par recherche
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(patient_id__icontains=search) |
                Q(email__icontains=search)
            )
        
        # Filtrage par statut
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            # En mode développement, utiliser un utilisateur par défaut
            from users.models import User
            default_user = User.objects.filter(is_superuser=True).first()
            if default_user:
                serializer.save(created_by=default_user)
            else:
                serializer.save()

class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Patient.objects.all()
    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]
    serializer_class = PatientSerializer
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PatientCreateSerializer
        return PatientSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_stats_view(request):
    """Vue pour les statistiques des patients"""
    total_patients = Patient.objects.count()
    active_patients = Patient.objects.filter(status='active').count()
    inactive_patients = Patient.objects.filter(status='inactive').count()
    
    return Response({
        'total': total_patients,
        'active': active_patients,
        'inactive': inactive_patients
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_search_view(request):
    """Vue de recherche avancée des patients"""
    query = request.query_params.get('q', '')
    
    if len(query) < 2:
        return Response({'patients': []})
    
    patients = Patient.objects.filter(
        Q(first_name__icontains=query) |
        Q(last_name__icontains=query) |
        Q(patient_id__icontains=query) |
        Q(email__icontains=query) |
        Q(phone_number__icontains=query)
    )[:10]  # Limiter à 10 résultats
    
    serializer = PatientSerializer(patients, many=True)
    return Response({'patients': serializer.data})