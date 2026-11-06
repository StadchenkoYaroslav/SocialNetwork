const registerForm = document.querySelector('#registerForm');
const loginForm = document.querySelector('#loginForm');
const verifyForm = document.querySelector('#verificateForm');

const openRegister = document.querySelector('#openRegister');
const openLogin = document.querySelector('#openLogin');

function showForm(formToShow) {
    [registerForm, loginForm, verifyForm].forEach((form) => {
        form.classList.remove('opened-form');
    });

    formToShow.classList.add('opened-form');
}

openLogin?.addEventListener('click', () => showForm(loginForm));
openRegister?.addEventListener('click', () => showForm(registerForm));

async function handleSubmit(form, onSuccess) {
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
        });

        const result = await response.json();

        if (result.success) {
            onSuccess(result);
            return;
        }

        alert(
            Object.values(result.errors ?? {})
                .flat()
                .join(' ')
        );
    });
}

handleSubmit(registerForm, () => showForm(verifyForm));

handleSubmit(verifyForm, () => {
    verifyForm.reset();
    showForm(loginForm);
    alert('Почта подтверждена. Теперь войдите в аккаунт.');
});



// Показати/сховати пароль після натискання на іконку ока
document.querySelectorAll('.eye-toggle').forEach((button) => {
    button.addEventListener('click', () => {
        const input = button.closest('.password-container').querySelector('input');
        const showPassword = input.type === 'password';

        input.type = showPassword ? 'text' : 'password';
        button.classList.toggle('is-hidden', !showPassword);
        button.setAttribute(
            'aria-label',
            showPassword ? 'Скрыть пароль' : 'Показать пароль'
        );
    });
});

// Перехід між полями вводу коду підтвердження після введення цифри
const codeInputs = [...document.querySelectorAll('.code-digit')];
const combinedCode = document.querySelector('#verificationCode');

function updateCode() {
    combinedCode.value = codeInputs.map((input) => input.value).join('');
}

codeInputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(-1);
        updateCode();

        if (input.value && codeInputs[index + 1]) {
            codeInputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace' && !input.value && codeInputs[index - 1]) {
            codeInputs[index - 1].focus();
        }
    });

    input.addEventListener('paste', (event) => {
        const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!digits) return;

        event.preventDefault();
        digits.split('').forEach((digit, i) => {
            if (codeInputs[i]) codeInputs[i].value = digit;
        });
        updateCode();
        codeInputs[Math.min(digits.length, 5)].focus();
    });
});

// После успешной проверки переключиться на авторизацию
document.querySelector('#verificateForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateCode();

    if (combinedCode.value.length !== 6) {
        codeInputs.find((input) => !input.value)?.focus();
        return;
    }

    const form = event.currentTarget;
    const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
    });
    const result = await response.json();

    if (!result.success) {
        alert(Object.values(result.errors ?? {}).flat().join(' '));
        return;
    }

    document.querySelectorAll('#registerForm, #loginForm, #verificateForm')
        .forEach((item) => item.classList.remove('opened-form'));

    document.querySelector('#loginForm').classList.add('opened-form');
    alert('Пошту підтверджено. Тепер увійдіть в акаунт.');
});

// Кнопка «Назад» открывает регистрацию
document.querySelector('#backToRegister')?.addEventListener('click', () => {
    document.querySelector('#verificateForm').classList.remove('opened-form');
    document.querySelector('#registerForm').classList.add('opened-form');
});