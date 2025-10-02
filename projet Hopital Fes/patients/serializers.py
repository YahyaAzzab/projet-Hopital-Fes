from rest_framework import serializers
from .models import Patient, PatientDocument
from users.serializers import UserSerializer

class PatientSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'first_name', 'last_name', 'date_of_birth',
            'gender', 'phone_number', 'email', 'address', 'city', 'blood_type',
            'emergency_contact', 'insurance_provider', 'allergies', 'medical_history',
            'occupation', 'marital_status', 'notes', 'status', 'last_visit',
            'created_at', 'updated_at', 'created_by', 'created_by_name'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

class PatientCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'patient_id', 'first_name', 'last_name', 'date_of_birth',
            'gender', 'phone_number', 'email', 'address', 'city', 'blood_type',
            'emergency_contact', 'insurance_provider', 'allergies', 'medical_history',
            'occupation', 'marital_status', 'notes', 'status'
        ]

class PatientDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientDocument
        fields = '__all__'
