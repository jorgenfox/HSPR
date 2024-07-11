document.addEventListener('DOMContentLoaded', () => {
    const errorDiv = document.getElementById('error-message');

    // Function to display error messages in the error div
    function showError(message) {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'flex';
        }
    }

    // Function to clear error messages
    function clearError() {
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    }

    // Function to show a success popup
    function showSuccessPopup(message) {
        alert(message);
    }

    // Function to validate email format
    function validateEmail(email) {
        const emailCheck = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,6}$/;
        return emailCheck.test(String(email).toLowerCase());
    }

    // Function to validate password strength
    function validatePassword(password) {
        if (password.length < 8) {
            showError("Parool peab olema vähemalt 8 tähemärki!");
            return false;
        } else if (!/[a-z]/i.test(password)) {
            showError("Parool peab sisaldama vähemalt ühte tähte!");
            return false;
        } else if (!/[0-9]/.test(password)) {
            showError("Parool peab sisaldama vähemalt ühte numbrit!");
            return false;
        }
        return true;
    }

    // Function to check if passwords match
    function doPasswordsMatch(password, confirmPassword) {
        if (password !== confirmPassword) {
            showError("Salasõnad ei ühti. Palun proovige uuesti.");
            return false;
        }
        return true;
    }

    // Function to check if email exists
    async function checkEmailExists(email) {
        try {
            const response = await fetch(`/hspr/api/user/check-email?email=${encodeURIComponent(email)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data.exists; // Assuming the response is { exists: true/false }
        } catch (error) {
            console.error('Error:', error);
            showError('Tekkis probleem e-maili kontrollimisel. Palun proovi hiljem uuesti.');
            return false;
        }
    }

    // Adding event listener to signup form submission
    const signupForm = document.querySelector('form[action="/hspr/api/user/signup"]');
    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Prevent default form submission
            clearError(); // Clear previous errors

            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;
            const confirmPassword = document.querySelector('#confirm_password').value;

            // Validate email
            if (!validateEmail(email)) {
                showError('Palun sisesta õige e-mail');
                return;
            }

            // Validate password
            if (!validatePassword(password)) {
                return;
            }

            // Validate password confirmation
            if (!doPasswordsMatch(password, confirmPassword)) {
                return;
            }

            // Check if the email exists
            const emailExists = await checkEmailExists(email);
            if (emailExists) {
                showError('See e-mail on juba registreeritud. Palun kasuta teist e-maili aadressi.');
                return;
            }

            // Proceed with signup
            try {
                const response = await fetch('/hspr/api/user/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, confirm_password: confirmPassword })
                });

                const result = await response.json();
                if (result.success) {
                    showSuccessPopup(result.message);
                    window.location.href = result.redirectUrl;
                } else {
                    showError(result.error);
                }
            } catch (error) {
                showError('Registreerumisel tekkis viga. Palun proovi hiljem uuesti.');
            }
        });
    }

    // Adding event listener to login form submission
    const loginForm = document.querySelector('form[action="/hspr/api/user/login"]');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault(); // Prevent default form submission
            clearError(); // Clear previous errors

            const email = document.querySelector('#email').value;
            const password = document.querySelector('#password').value;

            // Validate email
            if (!validateEmail(email)) {
                showError('Palun sisesta oma e-mail');
                return;
            }

            // Validate password
            if (password === '') {
                showError('Palun sisesta oma parool');
                return;
            }

            // Attempt to log in
            try {
                const response = await fetch('/hspr/api/user/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const result = await response.json();
                if (result.success) {
                    window.location.href = result.redirectUrl;
                } else {
                    showError(result.error); // Display server-side error message
                }
            } catch (error) {
                showError('Tekkis viga sisselogimisel. Palun proovi uuesti.');
            }
        });
    }
});
