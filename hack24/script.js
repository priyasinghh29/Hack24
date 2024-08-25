 document.addEventListener('DOMContentLoaded', function() {
    const tasksList = document.getElementById('todo-list');
    const progress = document.getElementById('progress');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');

    function updateProgress() {
        const totalTasks = tasksList.children.length;
        const completedTasks = document.querySelectorAll('.task:checked').length;
        const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
        progress.style.width = progressPercentage + '%';
        progress.textContent = Math.round(progressPercentage) + '%';
    }

    function addTask(taskText, deadline) {
        const li = document.createElement('li');
        li.innerHTML = `<input type="checkbox" class="task" /> 
                        <span>${taskText}</span> 
                        <span>- Deadline: ${deadline}</span> 
                        <button class="edit-btn">Edit</button>`;

        tasksList.appendChild(li);
        updateProgress();

      
        li.querySelector('.task').addEventListener('change', updateProgress);

      
        const editBtn = li.querySelector('.edit-btn');
        editBtn.addEventListener('click', function() {
            const newTaskText = prompt("Edit Task:", taskText);
            if (newTaskText) {
                li.querySelector('span').textContent = newTaskText; 
            }
        });
    }

    addTaskBtn.addEventListener('click', function() {
        const taskText = taskInput.value.trim();
        const deadline = dateInput.value;

        if (taskText) {
            addTask(taskText, deadline);
            taskInput.value = ''; 
            dateInput.value = ''; 
        } else {
            alert("Please enter a task.");
        }
    });
});

 