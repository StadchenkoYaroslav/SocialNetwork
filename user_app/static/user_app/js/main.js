const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const loginButton = document.querySelector('#login-button');
const registerButton = document.querySelector('#register-button');

loginButton.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
});

registerButton.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});