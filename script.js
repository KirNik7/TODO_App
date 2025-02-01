const BASE_URL = 'https://todo-app-server-wnkl.onrender.com';

async function fetchBoards() {
    try {
        const response = await fetch(`${BASE_URL}/boards`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch boards: ${response.status} ${response.statusText}`);
            return;
        }

        const boards = await response.json();
        if (!Array.isArray(boards)) {
            throw new Error('Unexpected response format');
        }

        const boardsList = document.getElementById('boards-list');
        boardsList.innerHTML = '';
        const boardSelect = document.getElementById('board-select');
        boardSelect.innerHTML = '<option value="" disabled selected>Select a Board</option>';

        boards.forEach(board => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${board.name}
                <button onclick="deleteBoard(${board.id})">Delete</button>
            `;
            boardsList.appendChild(li);

            const option = document.createElement('option');
            option.value = board.id;
            option.textContent = board.name;
            boardSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching boards:', error);
    }
}

async function fetchTasks(boardId) {
    const sortBy = document.getElementById('task-sort').value;
    const filterStatus = document.getElementById('task-filter').value;

    try {
        const response = await fetch(`${BASE_URL}/tasks?board_id=${boardId}&sort_by=${sortBy}&status=${filterStatus}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch tasks: ${response.status} ${response.statusText}`);
            alert('Failed to fetch tasks. Please try again.');
            return;
        }

        const tasks = await response.json();
        const tasksList = document.getElementById('tasks-list');
        tasksList.innerHTML = '';

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <span style="text-decoration: ${task.completed ? 'line-through' : 'none'}">
                        ${task.title} - Priority: ${task.priority || 'None'} - ${task.due_date || 'No Due Date'}
                    </span>
                    <button onclick="toggleDescription(${task.id})">Show Description</button>
                </div>
                <div id="description-${task.id}" style="display: none; margin-top: 10px; padding: 5px; border-left: 2px solid #ccc;">
                    <strong>Description:</strong> ${task.description || 'No description provided.'}
                </div>
                <button onclick="toggleTaskCompletion(${task.id}, ${!task.completed})">
                    Mark as ${task.completed ? 'Incomplete' : 'Complete'}
                </button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            `;
            tasksList.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        alert('An error occurred while fetching tasks. Please try again.');
    }
}

function toggleDescription(taskId) {
    const descriptionDiv = document.getElementById(`description-${taskId}`);
    descriptionDiv.style.display = descriptionDiv.style.display === 'none' ? 'block' : 'none';
}

async function toggleTaskCompletion(taskId, completed) {
    try {
        await fetch(`${BASE_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ completed })
        });

        const boardId = document.getElementById('board-select').value;

        const status = completed ? 'выполнено' : 'в работе';
        await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });

        fetchTasks(boardId);
    } catch (error) {
        console.error('Error toggling task completion:', error);
    }
}

async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await fetch(`${BASE_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const boardId = document.getElementById('board-select').value;
            fetchTasks(boardId);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }
}

async function deleteBoard(boardId) {
    if (confirm('Are you sure you want to delete this board?')) {
        try {
            await fetch(`${BASE_URL}/boards/${boardId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            fetchBoards();
            document.getElementById('tasks-list').innerHTML = '';
        } catch (error) {
            console.error('Error deleting board:', error);
        }
    }
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        await fetch(`${BASE_URL}/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status: newStatus })
        });
        const boardId = document.getElementById('board-select').value;
        fetchTasks(boardId);
    } catch (error) {
        console.error('Error updating task status:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const createBoardBtn = document.getElementById('create-board-btn');
    const createTaskBtn = document.getElementById('create-task-btn');
    const boardSelect = document.getElementById('board-select');
    const themeToggleButton = document.getElementById('theme-toggle');

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }

    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    });

    createBoardBtn.addEventListener('click', async () => {
        const boardName = document.getElementById('board-name').value;
        if (boardName.trim()) {
            try {
                const response = await fetch(`${BASE_URL}/boards`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ name: boardName })
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error creating board:', errorData.message);
                    alert('Failed to create board. Please try again.');
                    return;
                }
    
                document.getElementById('board-name').value = '';
                fetchBoards();
            } catch (error) {
                console.error('Network error while creating board:', error);
                alert('An error occurred. Please try again.');
            }
        }
    });

    createTaskBtn.addEventListener('click', async () => {
        const boardId = boardSelect.value;
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const dueDate = document.getElementById('task-due-date').value;
        const priority = document.getElementById('task-priority').value;

        if (boardId && title.trim()) {
            try {
                const response = await fetch(`${BASE_URL}/tasks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        board_id: boardId,
                        title,
                        description,
                        due_date: dueDate || null,
                        priority,
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error creating task:', errorData.message);
                    alert('Failed to create task. Please try again.');
                    return;
                }

                fetchTasks(boardId);
            } catch (error) {
                console.error('Network error while creating task:', error);
                alert('An error occurred. Please try again.');
            }
        }
    });


    boardSelect.addEventListener('change', () => {
        const boardId = boardSelect.value;
        fetchTasks(boardId);
    });

    document.getElementById('task-sort').addEventListener('change', () => {
        const boardId = boardSelect.value;
        fetchTasks(boardId);
    });

    document.getElementById('task-filter').addEventListener('change', () => {
        const boardId = boardSelect.value;
        fetchTasks(boardId);
    });

    fetchBoards();
});

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'register.html';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/user-info`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('user-email').textContent = `Logged in as: ${data.email}`;
            document.getElementById('logout-btn').style.display = 'block';
        } else {
            localStorage.removeItem('token');
            window.location.href = 'register.html';
        }
    } catch (error) {
        console.error('Error validating token:', error);
        localStorage.removeItem('token');
        window.location.href = 'register.html';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});
