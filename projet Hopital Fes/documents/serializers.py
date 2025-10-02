from rest_framework import serializers
from .models import Document, DocumentTag, DocumentTagRelation

class DocumentTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTag
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Document
        fields = [
            'id', 'title', 'document_type', 'description',
            'file', 'file_size', 'file_type',
            'status', 'priority',
            'patient', 'patient_name',
            'ai_processed', 'ai_confidence', 'ai_extracted_text', 'ai_findings',
            'quality_score', 'processing_time',
            'doctor', 'doctor_name',
            'created_at', 'updated_at', 'created_by', 'created_by_name',
        ]
        read_only_fields = [
            'id', 'file_size', 'file_type', 'ai_processed', 'ai_confidence',
            'processing_time', 'created_at', 'updated_at', 'created_by', 'patient_name'
        ]

class DocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            'title', 'document_type', 'patient', 'file', 'status', 'priority',
            'description', 'doctor'
        ]

    def create(self, validated_data):
        # Set file_size and file_type automatically
        document = Document(**validated_data)
        if document.file and hasattr(document.file, 'size'):
            document.file_size = document.file.size
        if document.file:
            document.file_type = document.file.file.content_type if hasattr(document.file, 'file') and hasattr(document.file.file, 'content_type') else None
        if document.patient and not document.patient_name:
            document.patient_name = document.patient.get_full_name()
        document.save()
        return document

class DocumentTagRelationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTagRelation
        fields = '__all__'
