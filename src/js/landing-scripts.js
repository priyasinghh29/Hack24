// landing-scripts.js
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
        console.error("Firebase global initialization failed. Cannot proceed with Project Showcase Portal.");
        window.showMessageBox("Application error: Firebase failed to initialize.", "error");
        return;
    }

    // Now Firebase (app, auth, db, and all functions) should be fully available
    if (typeof window.app === 'undefined' || !window.app || typeof window.auth === 'undefined' || !window.auth) { // db is not used directly here, but auth is
        console.error("Firebase core objects (app, auth) are still not available after init promise resolved.");
        window.showMessageBox("Application error: Firebase core objects not ready.", "error");
        return;
    }

    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const headerLogo = document.querySelector('header .logo');
    const logoutButtonSidebar = document.getElementById('logoutButtonSidebar');

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    if (headerLogo) {
        headerLogo.style.cursor = 'pointer';
        headerLogo.addEventListener('click', toggleSidebar);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            hideSidebar();
        });
    });

    // Handle logout button click
    if (logoutButtonSidebar) {
        logoutButtonSidebar.addEventListener('click', async () => {
            if (!window.auth || !window.signOut) { // Use window.auth, window.signOut
                console.error("Firebase Auth functions not available for logout.");
                window.showMessageBox("Authentication service not ready. Please try again.", "error"); // Use window.showMessageBox
                return;
            }
            try {
                await window.signOut(window.auth); // Use window.signOut, window.auth
                window.showMessageBox('Logged out successfully!', 'success'); // Use window.showMessageBox
                setTimeout(() => {
                    window.location.href = 'signup.html'; // Redirect to signup/login page
                }, 1500);
            } catch (error) {
                console.error("Error logging out:", error);
                window.showMessageBox('Failed to log out. Please try again.', 'error'); // Use window.showMessageBox
            }
        });
    }

    // Adjust sidebar visibility on initial load based on screen size
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'landing.html' || currentPage === '') {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('hidden');
            sidebar.classList.remove('visible');
        } else {
            sidebar.classList.add('hidden');
            sidebar.classList.remove('visible');
        }
    } else {
        sidebar.classList.add('hidden');
        sidebar.classList.remove('visible');
    }

    // Adjust sidebar visibility on window resize
    window.addEventListener('resize', () => {
        const sidebar = document.getElementById('sidebar');
        const currentPageOnResize = window.location.pathname.split('/').pop();

        if (currentPageOnResize === 'landing.html' || currentPageOnResize === '') {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('hidden');
                sidebar.classList.remove('visible');
            } else {
                if (!sidebar.classList.contains('visible')) {
                    sidebar.classList.add('hidden');
                }
            }
        } else {
            if (window.innerWidth > 768) {
                sidebar.classList.add('hidden');
                sidebar.classList.remove('visible');
            } else {
                if (!sidebar.classList.contains('visible')) {
                    sidebar.classList.add('hidden');
                }
            }
        }
    });

    // Function to toggle sidebar visibility (moved outside DOMContentLoaded for global access if needed)
    function toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('visible');
        } else {
            sidebar.classList.toggle('hidden');
        }
    }

    // Function to hide the sidebar (moved outside DOMContentLoaded for global access if needed)
    function hideSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('visible');
        } else {
            sidebar.classList.add('hidden');
        }
    }
});
