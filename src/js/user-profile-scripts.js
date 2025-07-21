// user-profile-scripts.js
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
        console.error("Firebase global initialization failed. Cannot proceed with user profile.");
        window.showMessageBox("Application error: Firebase failed to initialize.", "error");
        return;
    }

    // Now Firebase (app, auth, db, and all functions) should be fully available
    if (typeof window.app === 'undefined' || !window.app || typeof window.auth === 'undefined' || !window.auth || typeof window.db === 'undefined' || !window.db) {
        console.error("Firebase core objects (app, auth, db) are still not available after init promise resolved.");
        window.showMessageBox("Application error: Firebase core objects not ready.", "error");
        return;
    }

    let currentUser = null; // To store the authenticated user object

    // Listen for authentication state changes (onAuthStateChanged is global from firebase-init.js)
    window.onAuthStateChanged(window.auth, async (user) => { // Use window.onAuthStateChanged and window.auth
        if (user) {
            currentUser = user;
            console.log("User is signed in:", user.uid);
            await fetchUserProfile(user.uid);
        } else {
            currentUser = null;
            console.log("No user is signed in. Redirecting to signup.");
            window.showMessageBox("You need to be logged in to view this page.", "error"); // Use window.showMessageBox
            setTimeout(() => {
                window.location.href = 'signup.html';
            }, 1500);
        }
    });

    // Get references to profile elements
    const profileFullName = document.getElementById('profileFullName');
    const profileProfession = document.getElementById('profileProfession');
    const profileLocation = document.getElementById('profileLocation');
    const profileHandle = document.getElementById('profileHandle');
    const sidebarUsername = document.getElementById('sidebarUsername'); // For sidebar username

    // Get references to form input fields
    const contactInput = document.getElementById('contact');
    const professionInput = document.getElementById('profession');
    const linkedinInput = document.getElementById('linkedin');
    const githubInput = document.getElementById('github');
    const skillsInput = document.getElementById('skills');
    const profileUpdateForm = document.getElementById('profileUpdateForm');


    // Function to fetch user profile data from Firestore
    async function fetchUserProfile(uid) {
        // Ensure Firestore functions are available globally via window.
        if (!window.db || !window.doc || !window.getDoc) {
            console.warn("Firestore functions not fully initialized. Retrying fetchUserProfile...");
            window.showMessageBox("Database not ready. Please wait a moment.", "info"); // Use window.showMessageBox
            return;
        }
        try {
            const userProfileRef = window.doc(window.db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${uid}/profile`, "userProfile"); // Use window.doc, window.db
            const userProfileSnap = await window.getDoc(userProfileRef); // Use window.getDoc

            if (userProfileSnap.exists()) {
                const data = userProfileSnap.data();
                console.log("User profile data fetched:", data);

                profileFullName.textContent = `${data.firstName || ''} ${data.lastName || ''}`;
                profileProfession.textContent = data.profession || 'Project Manager @XYZ';
                profileLocation.textContent = data.location || 'Location Not Set';
                profileHandle.textContent = data.handle || `@${data.firstName?.toLowerCase() || 'user'}`;

                if (sidebarUsername) {
                    sidebarUsername.textContent = `${data.firstName || 'User'}`;
                }

                contactInput.value = data.contact || '';
                professionInput.value = data.profession || '';
                linkedinInput.value = data.linkedin || '';
                githubInput.value = data.github || '';
                skillsInput.value = data.skills || '';
            } else {
                console.log("No user profile data found for", uid);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            window.showMessageBox("Failed to load your profile data.", "error"); // Use window.showMessageBox
        }
    }

    // Handle profile form submission (Save Changes)
    if (profileUpdateForm) {
        profileUpdateForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Ensure Firebase functions are available globally via window.
            if (!currentUser || !window.db || !window.doc || !window.setDoc) {
                window.showMessageBox("You must be logged in and database ready to save changes.", "error"); // Use window.showMessageBox
                return;
            }

            const updatedData = {
                contact: contactInput.value.trim(),
                profession: professionInput.value.trim(),
                linkedin: linkedinInput.value.trim(),
                github: githubInput.value.trim(),
                skills: skillsInput.value.trim(),
                firstName: profileFullName.textContent.split(' ')[0],
                lastName: profileFullName.textContent.split(' ').slice(1).join(' '),
                email: currentUser.email,
                updatedAt: new Date()
            };

            try {
                const userProfileRef = window.doc(window.db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${currentUser.uid}/profile`, "userProfile"); // Use window.doc, window.db
                await window.setDoc(userProfileRef, updatedData, { merge: true }); // Use window.setDoc
                window.showMessageBox('Profile updated successfully!', 'success'); // Use window.showMessageBox
                await fetchUserProfile(currentUser.uid);
            } catch (error) {
                console.error("Error updating profile:", error);
                window.showMessageBox("Failed to save profile changes.", "error"); // Use window.showMessageBox
            }
        });
    }
});
