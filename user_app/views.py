from django.shortcuts import render , redirect
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.views.generic import *
from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth import login
from .models import VerifyCode
from django.conf import settings
from django.core.mail import send_mail
from .forms import *
from django.http import JsonResponse
# Create your views here.

class RegistrationView(CreateView):
    form_class = RegisterForm
    
    def form_valid(self, form):
        user = form.save(commit=False)
        user.is_active = False
        user.save()
        
        verify_code = VerifyCode.objects.create(code = 0, user = user)
        verify_code.generate_code()
        print(user.email)
        send_mail(
            subject="Verify code", 
            message=f"Your code: {verify_code.code}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=True
        )
        self.request.session["email"] = user.email
        
        return JsonResponse({"success": True, "email": user.email})
    
    def form_invalid(self, form):
        return JsonResponse({"success": False, "errors": form.errors})
    
    
class CustomLoginView(LoginView):
    form_class = LoginForm
    def form_valid(self, form):
        user = form.get_user()
        
        if not user.is_active:
            form.add_error("general", "Користувач не активний, пiдтвердiть пошту")
            return self.form_invalid(form)
        login(request = self.request, user=user)
        return JsonResponse({"success": True})
    
    def form_invalid(self, form):
        return JsonResponse({"success": False, "errors": form.errors})
    
    
class VerifyCodeView(FormView):
    form_class = VerifyCodeForm

    def form_valid(self, form: VerifyCodeForm):
        code = form.cleaned_data.get("code")
        verify_code = VerifyCode.objects.filter(code = code).first()
        
        if verify_code and verify_code.is_valid():
            verify_code.user.is_active = True
            verify_code.user.save()
            self.request.session.pop("email")
            verify_code.delete()
            return JsonResponse({"success": True})
        else:
            form.add_error("code", "Такого коду не існує, або його час вичерапно.")
            return self.form_invalid(form)
        
    def form_invalid(self, form):
        return JsonResponse({"success": False, "errors": form.errors})

class AuthView(TemplateView):
    template_name = "user_app/auth.html"

    def get_context_data(self, **kwargs):
        email= self.request.session.get('email')
        current_form = 'register'
        if email:
            user = User.objects.filter(email = email).first()
            if user and not user.is_active:
                current_form = 'verify_code'
            else:
                self.request.session.pop("email")
        
        context = {
            "register_form": RegisterForm(),
            "login_form": LoginForm(),
            "verify_code_form": VerifyCodeForm(),
            "current_form": current_form,
            "email": email
        }
        return context
        
