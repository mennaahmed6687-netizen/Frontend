/**
 * login-api.js  –  API integration for login.html
 * Replaces the hardcoded credential check with a real POST /api/Auth/login call.
 *
 * HOW TO USE:
 *   Add the following two <script> tags to login.html just before </body>
 *     <script src="js/api.js"></script>
 *     <script src="js/login-api.js"></script>
 *   Then remove (or keep but it will be overridden) the inline <script> block.
 */

(function () {
    const form = document.getElementById('loginForm');
    if (!form) return; // Safety: only run on login page

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            alert('Please fill all fields');
            return;
        }

        try {
            const data = await MustAPI.loginUser(email, password);
            console.log('Login response:', data);
            alert('Login successful ✅');
            window.location.href = 'index.html';
        } catch (err) {
            console.error('Login error:', err);
            alert('Login failed: ' + err.message);
        }
    });
})();
