from rest_framework import serializers
from .models import Activity, SystemLog
from users.serializers import UserSerializer

class ActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Activity
        fields = [
            'id', 'user', 'user_name', 'action', 'description', 'severity',
            'details', 'content_type', 'object_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class SystemLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = SystemLog
        fields = [
            'id', 'user', 'user_name', 'action', 'description', 'severity',
            'details', 'ip_address', 'user_agent', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
