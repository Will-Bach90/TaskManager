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

// chatSocket.onmessage = function(e) {
//     const data = JSON.parse(e.data);
//     console.log("WebSocket received data:", data); 
//     if (data.message) {
//         const isCurrentUser = data.author === currentUsername;
//         updateChatLog(data.author, data.message, data.timestamp, isCurrentUser);
//     }
// };

chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log("WebSocket received data:", data);

    if (data.action === "message") {
        const isCurrentUser = data.author === currentUsername;
        updateChatLog(data.author, data.message, data.timestamp, isCurrentUser);
    } else if (data.action === "edit") {
        const messageElement = document.querySelector(`[data-message-id="${data.message_id}"] .message-badge`);
        if (messageElement) {
            messageElement.textContent = data.new_content;
        } else {
            console.warn(`Message with ID ${data.message_id} not found.`);
        }
    } else if (data.action === "delete") {
        const messageContainer = document.querySelector(`[data-message-id="${data.message_id}"]`);
        if (messageContainer) {
            messageContainer.remove();
        } else {
            console.warn(`Message with ID ${data.message_id} not found.`);
        }
    }
};

// function updateChatLog(author, message, timestamp) {
//     const chatLog = document.getElementById('chat-log');
//     console.log(`${author}: ${message} (${timestamp})\n`)
//     chatLog.value += `${author}: ${message} (${timestamp})\n`;
//     chatLog.scrollTop = chatLog.scrollHeight;
// }

function forceRepaint(element) {
    element.style.display = 'none';
    element.offsetHeight; // Trigger reflow
    element.style.display = '';
}
function updateChatLog(author, message, timestamp, isCurrentUser) {
    const chatLog = document.getElementById("chat-log");

    const messageContainer = document.createElement("div");
    messageContainer.className = isCurrentUser ? "message-right" : "message-left";
    messageContainer.setAttribute("data-message-id", `${timestamp}-${author}`); // Unique ID if message ID isn't available

    const messageDetails = `
        <p style="margin-top: 10pt;">
            <b style="font-size: 11pt; padding-left: 5px !important;">${author}</b><br>
            <span id="msg-date" style="padding-right: 5px;">${timestamp}:</span><br>
            <span class="message-badge ${isCurrentUser ? "text-bg-success msgRight" : "text-bg-secondary msgLeft"}">
                ${message}
            </span>
        </p>
        ${isCurrentUser ? `
        <div class="message-controls" style="display: none;">
            <button class="btn btn-sm btn-primary edit-btn" data-message-id="${timestamp}-${author}">Edit</button>
            <button class="btn btn-sm btn-danger delete-btn" data-message-id="${timestamp}-${author}">Delete</button>
        </div>
        ` : ""}
    `;
    messageContainer.innerHTML = messageDetails;
    messageContainer.innerHTML = messageDetails;
    chatLog.appendChild(messageContainer);

    // Scroll to bottom
    chatLog.scrollTop = chatLog.scrollHeight;

    // const chatLog = document.getElementById('chat-log');

    // const messageContainer = document.createElement('div');
    // messageContainer.className = isCurrentUser ? 'message-right' : 'message-left';
    // const messageDetails = document.createElement('p');
    // messageDetails.style.marginTop = '10pt';

    // const authorElement = document.createElement('b');
    // authorElement.textContent = author;
    // authorElement.style.fontSize = '11pt';
    // authorElement.style.paddingLeft = '5px';
    // messageDetails.appendChild(authorElement);

    // const timestampElement = document.createElement('span');
    // timestampElement.id = 'msg-date';
    // timestampElement.textContent = `${timestamp}`;
    // authorElement.style.paddingRight = '5px';
    // messageDetails.appendChild(timestampElement);

    // messageDetails.appendChild(document.createElement('br'));

    // const messageBadge = document.createElement('span');
    // messageBadge.className = `message-badge ${isCurrentUser ? 'text-bg-success msgRight' : 'text-bg-secondary msgLeft'}`;
    // messageBadge.textContent = message;
    // messageDetails.appendChild(messageBadge);

    // messageContainer.appendChild(messageDetails);
    // chatLog.appendChild(messageContainer);
    // chatLog.scrollTop = chatLog.scrollHeight;


    // forceRepaint(chatLog);
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

const chatLog = document.getElementById('chat-log');

window.addEventListener('beforeunload', function () {
    localStorage.setItem('chatLogScrollTop', chatLog.scrollTop);
});

window.onload = function () {
    const savedScrollTop = localStorage.getItem('chatLogScrollTop');
    if (savedScrollTop !== null) {
        chatLog.scrollTop = savedScrollTop;
    } else {
        chatLog.scrollTop = chatLog.scrollHeight;
    }
};

const inputBox = document.getElementById('chat-message-input');

inputBox.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});


document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function () {
            const messageId = this.getAttribute('data-message-id');
            if (confirm('Are you sure you want to delete this message?')) {
                deleteMessage(messageId);
            }
        });
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', function () {
            const messageId = this.getAttribute('data-message-id');
            const messageContent = this.closest('.chat-message').querySelector('.message-badge').textContent;
            editMessage(messageId, messageContent);
        });
    });
});

function deleteMessage(messageId) {
    fetch(`/chat/message/${messageId}/delete/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCsrfToken(), 
        },
    })
        .then(response => {
            if (response.ok) {
                document.querySelector(`[data-message-id="${messageId}"]`).remove();
            } else {
                alert('Failed to delete message.');
            }
        })
        .catch(err => console.error('Error deleting message:', err));
}

function editMessage(messageId, currentContent) {
    const newContent = prompt('Edit your message:', currentContent);
    if (newContent !== null) {
        fetch(`/chat/message/${messageId}/edit/`, {
            method: 'PUT',
            headers: {
                'X-CSRFToken': getCsrfToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: newContent }),
        })
            .then(response => {
                if (response.ok) {
                    document.querySelector(`[data-message-id="${messageId}"] .message-badge`).textContent = newContent;
                } else {
                    alert('Failed to edit message.');
                }
            })
            .catch(err => console.error('Error editing message:', err));
    }
}

function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}
