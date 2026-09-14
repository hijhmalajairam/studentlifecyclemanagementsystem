from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password

class UserSerializer(serializers.ModelSerializer):
    all_roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'additional_roles', 'all_roles', 'phone', 'first_name', 'last_name', 'is_staff', 'dark_mode')

    def get_all_roles(self, obj):
        roles = [obj.role] if obj.role else []
        if isinstance(obj.additional_roles, list):
            roles.extend(obj.additional_roles)
        return list(set(roles))

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'role', 'phone', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data.get('password'))
        return super().create(validated_data)
