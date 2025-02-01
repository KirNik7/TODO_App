const BASE_URL = 'http://127.0.0.1:5000';

document.getElementById('register-btn').addEventListener('click', async () => {

    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            alert('Registration successful. Please log in.');
            window.location.href = 'login.html';
        } else {
            const data = await response.json();
            alert(data.message || 'Registration failed.');
        }
    } catch (error) {
        console.error('Error during registration:', error);
    }
});

document.addEventListener('DOMContentLoaded', () => {

    const themeToggleButton = document.getElementById('theme-toggle');

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }

    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });
});