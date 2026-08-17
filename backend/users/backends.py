from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from django.db.models import Q

class EmailOrUsernameModelBackend(ModelBackend):
    """
    Custom authentication backend to allow users to log in using either their username or email.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        UserModel = get_user_model()
        
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
            
        try:
            # Query the database by username OR email
            user = UserModel.objects.get(Q(username=username) | Q(email__iexact=username))
        except UserModel.DoesNotExist:
            # Run the default password hasher once to reduce timing attacks
            UserModel().set_password(password)
            return None
            
        if user.check_password(password) and self.user_can_authenticate(user):
            return user
            
        return None
