from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from .models import Document, DocumentTag, DocumentTagRelation
from .serializers import DocumentSerializer, DocumentCreateSerializer, DocumentTagSerializer

class DocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DocumentCreateSerializer
        return DocumentSerializer
    
    def get_queryset(self):
        queryset = Document.objects.all()
        
        # Filtrage par recherche
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(patient__first_name__icontains=search) |
                Q(patient__last_name__icontains=search)
            )
        
        # Filtrage par type de document
        doc_type = self.request.query_params.get('type', None)
        if doc_type:
            queryset = queryset.filter(document_type=doc_type)
        
        # Filtrage par statut
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        """Retourner le document créé avec le serializer complet (incluant id)."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        document = Document.objects.get(pk=serializer.instance.pk)
        output = DocumentSerializer(document, context=self.get_serializer_context())
        headers = self.get_success_headers(output.data)
        return Response(output.data, status=status.HTTP_201_CREATED, headers=headers)

class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Document.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = DocumentSerializer
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DocumentCreateSerializer
        return DocumentSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def document_stats_view(request):
    """Vue pour les statistiques des documents"""
    total_documents = Document.objects.count()
    processed_documents = Document.objects.filter(ai_processed=True).count()
    pending_documents = Document.objects.filter(status='pending').count()
    
    return Response({
        'total': total_documents,
        'processed': processed_documents,
        'pending': pending_documents
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def document_search_view(request):
    """Vue de recherche avancée des documents"""
    query = request.query_params.get('q', '')
    
    if len(query) < 2:
        return Response({'documents': []})
    
    documents = Document.objects.filter(
        Q(title__icontains=query) |
        Q(description__icontains=query) |
        Q(patient__first_name__icontains=query) |
        Q(patient__last_name__icontains=query)
    )[:10]  # Limiter à 10 résultats
    
    serializer = DocumentSerializer(documents, many=True)
    return Response({'documents': serializer.data})