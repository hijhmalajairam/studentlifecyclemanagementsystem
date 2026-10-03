from django.db import models
from django.conf import settings

class APIKeyConfiguration(models.Model):
    service_name = models.CharField(max_length=50, default='GROQ')
    api_key = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-updated_at']
