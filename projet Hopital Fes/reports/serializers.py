from rest_framework import serializers
from .models import Report, ReportComment, ReportTemplate
from patients.serializers import PatientSerializer
from users.serializers import UserSerializer

class ReportCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    
    class Meta:
        model = ReportComment
        fields = ['id', 'report', 'author', 'author_name', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at', 'author']

class ReportTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportTemplate
        fields = '__all__'

class ReportSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.get_full_name', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    comments = ReportCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'title', 'report_type', 'patient', 'patient_name',
            'report_date', 'status', 'priority', 'summary', 'ai_insights',
            'doctor', 'doctor_name', 'reviewed_by', 'reviewed_by_name',
            'created_at', 'updated_at', 'created_by', 'created_by_name', 'comments'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'title', 'report_type', 'patient', 'report_date', 'status',
            'priority', 'summary', 'ai_insights', 'doctor', 'reviewed_by'
        ]
