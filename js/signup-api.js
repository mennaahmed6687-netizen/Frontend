/**
 * signup-api.js - API integration for signup.html
 *
 * Flow:
 *   1. User fills form -> POST /api/Auth/register
 *   2. On success -> redirect to login.html
 *
 * HOW TO USE:
 *   Add just before </body> in signup.html:
 *     <script src="js/api.js"></script>
 *     <script src="js/signup-api.js"></script>
 */

(function () {
    const form = document.getElementById('signupForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            alert('Please fill all fields');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const data = await MustAPI.registerUser(firstName, lastName, email, password);
            console.log('Register response:', data);
            alert('Account created successfully.');
            window.location.href = 'login.html';
        } catch (err) {
            console.error('Register error:', err);
            alert('Registration failed: ' + err.message);
        }
    });
})();
