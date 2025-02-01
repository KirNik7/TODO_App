const BASE_URL = 'https://todo-app-server-wnkl.onrender.com';

document.getElementById('login-btn').addEventListener('click', async () => {
    
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            window.location.href = 'index.html';
        } else {
            const data = await response.json();
            alert(data.message || 'Login failed.');
        }
    } catch (error) {
        console.error('Error during login:', error);
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
