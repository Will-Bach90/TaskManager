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


//=======================================================================================================

const projectSocket = new WebSocket(
    'ws://' + window.location.host + '/ws/projects/' 
);

projectSocket.onmessage = function(event) {
    const data = JSON.parse(event.data); 
    console.log("WebSocket message received: ", data);

    if (data.message) {
        const projectData = JSON.parse(data.message); 
        console.log("Parsed project data: ", projectData);

        if (projectData.action === 'deleted') {
            handleProjectDeletion(projectData.id);
        } else if (projectData.action === 'created') {
            handleProjectAddition(projectData);
        }
    }
};

function handleProjectDeletion(projectId) {
    const projectElement = document.getElementById('project-' + projectId);
    if (projectElement) {
        projectElement.remove();
        console.log("Project removed from DOM: ", projectId);
    } else {
        console.warn("Project element not found in DOM: ", projectId); 
    }
}

function handleProjectAddition(projectData) {
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer) {
        const projectElement = document.createElement('div');
        projectElement.className = 'card text-center m-3';
        projectElement.style = 'width: 18rem;';
        projectElement.id = 'project-' + projectData.id;

        const projectName = projectData.name;
        let projectDescription = projectData.description;

        if (typeof projectDescription === 'string' && projectDescription.length > 100) {
            projectDescription = projectDescription.substring(0, 100) + '...';
        }

        const projectDetailUrl = `/projects/${projectData.id}/`;

        projectElement.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">${projectName}</h5>
            <p class="card-text">${projectDescription}</p>
            <a href="${projectDetailUrl}" class="btn btn-primary">More</a>
        </div>
        `;

        projectsContainer.appendChild(projectElement);
        console.log("Project added to DOM: ", projectData.id);
    } else {
        console.warn("Projects container not found in DOM");
    }
}



projectSocket.onclose = function(e) {
    console.error('Project socket closed unexpectedly');
};

function sendMessage(message) {
    projectSocket.send(JSON.stringify({'message': message}));
}







console.log("Room name:", roomName);

const chatSocket = new WebSocket(
    'ws://' + window.location.host + '/ws/chat/' + roomName + '/'
);

chatSocket.onopen = function(e) {
    console.log('Chat socket opened', e);
};

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log("WebSocket received data:", data); 
    if (data.message) {
        updateChatLog(data.author, data.message, data.timestamp);
    }
};

function updateChatLog(author, message, timestamp) {
    const chatLog = document.getElementById('chat-log');
    chatLog.value += `${author}: ${message} (${timestamp})\n`;
    chatLog.scrollTop = chatLog.scrollHeight;
}

document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;
    console.log('Sending message: ', message);
    chatSocket.send(JSON.stringify({'message': message}));
    messageInputDom.value = '';
};

chatSocket.onerror = function(e) {
    console.error('Chat socket encountered error: ', e, 'Closing socket');
    chatSocket.close();
};