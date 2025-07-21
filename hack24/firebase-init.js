// firebase-init.js
// This file initializes Firebase app, auth, and db once globally.

// IMPORTANT: Replace with your actual Firebase config or rely on __firebase_config
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "AIzaSyDN6_Y4leEo6O2zyqKudJVT61xXuLZ8Wv8", // Your actual API Key
    authDomain: "projex-6b9fe.firebaseapp.com",
    projectId: "projex-6b9fe",
    storageBucket: "projex-6b9fe.firebasestorage.app",
    messagingSenderId: "767445501251",
    appId: "1:767445501251:web:4823e2599efaaf6bb19bf6",
    measurementId: "G-4535BHDHN6"
};

// Declare global Firebase variables (will be attached to window)
window.app = null;
window.auth = null;
window.db = null;

// Declare global Firebase Auth and Firestore functions (will be attached to window)
window.getAuth = null;
window.createUserWithEmailAndPassword = null;
window.signInWithEmailAndPassword = null;
window.signInWithCustomToken = null;
window.onAuthStateChanged = null;
window.signOut = null;

window.getFirestore = null;
window.collection = null;
window.query = null;
window.where = null;
window.orderBy = null;
window.getDocs = null;
window.doc = null;
window.getDoc = null;
window.setDoc = null;
window.updateDoc = null;
window.deleteDoc = null;
window.arrayUnion = null;
window.arrayRemove = null;
window.serverTimestamp = null;

// Global Promise that resolves when Firebase is fully initialized
window.firebaseInitializedPromise = null;

// Function to initialize Firebase and make modules available
async function initializeGlobalFirebase() {
    try {
        const firebaseAppModule = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
        const firebaseAuthModule = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
        const firebaseFirestoreModule = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"); 

        window.app = firebaseAppModule.initializeApp(firebaseConfig);
        
        // Assign Auth functions to window
        window.getAuth = firebaseAuthModule.getAuth;
        window.createUserWithEmailAndPassword = firebaseAuthModule.createUserWithEmailAndPassword;
        window.signInWithEmailAndPassword = firebaseAuthModule.signInWithEmailAndPassword;
        window.signInWithCustomToken = firebaseAuthModule.signInWithCustomToken;
        window.onAuthStateChanged = firebaseAuthModule.onAuthStateChanged;
        window.signOut = firebaseAuthModule.signOut;
        window.auth = window.getAuth(window.app); // Initialize auth instance
        console.log("Firebase Auth functions assigned to window.");

        // Assign Firestore functions to window
        window.getFirestore = firebaseFirestoreModule.getFirestore;
        window.collection = firebaseFirestoreModule.collection;
        window.query = firebaseFirestoreModule.query;
        window.where = firebaseFirestoreModule.where;
        window.orderBy = firebaseFirestoreModule.orderBy;
        window.getDocs = firebaseFirestoreModule.getDocs;
        window.doc = firebaseFirestoreModule.doc;
        window.getDoc = firebaseFirestoreModule.getDoc;
        window.setDoc = firebaseFirestoreModule.setDoc;
        window.updateDoc = firebaseFirestoreModule.updateDoc;
        window.deleteDoc = firebaseFirestoreModule.deleteDoc;
        window.arrayUnion = firebaseFirestoreModule.arrayUnion;
        window.arrayRemove = firebaseFirestoreModule.arrayRemove;
        window.serverTimestamp = firebaseFirestoreModule.serverTimestamp;
        window.db = window.getFirestore(window.app); // Initialize db instance
        console.log("Firebase Firestore functions assigned to window.");


        console.log("Firebase app, auth, and db initialized globally.");

        // Initial sign-in for Canvas environment
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await window.signInWithCustomToken(window.auth, __initial_auth_token);
            console.log("Signed in with custom token provided by Canvas.");
        } else {
            console.warn("No __initial_auth_token provided. Authentication might not work as expected outside Canvas.");
        }
        return true; // Indicate success
    } catch (error) {
        console.error("Critical Error: Failed to initialize global Firebase:", error);
        // Using alert() is generally discouraged in production web apps.
        // showMessageBox("Application failed to start due to a Firebase initialization error. Please check console.", "error");
        return false; // Indicate failure
    }
}

// Assign the initialization promise to the global window object
window.firebaseInitializedPromise = initializeGlobalFirebase();

// Function to show a custom message box (moved here to be globally available immediately)
// This was previously in other scripts, now centralized.
window.showMessageBox = function(message, type = 'info') {
    const messageBox = document.createElement('div');
    messageBox.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        font-family: Arial, sans-serif;
        text-align: center;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    `;
    messageBox.textContent = message;
    document.body.appendChild(messageBox);

    setTimeout(() => {
        messageBox.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        messageBox.style.opacity = '0';
        messageBox.addEventListener('transitionend', () => messageBox.remove());
    }, 3000);
};
