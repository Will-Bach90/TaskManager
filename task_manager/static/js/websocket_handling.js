const taskSocket = new WebSocket(
    'ws://' + window.location.host + '/ws/tasks/' 
);

taskSocket.onmessage = function(event) {
    const data = JSON.parse(event.data); 
    console.log("WebSocket message received: ", data);

    if (data.message) {
        const taskData = JSON.parse(data.message); 
        console.log("Parsed task data: ", taskData);

        if (taskData.action === 'deleted') {
            handleTaskDeletion(taskData.id);
        } else if (taskData.action === 'created') {
            handleTaskAddition(taskData);
        }
    }
};

function handleTaskDeletion(taskId) {
    const taskElement = document.getElementById('task-' + taskId);
    if (taskElement) {
        taskElement.remove();
        console.log("Task removed from DOM: ", taskId);
    } else {
        console.warn("Task element not found in DOM: ", taskId); 
    }
}

function handleTaskAddition(taskData) {
    const tasksContainer = document.getElementById('tasks-container');
    if (tasksContainer) {
        const taskElement = document.createElement('label');
        taskElement.className = 'list-group-item d-flex gap-3 task';
        taskElement.id = 'task-' + taskData.id;

        const checkedAttribute = taskData.is_completed ? 'checked' : '';

        taskElement.innerHTML = `
            <input class="form-check-input flex-shrink-0" type="checkbox" value="" ${checkedAttribute} style="font-size: 1.375em;">
            <span class="pt-1 form-checked-content">
                <strong>${taskData.title}</strong>
                <small class="d-block text-muted">
                    <svg class="bi me-1" width="1em" height="1em"><use xlink:href="#calendar-event"></use></svg>
                    ${taskData.due_date ? taskData.due_date : 'No due date'}
                </small>
            </span>
            <a href="/tasks/${taskData.id}/delete" class="btn btn-danger">Delete</a>
        `;

        tasksContainer.appendChild(taskElement);
        console.log("Task added to DOM: ", taskData.id);
    } else {
        console.warn("Tasks container not found in DOM");
    }
}



taskSocket.onclose = function(e) {
    console.error('Task socket closed unexpectedly');
};

function sendMessage(message) {
    taskSocket.send(JSON.stringify({'message': message}));
}
