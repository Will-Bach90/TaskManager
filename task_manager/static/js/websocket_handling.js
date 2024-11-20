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
const cU = currentUsername;
const cUId = currentUserId;
chatSocket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log("WebSocket received data:", data);
    const { author, author_id, content, msg_id, timestamp} = data.message;

    if (data.action === "send") {
        const isCurrentUser = author === cU;
        // updateChatLog(data.author, data.message, data.timestamp, isCurrentUser, currentUserId, data.author_id, data.msg_id);
        updateChatLog(author, content, timestamp, isCurrentUser, cUId, author_id, msg_id);
    } else if (data.action === "edit") {
        const messageElement = document.querySelector(`[data-message-id="${data.message_id}"] .message-badge`);
        if (messageElement) {
            messageElement.textContent = data.new_content;
        } else {
            console.warn(`Message with ID ${data.message_id} not found.`);
        }
    } else if (data.action === "delete") {
        const messageElement = document.querySelector(`[data-message-id="${msg_id}"]`);
        if (messageElement) {
            messageElement.remove();
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
function updateChatLog(author, message, timestamp, isCurrentUser, currentUserId, authorId, messageId) {
    const chatLog = document.getElementById("chat-log");

    const messageContainer = document.createElement("div");
    messageContainer.className = `msg ${isCurrentUser ? "message-right" : "message-left"}`;
    messageContainer.setAttribute("data-message-id", messageId);
    messageContainer.setAttribute("data-is-own-message", isCurrentUser ? "true" : "false");
    
    const messageDetails = `
        <p style="margin-top: 10pt;">
            <b style="font-size: 11pt; padding-left: 5px;">${author}</b>
            <span id="msg-date" style="padding-right: 5px;">${timestamp}</span><br>
            <button id="message-container" type="button" class="btn message-badge ${isCurrentUser ? "btn-success msgRight" : "btn-secondary msgLeft"} position-relative" 
                data-author-id="${authorId}" 
                data-user-id="${currentUserId}" 
                data-message-id="${messageId}">
                ${message}
            </button>
        </p>
    `;

    messageContainer.innerHTML = messageDetails;
    chatLog.appendChild(messageContainer);

    chatLog.scrollTop = chatLog.scrollHeight;
    const button = messageContainer.querySelector('.btn.message-badge');
    addHoverEventListener(button);
}

function addHoverEventListener(button) {
    button.addEventListener('mouseover', () => {
        const isOwnMessage = button.getAttribute('data-author-id') === button.getAttribute('data-user-id');
        if (isOwnMessage && !button.querySelector('.delete-btn')) {
            const deleteButton = document.createElement('a');
            deleteButton.href = '#';
            deleteButton.className = 'delete-btn position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary';
            deleteButton.setAttribute('data-message-id', button.getAttribute('data-message-id'));
            deleteButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                </svg>
                <span class="visually-hidden">Delete message</span>
            `;
            deleteButton.addEventListener('click', function (e) {
                e.preventDefault();
                const messageId = this.getAttribute('data-message-id');
                if (confirm('Are you sure you want to delete this message?')) {
                    deleteMessage(messageId);
                }
            });
            button.appendChild(deleteButton);
        }
    });

    button.addEventListener('mouseleave', () => {
        const deleteButton = button.querySelector('.delete-btn');
        if (deleteButton) {
            deleteButton.remove(); // Remove the delete button when the mouse leaves
        }
    });
}




document.querySelector('#chat-message-submit').onclick = function(e) {

    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;
    chatSocket.send(JSON.stringify({
        action: "send",
        message: message
    }));

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

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

document.addEventListener("DOMContentLoaded", () => {
    const messageButtons = document.querySelectorAll('#chat-log .btn.message-badge');

    messageButtons.forEach((button) => {
        button.addEventListener('mouseover', () => {
            const isOwnMessage = button.getAttribute('data-author-id') === button.getAttribute('data-user-id') ;
            if (isOwnMessage && !button.querySelector('.delete-btn')) {
                const deleteButton = document.createElement('a');
                deleteButton.href = '#';
                deleteButton.className = 'delete-btn position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary';
                deleteButton.setAttribute('data-message-id', button.getAttribute('data-message-id'));
                deleteButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                    </svg>
                    <span class="visually-hidden">Delete message</span>
                `;
                deleteButton.addEventListener('click', function () {
                    const messageId = this.getAttribute('data-message-id');
                    if (confirm('Are you sure you want to delete this message?')) {
                        deleteMessage(messageId);
                    }
                });
                button.appendChild(deleteButton);
            }
        });

        // Add mouseleave event
        button.addEventListener('mouseleave', () => {
            const deleteButton = button.querySelector('.delete-btn');
            if (deleteButton) {
                deleteButton.remove(); // Remove the delete button when the mouse leaves
            }
        });
    });
});


// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

function deleteMessage(messageId) {
    fetch(`/message/${messageId}/delete/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCsrfToken(), 
        },
    })
        .then(response => {
            if (response.ok) {
                const messageElement = document.querySelector(`[data-message-id="${msg_id}"]`);
                if (messageElement) {
                    messageElement.remove();
                } else {
                    console.log("No such message");
                }
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
