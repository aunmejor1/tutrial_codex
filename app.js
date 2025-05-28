document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const newTaskInput = document.getElementById('new-task');
    const taskList = document.getElementById('task-list');
    const filterSelect = document.getElementById('filter-tasks');
    const statsDiv = document.getElementById('stats');

    // Cargar tareas guardadas
    let tasks;
    try {
        tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    } catch (e) {
        tasks = [];
        localStorage.removeItem("tasks");
    }

    let filter = localStorage.getItem('taskFilter') || 'all';
    filterSelect.value = filter;

    filterSelect.addEventListener('change', () => {
        filter = filterSelect.value;
        localStorage.setItem('taskFilter', filter);
        renderTasks();
    });

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function updateStats() {
        const completedCount = tasks.filter(t => t.completed).length;
        statsDiv.textContent = `Tareas: ${tasks.length} | Completadas: ${completedCount}`;
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const filtered = tasks.filter(task => {
            if (filter === 'completed') return task.completed;
            if (filter === 'active') return !task.completed;
            return true;
        });
        filtered.forEach((task) => {
            const index = tasks.indexOf(task);
            const li = document.createElement('li');
            li.className = 'task-item';

            const span = document.createElement('span');
            span.className = 'task-text' + (task.completed ? ' completed' : '');
            span.textContent = task.text;
            span.addEventListener('click', () => {
                tasks[index].completed = !tasks[index].completed;
                saveTasks();
                renderTasks();
            });
            span.addEventListener('dblclick', () => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = task.text;
                input.className = 'edit-input';
                li.replaceChild(input, span);
                input.focus();

                const finish = () => {
                    const newText = input.value.trim();
                    if (
                        newText &&
                        !tasks.some((t, i) => i !== index && t.text.toLowerCase() === newText.toLowerCase())
                    ) {
                        tasks[index].text = newText;
                        saveTasks();
                    }
                    renderTasks();
                };

                input.addEventListener('blur', finish);
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        finish();
                    } else if (e.key === 'Escape') {
                        renderTasks();
                    }
                });
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', () => {
                if (confirm('¿Eliminar la tarea?')) {
                    tasks.splice(index, 1);
                    saveTasks();
                    renderTasks();
                }
            });

            li.appendChild(span);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });
        updateStats();
    }

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = newTaskInput.value.trim();
        if (text) {
            const exists = tasks.some(
                (task) => task.text.toLowerCase() === text.toLowerCase()
            );
            if (exists) {
                alert('La tarea ya existe.');
                return;
            }
            tasks.push({ text, completed: false });
            saveTasks();
            renderTasks();
            newTaskInput.value = '';
        }
    });

    renderTasks();
});
