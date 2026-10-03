from django.urls import path
from .views import ConfigView, ChatView

urlpatterns = [
    path('config/', ConfigView.as_view(), name='ai-config'),
    path('chat/', ChatView.as_view(), name='ai-chat'),
]
