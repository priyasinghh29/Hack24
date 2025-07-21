// projshowcase2-scripts.js
// This script now assumes Firebase app, auth, db, and functions are initialized globally by firebase-init.js

document.addEventListener('DOMContentLoaded', async () => {
    // Await the global Firebase initialization promise
    if (typeof window.firebaseInitializedPromise === 'undefined') {
        console.error("firebaseInitializedPromise is not defined. Ensure firebase-init.js is loaded before this script.");
        showMessageBox("Application error: Firebase initialization script missing.", "error");
        return;
    }

    const firebaseInitSuccess = await window.firebaseInitializedPromise;
    if (!firebaseInitSuccess) {
        console.error("Firebase global initialization failed. Cannot proceed with Project Showcase Portal.");
        showMessageBox("Application error: Firebase failed to initialize.", "error");
        return;
    }

    // Now Firebase (app, auth, db, and all functions) should be fully available
    if (typeof app === 'undefined' || !app || typeof auth === 'undefined' || !auth || typeof db === 'undefined' || !db) {
        console.error("Firebase core objects (app, auth, db) are still not available after init promise resolved.");
        showMessageBox("Application error: Firebase core objects not ready.", "error");
        return;
    }

    let currentUser = null; // To store the authenticated user object

    // Function to show a custom message box (reused)
    function showMessageBox(message, type = 'info') {
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
    }

    // Listen for authentication state changes (onAuthStateChanged is global from firebase-init.js)
    // This will trigger fetchProjects once auth state is known
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        console.log("Auth state changed in Project Showcase Portal:", user ? user.uid : "No user");
        fetchProjects(); // Fetch projects after auth state is known
    });

    // Get references to HTML elements
    const searchProjectsBtn = document.querySelector('.search-projects-btn');
    const navButtons = document.querySelectorAll('.projshowcase-navigation button');
    const projectTypeSelect = document.getElementById('project-type');
    const industrySelect = document.getElementById('industry');
    const difficultySelect = document.getElementById('difficulty-level');
    const locationSelect = document.getElementById('location');
    const projectResultsContainer = document.getElementById('projectResults');
    const loadingIndicator = document.getElementById('loadingIndicator');


    // Function to display loading indicator
    function showLoading() {
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (projectResultsContainer) projectResultsContainer.innerHTML = ''; // Clear results while loading
    }

    // Function to hide loading indicator
    function hideLoading() {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }

    // Function to dynamically render project cards
    function renderProjectCards(projects) {
        if (!projectResultsContainer) return;

        projectResultsContainer.innerHTML = ''; // Clear previous results

        if (projects.length === 0) {
            projectResultsContainer.innerHTML = '<p class="no-results-message">No projects found matching your criteria.</p>';
            return;
        }

        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <h3>${project.title || 'Untitled Project'}</h3>
                <p class="description">${project.description || 'No description provided.'}</p>
                <div class="card-actions">
                    <a href="${project.liveDemoLink || '#'}" target="_blank" class="read-more-btn">Live Demo</a>
                    <a href="${project.githubLink || '#'}" target="_blank" class="collaborate-btn">GitHub Repo</a>
                </div>
                <div class="star-repo" data-project-id="${project.id}">
                    <span class="star-icon">${project.isFavorited ? '★' : '⭐'}</span> ${project.isFavorited ? 'Favorited!' : 'Star Repository'}
                </div>
            `;
            projectResultsContainer.appendChild(projectCard);
        });
    }

    // Function to fetch projects from Firestore based on filters
    async function fetchProjects() {
        // Ensure Firestore is fully ready before querying
        if (!db || !collection || !query || !where || !orderBy || !getDocs) {
            console.warn("Firestore functions not fully initialized. Retrying fetchProjects...");
            showMessageBox("Database not ready. Please wait a moment.", "info");
            return;
        }

        showLoading();
        let projectsQueryRef = collection(db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/projects`);
        
        // TEMPORARY DEBUGGING: Fetch ALL projects without filters or ordering
        let finalQuery = query(projectsQueryRef); // Just get everything

        console.log("Fetching projects with query:", finalQuery); // Log the constructed query

        try {
            const snapshot = await getDocs(finalQuery);
            let projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Fetched projects:", projects); // Log the fetched data

            // Mark favorited projects (only if not on 'Favourite' tab)
            if (currentUser) { // Check if currentUser exists before trying to fetch favorites
                const userProfileRef = doc(db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${currentUser.uid}/profile`, "userProfile");
                const userProfileSnap = await getDoc(userProfileRef);
                if (userProfileSnap.exists() && userProfileSnap.data().favorites) {
                    const favoriteProjectIds = userProfileSnap.data().favorites;
                    projects = projects.map(project => ({
                        ...project,
                        isFavorited: favoriteProjectIds.includes(project.id)
                    }));
                }
            }
            
            renderProjectCards(projects);
        } catch (error) {
            console.error("Error fetching projects:", error);
            showMessageBox("Failed to load projects. Please try again.", "error");
            renderProjectCards([]);
        } finally {
            hideLoading();
        }
    }

    // Handle "Search Projects" button click
    if (searchProjectsBtn) {
        searchProjectsBtn.addEventListener('click', () => {
            fetchProjects();
        });
    }

    // Handle filter dropdown changes
    // Temporarily disable these to test the simple query
    /*
    [projectTypeSelect, industrySelect, difficultySelect, locationSelect].forEach(select => {
        if (select) {
            select.addEventListener('change', fetchProjects);
        }
    });
    */

    // Handle navigation tab clicks
    // Temporarily disable these to test the simple query
    /*
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            fetchProjects();
        });
    });
    */

    // Implement "Star Repository" functionality
    if (projectResultsContainer) {
        projectResultsContainer.addEventListener('click', async (event) => {
            const starRepoDiv = event.target.closest('.star-repo');
            if (starRepoDiv && currentUser && updateDoc && arrayUnion && arrayRemove) {
                const projectId = starRepoDiv.dataset.projectId;
                const userProfileRef = doc(db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${currentUser.uid}/profile`, "userProfile");

                try {
                    const userProfileSnap = await getDoc(userProfileRef);
                    let favorites = [];
                    if (userProfileSnap.exists() && userProfileSnap.data().favorites) {
                        favorites = userProfileSnap.data().favorites;
                    }

                    if (favorites.includes(projectId)) {
                        await updateDoc(userProfileRef, {
                            favorites: arrayRemove(projectId)
                        });
                        starRepoDiv.innerHTML = '<span class="star-icon">⭐</span> Star Repository';
                        showMessageBox('Project unfavorited!', 'info');
                    } else {
                        await updateDoc(userProfileRef, {
                            favorites: arrayUnion(projectId)
                        });
                        starRepoDiv.innerHTML = '<span class="star-icon" style="color: gold;">★</span> Favorited!';
                        showMessageBox('Project favorited!', 'success');
                    }
                    // Re-fetch to update the list if on 'Favourite' tab or to reflect changes
                    const activeTab = document.querySelector('.projshowcase-navigation button.active');
                    if (activeTab && activeTab.textContent.trim() === 'Favourite') {
                        fetchProjects(); // Re-fetch to update the favorites list
                    }
                } catch (error) {
                    console.error("Error toggling favorite status:", error);
                    showMessageBox("Failed to update favorite status. Please log in or try again.", "error");
                }
            } else if (starRepoDiv && !currentUser) {
                showMessageBox("Please log in to favorite projects.", "info");
            }
        });
    }

    // Initial fetch of projects will be triggered by onAuthStateChanged
});
