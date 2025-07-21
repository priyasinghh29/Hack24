// progress-tracker-scripts.js
// This script now assumes Firebase app, auth, db, and functions are initialized globally by firebase-init.js

document.addEventListener('DOMContentLoaded', async () => {
    // Await the global Firebase initialization promise
    if (typeof window.firebaseInitializedPromise === 'undefined') {
        console.error("firebaseInitializedPromise is not defined. Ensure firebase-init.js is loaded before this script.");
        window.showMessageBox("Application error: Firebase initialization script missing.", "error"); // Use window.showMessageBox
        return;
    }

    const firebaseInitSuccess = await window.firebaseInitializedPromise;
    if (!firebaseInitSuccess) {
        console.error("Firebase global initialization failed. Cannot proceed with progress tracker.");
        window.showMessageBox("Application error: Firebase failed to initialize.", "error"); // Use window.showMessageBox
        return;
    }

    // Now Firebase (app, auth, db, and all functions) should be fully available
    // We'll add a more specific check before attaching listeners
    if (typeof window.app === 'undefined' || !window.app || typeof window.auth === 'undefined' || !window.auth || typeof window.db === 'undefined' || !window.db) {
        console.error("Firebase core objects (app, auth, db) are still not available after init promise resolved.");
        window.showMessageBox("Application error: Firebase core objects not ready.", "error"); // Use window.showMessageBox
        return;
    }

    let currentUser = null; // To store the authenticated user object

    // Get references to HTML elements (these can be outside onAuthStateChanged)
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const todoList = document.getElementById('todo-list');
    const progressBar = document.getElementById('progress');
    const progressPercentageText = document.querySelector('.progress-percentage');

    let tasks = []; // Array to store tasks (now synced with Firestore)


    // Function to fetch and render tasks from Firestore
    async function fetchAndRenderTasks() {
        // This check is still valid here as it's called from onAuthStateChanged
        if (!currentUser || !window.db || !window.collection || !window.query || !window.orderBy || !window.getDocs) {
            console.log("Firestore or current user not ready to fetch tasks. Skipping fetch.");
            todoList.innerHTML = '<p style="text-align: center; color: #777;">Please log in to see your tasks.</p>';
            updateProgressBar();
            return;
        }
        
        try {
            console.log("Fetching tasks for user:", currentUser.uid);
            const tasksCollectionRef = window.collection(window.db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${currentUser.uid}/tasks`);
            const q = window.query(tasksCollectionRef, window.orderBy('createdAt', 'asc'));
            const querySnapshot = await window.getDocs(q);
            
            tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Fetched tasks from Firestore:", tasks);
            renderTasks();
            updateProgressBar();
        } catch (error) {
            console.error("Error fetching tasks from Firestore:", error);
            window.showMessageBox("Failed to load your tasks. Please try again.", "error");
        }
    }

    // Function to render tasks in the UI
    function renderTasks() {
        todoList.innerHTML = ''; // Clear existing list
        if (tasks.length === 0) {
            todoList.innerHTML = '<p style="text-align: center; color: #777;">No tasks yet! Add one above.</p>';
            return;
        }

        tasks.forEach((task) => {
            const listItem = document.createElement('li');
            listItem.className = task.completed ? 'completed' : '';
            listItem.innerHTML = `
                <span class="task-text">${task.text}</span>
                <span class="task-date">${task.date}</span>
                <div class="task-actions">
                            <button class="complete-btn" data-id="${task.id}">${task.completed ? '✅' : '✔️'}</button>
                            <button class="delete-btn" data-id="${task.id}">🗑️</button>
                        </div>
            `;
            todoList.appendChild(listItem);
        });
    }

    // Function to update the progress bar
    function updateProgressBar() {
        if (tasks.length === 0) {
            progressBar.style.width = '0%';
            progressPercentageText.textContent = '0% Complete';
            return;
        }
        const completedTasks = tasks.filter(task => task.completed).length;
        const progress = (completedTasks / tasks.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressPercentageText.textContent = `${Math.round(progress)}% Complete`;
    }

    // Listen for authentication state changes (onAuthStateChanged is global from firebase-init.js)
    window.onAuthStateChanged(window.auth, async (user) => {
        if (user) {
            currentUser = user;
            console.log("User is signed in:", user.uid);
            console.log("Attempting to fetch and render tasks for user:", currentUser.uid);
            
            // --- Attach Event Listeners ONLY when user is authenticated AND Firebase functions are confirmed ready ---
            // This ensures window.db, window.collection, etc. are fully available.
            // Move the check for Firestore functions here, directly before attaching listeners
            if (!window.db || !window.collection || !window.addDoc || !window.serverTimestamp || !window.doc || !window.deleteDoc || !window.updateDoc) {
                console.error("Critical: Firebase Firestore functions not fully available after auth state change. Cannot attach listeners.");
                window.showMessageBox("Application error: Database functions not ready. Please refresh.", "error");
                return;
            }

            await fetchAndRenderTasks(); // Call fetch after the critical check

            // Add Task Functionality
            addTaskBtn.addEventListener('click', async () => {
                console.log("Add Task button clicked.");
                // The pre-check here is now less likely to fail if this code is inside onAuthStateChanged
                if (!currentUser) { // Only check currentUser here, others are guaranteed by outer if
                    console.log("Pre-check failed: currentUser is missing. (Should not happen here)");
                    window.showMessageBox("Please log in and ensure database is ready to add tasks.", "error");
                    return;
                }

                const taskText = taskInput.value.trim();
                const taskDate = dateInput.value;

                if (taskText !== '' && taskDate !== '') {
                    console.log("Attempting to add task:", { text: taskText, date: taskDate, userId: currentUser.uid });
                    try {
                        const tasksCollectionRef = window.collection(window.db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${currentUser.uid}/tasks`);
                        const newTaskRef = await window.addDoc(tasksCollectionRef, {
                            text: taskText,
                            date: taskDate,
                            completed: false,
                            createdAt: window.serverTimestamp(),
                            userId: currentUser.uid
                        });
                        
                        console.log("Task added to Firestore with ID:", newTaskRef.id);
                        tasks.push({ id: newTaskRef.id, text: taskText, date: taskDate, completed: false, createdAt: new Date() }); 
                        
                        taskInput.value = '';
                        dateInput.value = '';
                        renderTasks();
                        updateProgressBar();
                        window.showMessageBox('Task added successfully!', 'success');
                    } catch (error) {
                        console.error("Error adding task to Firestore:", error);
                        window.showMessageBox("Failed to add task. Please try again.", "error");
                    }
                } else {
                    window.showMessageBox('Please enter both a task and a date.', 'error');
                }
            });

            // Handle Complete and Delete actions using event delegation
            todoList.addEventListener('click', async (event) => {
                const target = event.target;
                const taskId = target.dataset.id;

                if (!currentUser || !taskId) { // Only check currentUser and taskId here
                    window.showMessageBox("Please log in or select a valid task.", "error");
                    return;
                }

                const taskDocRef = window.doc(window.db, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/users/${currentUser.uid}/tasks`, taskId);

                if (target.classList.contains('complete-btn')) {
                    console.log("Attempting to complete task:", taskId);
                    try {
                        const taskIndex = tasks.findIndex(task => task.id === taskId);
                        if (taskIndex > -1) {
                            const newCompletedStatus = !tasks[taskIndex].completed;
                            await window.updateDoc(taskDocRef, {
                                completed: newCompletedStatus
                            });
                            tasks[taskIndex].completed = newCompletedStatus;
                            renderTasks();
                            updateProgressBar();
                            window.showMessageBox('Task status updated!', 'success');
                        }
                    } catch (error) {
                        console.error("Error updating task status in Firestore:", error);
                        window.showMessageBox("Failed to update task status. Please try again.", "error");
                    }
                } else if (target.classList.contains('delete-btn')) {
                    console.log("Attempting to delete task:", taskId);
                    try {
                        await window.deleteDoc(taskDocRef);
                        tasks = tasks.filter(task => task.id !== taskId);
                        renderTasks();
                        updateProgressBar();
                        window.showMessageBox('Task deleted successfully!', 'success');
                    } catch (error) {
                        console.error("Error deleting task from Firestore:", error);
                        window.showMessageBox("Failed to delete task. Please try again.", "error");
                    }
                }
            });
            // --- End of Event Listeners ---

        } else {
            currentUser = null;
            console.log("No user is signed in. Redirecting to signup.");
            window.showMessageBox("You need to be logged in to view this page.", "error");
            setTimeout(() => {
                window.location.href = 'signup.html';
            }, 1500);
        }
    });

    // Initial render for empty state until tasks are fetched (or if not logged in)
    renderTasks();
    updateProgressBar();
});
