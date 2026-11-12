
from django import forms
from django.contrib.auth.forms import (
    UserCreationForm,
    SetPasswordMixin,
    AuthenticationForm
)
from django.core.exceptions import ValidationError
from .models import User


class RegisterForm(UserCreationForm):
    email = forms.EmailField(
        label="Електронна пошта",
        widget=forms.EmailInput(attrs={
            "placeholder": "you@example.com"
        })
    )

    password1, password2 = SetPasswordMixin.create_password_fields(
        "Пароль",
        "Підтверди пароль"
    )

    class Meta:
        model = User
        fields = ['email']

    def clean_email(self):
        email = self.cleaned_data['email']

        if User.objects.filter(email__iexact=email).exists():
            raise ValidationError(
                "Користувач із такою електронною поштою вже зареєстрований."
            )

        return email


class LoginForm(AuthenticationForm):
    username = forms.EmailField(
        label="Електронна пошта",
        widget=forms.EmailInput(attrs={
            "placeholder": "you@example.com"
        })
    )


class VerifyCodeForm(forms.Form):
    code = forms.CharField(
        max_length=6,
        required=True,
        widget=forms.TextInput(),
        label="Код підтвердження"
    )
