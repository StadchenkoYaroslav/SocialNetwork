from django.shortcuts import render
from django.views.generic import TemplateView
# Create your views here.
class AuthView(TemplateView):
    template_name = 'user_app/auth.html'

