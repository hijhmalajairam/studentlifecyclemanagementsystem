import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import APIKeyConfiguration
from groq import Groq

class ConfigView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        keys = APIKeyConfiguration.objects.filter(service_name="GROQ")
        history = []
        current_key = None
        for k in keys:
            masked = f"gsk_...{k.api_key[-4:]}" if len(k.api_key) > 4 else "gsk_..."
            hist_item = {
                "id": k.id,
                "masked_key": masked,
                "updated_at": k.updated_at,
                "is_active": k.is_active,
                "updated_by": k.updated_by.email if k.updated_by else "System"
            }
            history.append(hist_item)
            if k.is_active:
                current_key = masked
                
        return Response({"current_key": current_key, "history": history})

    def post(self, request):
        api_key = request.data.get("api_key")
        if not api_key:
            return Response({"detail": "api_key is required"}, status=400)
            
        APIKeyConfiguration.objects.filter(service_name="GROQ").update(is_active=False)
        APIKeyConfiguration.objects.create(
            service_name="GROQ",
            api_key=api_key,
            is_active=True,
            updated_by=request.user if request.user.is_authenticated else None
        )
        return Response({"detail": "API Key updated successfully"})

class ChatView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        message = request.data.get("message")
        if not message:
            return Response({"response": "Please provide a message."}, status=400)
            
        key_config = APIKeyConfiguration.objects.filter(service_name="GROQ", is_active=True).first()
        if not key_config:
            return Response({"response": "AI Assistant is currently offline (API key missing)."}, status=503)
            
        try:
            client = Groq(api_key=key_config.api_key)
            role = getattr(request.user, 'role', 'User')
            name = getattr(request.user, 'first_name', 'Student')
            
            system_prompt = f"You are a helpful AI Assistant for Veritas Grove University. You are talking to a {role} named {name}. Keep responses concise, friendly, and professional. Help them navigate the university ERP system."
            
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=1024,
            )
            
            response_text = completion.choices[0].message.content
            return Response({"response": response_text})
        except Exception as e:
            return Response({"response": f"Error connecting to AI: {str(e)}"}, status=200)
