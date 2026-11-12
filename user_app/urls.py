from django.urls import path
from .views import *

urlpatterns = [
    path('register/', RegistrationView.as_view(), name = 'register'),
    path('login/', CustomLoginView.as_view(), name = 'login'),
    path('logout/', LogoutView.as_view(), name = 'logout'),
    path('verify_code/', VerifyCodeView.as_view(), name = 'verify_code'),
    path('', AuthView.as_view(), name = 'auth'),
    path('main/', MainView.as_view(), name = 'main')
]