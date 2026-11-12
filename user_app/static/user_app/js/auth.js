const registerForm = document.querySelector('#registerForm');
const loginForm = document.querySelector('#loginForm');
const verifyForm = document.querySelector('#verificateForm');

const openRegister = document.querySelector('#openRegister');
const openLogin = document.querySelector('#openLogin');

// Знаходимо зовнішні білі картки (батьківські контейнери форм)
const authCard = registerForm?.closest('div');
const verifyCard = verifyForm?.closest('div');

function showForm(formToShow) {
    [registerForm, loginForm, verifyForm].forEach((form) => {
        form?.classList.remove('opened-form');
    });

    if (formToShow === verifyForm) {
        if (authCard && authCard !== verifyCard) authCard.style.display = 'none';
        if (verifyCard) verifyCard.style.display = '';
        verifyForm?.classList.add('opened-form');
    } else {
        if (verifyCard && authCard !== verifyCard) verifyCard.style.display = 'none';
        if (authCard) authCard.style.display = '';
        formToShow?.classList.add('opened-form');
    }
}

// Залишаємо при старті відкритою тільки реєстрацію, а картку підтвердження ховаємо
showForm(registerForm);

function clearFieldError(fieldName) {
    if (!registerForm) return;

    const errorElement = registerForm.querySelector(`[data-error-for="${fieldName}"]`);
    const input = registerForm.querySelector(`[name="${fieldName}"]`);

    if (errorElement) errorElement.textContent = '';
    if (input) input.classList.remove('input-error');
}

function showFieldError(fieldName, errors) {
    if (!registerForm) return;

    const errorElement = registerForm.querySelector(`[data-error-for="${fieldName}"]`);
    const input = registerForm.querySelector(`[name="${fieldName}"]`);

    if (!errorElement) return;

    const messages = Array.isArray(errors)
        ? errors.map(error => (typeof error === 'string' ? error : error.message))
        : [errors];

    errorElement.textContent = messages.join(' ');
    if (input) input.classList.add('input-error');
}

function clearRegisterErrors() {
    ['email', 'password1', 'password2'].forEach(clearFieldError);
}



registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearRegisterErrors();

    const submitButton = registerForm.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;

    try {
        const response = await fetch(registerForm.action, {
            method: 'POST',
            body: new FormData(registerForm),
        });

        const result = await response.json();

        if (result.success) {
            showForm(verifyForm);
            return;
        }

        const errors = result.errors ?? {};

        Object.entries(errors).forEach(([fieldName, messages]) => {
            if (['email', 'password1', 'password2'].includes(fieldName)) {
                showFieldError(fieldName, messages);
            }
        });
    } catch (error) {
        alert('Не удалось отправить форму. Проверь подключение и попробуй ещё раз.');
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
});

registerForm?.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
        clearFieldError(input.name);

        if (input.name === 'password1' || input.name === 'password2') {
            clearFieldError('password2');
        }
    });
});



openLogin?.addEventListener('click', () => showForm(loginForm));
openRegister?.addEventListener('click', () => showForm(registerForm));

document.querySelector('#backToRegister')?.addEventListener('click', () => {
    showForm(registerForm);
});



function handleSubmit(form, onSuccess) {
    if (!form) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
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
                    .map(error => (typeof error === 'string' ? error : error.message))
                    .join(' ')
            );
        } catch (error) {
            alert('Не удалось отправить форму. Проверь подключение.');
        }
    });
}

// handleSubmit залишаємо ТІЛЬКИ для логіну (щоб не дублювати запити реєстрації та коду)
handleSubmit(loginForm, () => {
    window.location.href = '/main/';
});



document.querySelectorAll('.eye-toggle').forEach((button) => {
    button.addEventListener('click', () => {
        const input = button.closest('.password-container')?.querySelector('input');
        const image = button.querySelector('img');

        if (!input || !image) return;

        const showPassword = input.type === 'password';
        input.type = showPassword ? 'text' : 'password';

        image.src = showPassword
            ? '/static/user_app/images/open-eye.png'
            : '/static/user_app/images/eye.png';

        button.classList.toggle('is-hidden', !showPassword);
        button.setAttribute(
            'aria-label',
            showPassword ? 'Приховати пароль' : 'Показати пароль'
        );
    });
});



const codeInputs = [...document.querySelectorAll('.code-digit')];
const combinedCode = document.querySelector('#verificationCode');

function updateCode() {
    if (!combinedCode) return;

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
        const digits = event.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, 6);

        if (!digits) return;
        event.preventDefault();

        digits.split('').forEach((digit, i) => {
            if (codeInputs[i]) codeInputs[i].value = digit;
        });

        updateCode();
        codeInputs[Math.min(digits.length, 5)]?.focus();
    });
});

verifyForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateCode();

    if (!combinedCode || combinedCode.value.length !== 6) {
        codeInputs.find((input) => !input.value)?.focus();
        return;
    }

    try {
        const response = await fetch(verifyForm.action, {
            method: 'POST',
            body: new FormData(verifyForm),
        });

        const result = await response.json();

        if (!result.success) {
            alert(
                Object.values(result.errors ?? {})
                    .flat()
                    .map(error => (typeof error === 'string' ? error : error.message))
                    .join(' ')
            );
            return;
        }

        verifyForm.reset();
        showForm(loginForm);
    } catch (error) {
        alert('Не удалось проверить код. Попробуй ещё раз.');
    }
});
