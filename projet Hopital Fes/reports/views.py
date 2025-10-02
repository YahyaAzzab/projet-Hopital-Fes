from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from .models import Report, ReportComment, ReportTemplate
from .serializers import ReportSerializer, ReportCreateSerializer, ReportCommentSerializer
from .forms import ReportForm
from patients.models import Patient
from users.models import User

class ReportListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReportCreateSerializer
        return ReportSerializer
    
    def get_queryset(self):
        queryset = Report.objects.all()
        
        # Filtrage par recherche
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(summary__icontains=search) |
                Q(patient__first_name__icontains=search) |
                Q(patient__last_name__icontains=search)
            )
        
        # Filtrage par type de rapport
        report_type = self.request.query_params.get('type', None)
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        
        # Filtrage par statut
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-report_date')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Report.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = ReportSerializer
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ReportCreateSerializer
        return ReportSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_stats_view(request):
    """Vue pour les statistiques des rapports"""
    total_reports = Report.objects.count()
    completed_reports = Report.objects.filter(status='completed').count()
    pending_reports = Report.objects.filter(status='pending').count()
    
    return Response({
        'total': total_reports,
        'completed': completed_reports,
        'pending': pending_reports
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_search_view(request):
    """Vue de recherche avancée des rapports"""
    query = request.query_params.get('q', '')
    
    if len(query) < 2:
        return Response({'reports': []})
    
    reports = Report.objects.filter(
        Q(title__icontains=query) |
        Q(summary__icontains=query) |
        Q(patient__first_name__icontains=query) |
        Q(patient__last_name__icontains=query)
    )[:10]  # Limiter à 10 résultats
    
    serializer = ReportSerializer(reports, many=True)
    return Response({'reports': serializer.data})

# Vues frontend pour les rapports
@login_required
def report_add_view(request):
    """Vue pour ajouter un nouveau rapport"""
    if request.method == 'POST':
        form = ReportForm(request.POST)
        if form.is_valid():
            report = form.save(commit=False)
            report.created_by = request.user
            report.save()
            messages.success(request, 'Rapport créé avec succès!')
            return redirect('reports')
    else:
        form = ReportForm()
    
    # Récupérer les patients actifs pour le formulaire
    patients = Patient.objects.filter(status='active')
    
    context = {
        'form': form,
        'patients': patients,
        'report_types': Report.TYPE_CHOICES,
        'status_choices': Report.STATUS_CHOICES,
        'priority_choices': Report.PRIORITY_CHOICES,
    }
    
    return render(request, 'reports/report_add.html', context)