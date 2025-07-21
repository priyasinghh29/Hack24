// scripts.js
// This script now assumes Firebase app, auth, db, and functions are initialized globally by firebase-init.js

document.addEventListener('DOMContentLoaded', async () => {
    // Await the global Firebase initialization promise
    if (typeof window.firebaseInitializedPromise === 'undefined') {
        console.error("firebaseInitializedPromise is not defined. Ensure firebase-init.js is loaded before this script.");
        window.showMessageBox("Application error: Firebase initialization script missing.", "error");
        return;
    }

    const firebaseInitSuccess = await window.firebaseInitializedPromise;
    if (!firebaseInitSuccess) {
        console.error("Firebase global initialization failed. Cannot proceed with authentication.");
        window.showMessageBox("Application error: Firebase failed to initialize.", "error");
        return;
    }

    // Now Firebase (app, auth, db, and all functions) should be fully available
    if (typeof window.app === 'undefined' || !window.app || typeof window.auth === 'undefined' || !window.auth || typeof window.db === 'undefined' || !window.db) {
        console.error("Firebase core objects (app, auth, db) are still not available after init promise resolved.");
        window.showMessageBox("Application error: Firebase core objects not ready.", "error");
        return;
    }

    // Get references to the HTML elements
    const signupButton = document.getElementById('signupButton');
    const loginButton = document.getElementById('loginButton');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    // Get email and password input fields
    const signupEmailInput = document.getElementById('signupEmail');
    const signupPasswordInput = document.getElementById('signupPassword');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');


    // Function to show the signup form and activate the signup button
    function showSignupForm() {
        signupForm.style.display = 'flex';
        loginForm.style.display = 'none';

        signupButton.classList.add('active');
        loginButton.classList.remove('active');
    }

    // Function to show the login form and activate the login button
    function showLoginForm() {
        signupForm.style.display = 'none';
        loginForm.style.display = 'flex';

        loginButton.classList.add('active');
        signupButton.classList.remove('active');
    }

    // Add event listeners to the buttons for switching forms
    signupButton.addEventListener('click', (event) => {
        event.preventDefault();
        showSignupForm();
    });

    loginButton.addEventListener('click', (event) => {
        event.preventDefault();
        showLoginForm();
    });

    // Handle signup form submission
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = signupEmailInput.value.trim();
        const password = signupPasswordInput.value.trim();
        const firstName = signupForm.querySelector('input[placeholder="First name"]').value.trim();
        const lastName = signupForm.querySelector('input[placeholder="Last name"]').value.trim();

        if (!email || !password || !firstName || !lastName) {
            window.showMessageBox('Please fill in all fields.', 'error');
            return;
        }

        const submitButton = signupForm.querySelector('.signup-button');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Signing up...';
        submitButton.disabled = true;

        try {
            // Create user with email and password
            const userCredential = await window.createUserWithEmailAndPassword(window.auth, email, password); // Use window.createUserWithEmailAndPassword, window.auth
            const user = userCredential.user;

            // Store additional user data in Firestore
            await window.setDoc(window.doc(window.db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${user.uid}/profile`, "userProfile"), { // Use window.setDoc, window.doc, window.db
                firstName: firstName,
                lastName: lastName,
                email: email,
                createdAt: new Date()
            });

            window.showMessageBox('Signup successful! Redirecting to dashboard...', 'success'); // Use window.showMessageBox

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'landing.html';
            }, 1500);

        } catch (error) {
            console.error("Signup error:", error);
            let errorMessage = "Signup failed. Please try again.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email already in use. Please try logging in or use a different email.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password is too weak. Please use at least 6 characters.';
            }
            window.showMessageBox(errorMessage, 'error'); // Use window.showMessageBox
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = loginEmailInput.value.trim();
        const password = loginPasswordInput.value.trim();

        if (!email || !password) {
            window.showMessageBox('Please enter your email and password.', 'error'); // Use window.showMessageBox
            return;
        }

        const submitButton = loginForm.querySelector('.login-button');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Logging in...';
        submitButton.disabled = true;

        try {
            await window.signInWithEmailAndPassword(window.auth, email, password); // Use window.signInWithEmailAndPassword, window.auth
            window.showMessageBox('Login successful! Redirecting to dashboard...', 'success'); // Use window.showMessageBox

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'landing.html';
            }, 1500);

        } catch (error) {
            console.error("Login error:", error);
            let errorMessage = "Login failed. Please check your credentials.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Invalid email or password.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address.';
            }
            window.showMessageBox(errorMessage, 'error'); // Use window.showMessageBox
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });


    // Initialize the page: show the signup form by default when the page loads
    showSignupForm();
});
