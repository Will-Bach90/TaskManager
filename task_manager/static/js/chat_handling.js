console.log("Room name:", roomName);

const chatSocket = new WebSocket(
    'ws://' + window.location.host + '/ws/rooms/' + roomName + '/'
);

chatSocket.onopen = function(e) {
    console.log('Chat socket opened', e);
};

const cU = currentUsername;
const cUId = currentUserId;
chatSocket.onmessage = function (e) {
    if (e.data === "ping") {
        console.log("Ping received, sending pong");
        chatSocket.send("pong");
    } else {
        const data = JSON.parse(e.data);
        console.log("WebSocket received data:", data);
        const { author, author_id, content, msg_id, timestamp} = data.message;

        if (data.action === "send") {
            const isCurrentUser = author === cU;
            updateChatLog(author, content, timestamp, isCurrentUser, cUId, author_id, msg_id);
            const chatLog = document.querySelector('#chat-log');
            chatLog.scrollTop = chatLog.scrollHeight;
        } else if (data.action === "edit") {
            const msgP = document.querySelector(`[data-message-id="${msg_id}"]`);
            if (msgP) {
                const button = msgP.querySelector('.message-badge');
                if (button) {
                    button.innerHTML = content;
                } else {
                    console.error('Button not found inside parent container.');
                }

                const chatLog = document.querySelector('#chat-log');

                chatLog.scrollTop = chatLog.scrollHeight;
                // }
            } else {
                console.error('Message container not found for message ID:', messageId);
            }
        } else if (data.action === "delete") {
            const messageElement = document.querySelector(`[data-message-id="${msg_id}"]`);
            if (messageElement) {
                messageElement.remove();
            } 
        }
    }
};

function forceRepaint(element) {
    element.style.display = 'none';
    element.offsetHeight; 
    element.style.display = '';
}
function updateChatLog(author, message, timestamp, isCurrentUser, currentUserId, authorId, messageId) {
    const chatLog = document.getElementById("chat-log");

    const messageContainer = document.createElement("div");
    messageContainer.className = `msg ${isCurrentUser ? "message-right" : "message-left"}`;
    messageContainer.setAttribute("data-message-id", messageId);
    messageContainer.setAttribute("data-is-own-message", isCurrentUser ? "true" : "false");

    const rawTimestamp = timestamp;
    const formattedTimestamp = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(rawTimestamp));
    
    const messageDetails = `
        <p style="margin-top: 10pt;">
            <b style="font-size: 11pt; padding-left: 5px;">${author}</b><br>
            <button id="message-container" type="button" class="btn message-badge ${isCurrentUser ? "btn-success msgRight" : "btn-secondary msgLeft"} position-relative" 
                data-author-id="${authorId}" 
                data-user-id="${currentUserId}" 
                data-message-id="${messageId}">
                ${message}
            </button><br>
            <span id="msg-date" style="padding-right: 5px;">${formattedTimestamp}</span>
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
        if (isOwnMessage && !button.querySelector('.add-btn')) {
            const dropdownButton = document.createElement('div');
            dropdownButton.className = 'add-btn position-absolute top-0 start-100 translate-middle dropstart';
            dropdownButton.setAttribute('data-message-id', button.getAttribute('data-message-id'));
            dropdownButton.innerHTML = `
                    <button class="btn btn-sm btn-secondary badge bg-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                        </svg>
                    </button>
                    <ul class="dropdown-menu options-menu">
                    <li>
                        <a class="dropdown-item edit-btn" href="#">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item copy-btn" href="#">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                            </svg>
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item del-btn" href="#">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                            </svg>
                        </a>
                    </li>
                </ul>
            `;

            button.appendChild(dropdownButton);
            const copyBtn = button.querySelector('.copy-btn');
            copyBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const msgContent = button.textContent;
                copyTextToClipboard(msgContent);
            });
            const deleteBtn = button.querySelector('.del-btn');
            deleteBtn.setAttribute('data-message-id', button.getAttribute('data-message-id'));
            deleteBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const messageId = this.getAttribute('data-message-id');


                const confirmCancelToast = document.createElement('div');
                confirmCancelToast.className = 'toast-container p-3 top-50 start-50 translate-middle';
                // confirmCancelToast.ariaRoleDescription = "alert";
                // confirmCancelToast.ariaLive = "assertive";
                // confirmCancelToast.ariaAtomic = "true";
                confirmCancelToast.innerHTML = `
                    <div class="toast fade show">
                    <div class="toast-header">
                    Are you sure you want to delete this message?
                    </div>
                    <div class="toast-body">
                        <div class="mt-2 pt-2">
                            <button type="button" class="btn btn-primary btn-sm confirm-delete">Ok</button>
                            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="toast">Cancel</button>
                        </div>
                    </div>
                    </div>
                `;

                
                const chatbox = document.querySelector('#chat-page');
                chatbox.appendChild(confirmCancelToast);
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(confirmCancelToast);
                toastBootstrap.show();
                const confirmDelete = chatbox.querySelector('.confirm-delete');
                confirmDelete.addEventListener('click', function (e){
                    e.preventDefault();
                    chatbox.removeChild(confirmCancelToast);
                    deleteMessage(messageId);
                });

            });

            const editBtn = button.querySelector('.edit-btn');
            editBtn.setAttribute('data-message-id', button.getAttribute('data-message-id'));
            editBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const messageId = this.getAttribute('data-message-id');
                console.log(messageId);
                button.parentElement.parentElement.classList.add('w-75');
                button.classList.add('w-100');
                const msgContent = button.textContent;
                button.textContent = "";
                const newTextArea = document.createElement('div');
                newTextArea.className = 'form-floating';
                newTextArea.style = "margin: -10px;";
                newTextArea.innerHTML = `
                    <textarea class="form-control" placeholder="${msgContent}" id="floatingTextarea2" style="height: 100px;">${msgContent.trim()}</textarea>
                        <label for="floatingTextarea2">New Comment</label>
                    <div class="d-grid gap-1 d-md-flex justify-content-md-end mt-1">
                        <button class="btn btn-sm btn-secondary new-msg-save" type="button">Save</button>
                        <button class="btn btn-sm btn-dark new-msg-cancel" type="button">Cancel</button>
                      </div>
                `;
                button.appendChild(newTextArea);
                button.classList.remove('btn-success');
                button.classList.add('btn-light');

                const cancelBtn = button.querySelector('.new-msg-cancel');
                cancelBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    button.removeChild(newTextArea);
                    button.textContent = msgContent;
                    button.classList.remove('btn-light');
                    button.classList.add('btn-success');
                    button.parentElement.parentElement.classList.remove('w-75');
                    button.classList.remove('w-100');
                });

                const saveBtn = button.querySelector('.new-msg-save');
                saveBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const newMsgContent = newTextArea.querySelector('#floatingTextarea2').value;
                    button.removeChild(newTextArea);
                    button.classList.remove('btn-light');
                    button.classList.add('btn-success');
                    button.parentElement.parentElement.classList.remove('w-75');
                    button.classList.remove('w-100');
                    editMessage(messageId, msgContent, newMsgContent);
                });
            });
        }

    });

    button.addEventListener('mouseleave', () => {
        const deleteButton = button.querySelector('.delete-btn');
        if (deleteButton) {
            deleteButton.remove(); // Remove the delete button when the mouse leaves
        }
        const dropdown = button.querySelector('.add-btn');
        if (dropdown) {
                dropdown.remove();
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
            if (isOwnMessage && !button.querySelector('.add-btn')) {
                const dropdownButton = document.createElement('div');
                dropdownButton.className = 'add-btn position-absolute top-0 start-100 translate-middle dropstart';
                dropdownButton.setAttribute('data-message-id', button.getAttribute('data-message-id'));
                dropdownButton.innerHTML = `
                        <button class="btn btn-sm btn-secondary badge bg-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                            </svg>
                        </button>
                        <ul class="dropdown-menu options-menu">
                            <li>
                                <a class="dropdown-item edit-btn" href="#">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
                                    </svg>
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item copy-btn" href="#">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                                    </svg>
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item del-btn" href="#">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
                                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                                    </svg>
                                </a>
                            </li>
                        </ul>
                `;
                button.appendChild(dropdownButton);

                const copyBtn = button.querySelector('.copy-btn');
                copyBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const msgContent = button.textContent;
                    copyTextToClipboard(msgContent);
                });

                const deleteBtn = button.querySelector('.del-btn');
                deleteBtn.setAttribute('data-message-id', button.getAttribute('data-message-id'));
                deleteBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const messageId = this.getAttribute('data-message-id');

                    const confirmCancelToast = document.createElement('div');
                    confirmCancelToast.className = 'toast-container p-3 top-50 start-50 translate-middle';
                    confirmCancelToast.innerHTML = `
                        <div class="toast fade show">
                        <div class="toast-header">
                        Are you sure you want to delete this message?
                        </div>
                        <div class="toast-body">
                            <div class="mt-2 pt-2">
                                <button type="button" class="btn btn-primary btn-sm confirm-delete">Ok</button>
                                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="toast">Cancel</button>
                            </div>
                        </div>
                        </div>
                    `;
                    const chatbox = document.querySelector('#chat-page');
                    chatbox.appendChild(confirmCancelToast);
                    const toastBootstrap = bootstrap.Toast.getOrCreateInstance(confirmCancelToast);
                    toastBootstrap.show();
                    const confirmDelete = chatbox.querySelector('.confirm-delete');
                    confirmDelete.addEventListener('click', function (e){
                        e.preventDefault();
                        chatbox.removeChild(confirmCancelToast);
                        deleteMessage(messageId);
                    });
                });

                const editBtn = button.querySelector('.edit-btn');
                editBtn.setAttribute('data-message-id', button.getAttribute('data-message-id'));
                editBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    const messageId = this.getAttribute('data-message-id');
                    button.parentElement.parentElement.classList.add('w-75');
                    button.classList.add('w-100');
                    console.log(messageId);
                    const msgContent = button.textContent;
                    button.textContent = "";
                    const newTextArea = document.createElement('div');
                    newTextArea.className = 'form-floating';
                    newTextArea.style = "margin: -10px;";
                    newTextArea.innerHTML = `
                        <textarea class="form-control" placeholder="${msgContent}" id="floatingTextarea2" style="height: 100px;">${msgContent.trim()}</textarea>
                            <label for="floatingTextarea2">New Comment</label>
                        <div class="d-grid gap-1 d-md-flex justify-content-md-end mt-1">
                            <button class="btn btn-sm btn-secondary new-msg-save" type="button">Save</button>
                            <button class="btn btn-sm btn-dark new-msg-cancel" type="button">Cancel</button>
                          </div>
                    `;
                    button.appendChild(newTextArea);
                    button.classList.remove('btn-success');
                    button.classList.add('btn-light');

                    const cancelBtn = button.querySelector('.new-msg-cancel');
                    cancelBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        button.removeChild(newTextArea);
                        button.textContent = msgContent;
                        button.classList.remove('btn-light');
                        button.classList.add('btn-success');
                        button.parentElement.parentElement.classList.remove('w-75');
                        button.classList.remove('w-100');
                    });

                    const saveBtn = button.querySelector('.new-msg-save');
                    saveBtn.addEventListener('click', function (e) {
                        e.preventDefault();
                        const newMsgContent = newTextArea.querySelector('#floatingTextarea2').value;
                        button.removeChild(newTextArea);
                        button.classList.remove('btn-light');
                        button.classList.add('btn-success');
                        button.parentElement.parentElement.classList.remove('w-75');
                        button.classList.remove('w-100');
                        editMessage(messageId, msgContent, newMsgContent);
                    });
                });
            }
        });

        // Add mouseleave event
        button.addEventListener('mouseleave', () => {
            const deleteButton = button.querySelector('.delete-btn');
            if (deleteButton) {
                deleteButton.remove(); // Remove the delete button when the mouse leaves
            }
            const dropdown = button.querySelector('.add-btn');
            if (dropdown) {
                    dropdown.remove();
            }
        });
    });
});


// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

function deleteMessage(messageId) {
    fetch(`/rooms/message/${messageId}/delete/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCsrfToken(), 
        },
    })
        .then(response => {
            if (response.ok) {
                const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
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

function editMessage(messageId, currentContent, newContent) {
    if (newContent !== null) {
        fetch(`/rooms/message/${messageId}/edit/`, {
            method: 'PUT',
            headers: {
                'X-CSRFToken': getCsrfToken(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: newContent }),
        })
            .then(response => {
                if (response.ok) {
                    const msgP = document.querySelector(`[data-message-id="${messageId}"]`);
                    if (msgP) {
    
                        // Locate the button element specifically
                        const button = msgP.querySelector('.message-badge');
                        if (button) {
    
                            clearTextAndKeepHTML(button);
                            button.innerHTML = newContent + button.innerHTML;
                            // location.reload();
                        } else {
                            console.error('Button not found inside parent container.');
                        }
    
                        // Restore scroll position
                        const chatLog = document.querySelector('#chat-log');
                        const savedScrollTop = localStorage.getItem('chatLogScrollTop');
                        if (savedScrollTop !== null) {
                            chatLog.scrollTop = savedScrollTop;
                        } else {
                            chatLog.scrollTop = chatLog.scrollHeight;
                        }
                    } else {
                        console.error('Message container not found for message ID:', messageId);
                    }
                } else {
                    alert('Failed to edit message.');
                }
                return response.json();
            })
            .then(data => {
                console.log(data); 
                console.log(data.edit_time); 
            })
            .catch(err => console.error('Error editing message:', err));
    }
}

function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

function removeTextButKeepHTML(element) {
    if (!element) return;

    Array.from(element.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            node.remove();
        }
    });
}

function clearTextAndKeepHTML(element) {
    const html = Array.from(element.children);
    element.textContent = ""; // Clear all text
    html.forEach(child => element.appendChild(child)); // Reinsert child elements
}


function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text.trim());
}  


// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
const activitySocket = new WebSocket('ws://' + window.location.host + '/ws/activity/');

activitySocket.onmessage = function(event) {
    if (event.data === "ping") {
        console.log("Ping received, sending pong");
        activitySocket.send("pong");
    } else {
        const data = JSON.parse(event.data);
        console.log(data);
        const userId = data.user_id;
        const status = data.status;
        const last_activity = data.last_activity;

        const userElement = document.getElementById('user-activity-status-' + userId);
        if (userElement) {
            userElement.style = 'color: ' + getBadgeClass(status);
            const tooltip = userElement.querySelector(".status-indicator");
            tooltip.setAttribute("data-bs-title", "Last seen: " + last_activity + " ago");
        }
    }
};

function getBadgeClass(status) {
    switch (status) {
        case 'Active': return 'green;';
        case 'Idle': return 'rgb(231, 208, 0);';
        case 'Inactive': return 'red;';
        case 'Offline': return 'rgb(155, 155, 155);';
        default: return 'gray;';
    }
}

function timeSince(date) {
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
  
    if (seconds < 60) {
      return seconds + ' seconds ago';
    }
  
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return minutes + ' minutes ago';
    }
  
    const hours = Math.round(minutes / 60);
    if (hours < 24) {
      return hours + ' hours ago';
    }
  
    const days = Math.round(hours / 24);
    if (days < 7) {
      return days + ' days ago';
    }
  
    const weeks = Math.round(days / 7);
    if (weeks < 4) {
      return weeks + ' weeks ago';
    }
  
    const months = Math.round(days / 30);
    if (months < 12) {
      return months + ' months ago';
    }
  
    const years = Math.round(months / 12);
    return years + ' years ago';
  }

let lastInteractionTime = Date.now();
const idleThreshold = 10000;
const inactiveThreshold = 20000;

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('User is now Inactive');
        updateActivity(21000)
    } else {
        // User has returned
        console.log('User is active again');
        updateActivity(2);
    }
});

['mousemove', 'keydown', 'click', 'scroll'].forEach(event => {
    document.addEventListener(event, () => {
        lastInteractionTime = Date.now();
        // updateActivity(2);
    });
});

setInterval(() => {
    const currentTime = Date.now();
    const timeSinceLastInteraction = currentTime - lastInteractionTime;
    updateActivity(timeSinceLastInteraction);
}, 2000);

function updateActivity(timediff) {
    fetch('/profile/api/update-activity/'+timediff, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCsrfToken(),
            'Content-Type': 'application/json',
        },
    }).then(response => response.json())
      .then(data => console.log('Activity status updated:', data));
}

function getCsrfToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === 'csrftoken') return value;
    }
    return null;
}

activitySocket.onclose = function(e) {
    console.log('User is now Inactive');
    updateActivity(21000)
};




// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

jQuery.noConflict();
jQuery(document).ready(function ($) {
    const form = document.getElementById('add-friends-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        const modal = $('#exampleModal');
        const response = await fetch('/rooms/chat/add-users/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
            },
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            updateParticipantsList(data.participants, data.active_users, data.current_user, data.room_admin, data.chat_id);
        } else {
            alert('Failed to add friends.');
        }
        modal.modal('hide');
    });
});


// document.getElementById('add-friends-form').addEventListener('submit', (event) => {
//     event.preventDefault(); // Prevent form from submitting normally
//     const formData = new FormData(event.target);

// });


function updateParticipantsList(participants, activeUsers, current_user, room_admin, chat_id) {
    const participantsList = document.getElementById('participants-list');
    participantsList.innerHTML = ''; 
    participants.forEach(participant => {
        const listItem = document.createElement('li');
        listItem.id = "member-" + participant.id + "-" + chat_id;
        listItem.className = 'nav-item p-2 py-3 mx-1 shadow-sm chat-item';

        const containerDiv = document.createElement('div');
        containerDiv.className = 'd-flex justify-content-between align-items-center w-100 text-decoration-none';

        let statusColor, statusText;
        if (activeUsers.includes(participant.id)) {
            const status = activeUsers[participant.id];
            if (status === 'Active') {
                statusColor = 'green';
                statusText = 'Active';
            } else if (status === 'Idle') {
                statusColor = 'rgb(231, 208, 0)';
                statusText = 'Idle';
            } else if (status === 'Inactive') {
                statusColor = 'red';
                statusText = 'Inactive';
            } else {
                statusColor = 'rgb(155, 155, 155)';
                statusText = 'Offline';
            }
        } else {
            statusColor = 'rgb(155, 155, 155)';
            statusText = 'Offline';
        }

        const statusDiv = document.createElement('div');
        statusDiv.id = `user-activity-status-${participant.id}`;
        statusDiv.style.color = statusColor;

        const statusIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        statusIndicator.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        statusIndicator.setAttribute('width', '8');
        statusIndicator.setAttribute('height', '8');
        statusIndicator.setAttribute('fill', 'currentColor');
        statusIndicator.setAttribute('class', 'status-indicator');
        statusIndicator.setAttribute('viewBox', '0 0 16 16');
        statusIndicator.setAttribute('data-bs-toggle', 'tooltip');
        statusIndicator.setAttribute('data-bs-placement', 'bottom');
        statusIndicator.setAttribute('data-bs-custom-class', 'custom-tooltip');
        statusIndicator.setAttribute('data-bs-title', `Last seen: ${participant.last_activity} ago`);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '8');
        circle.setAttribute('cy', '8');
        circle.setAttribute('r', '8');

        statusIndicator.appendChild(circle);
        statusDiv.appendChild(statusIndicator);

        const usernameLink = document.createElement('a');
        usernameLink.className = 'text-white text-truncate ms-2 text-decoration-none';
        usernameLink.href = '#';
        usernameLink.style.maxWidth = '10ch';
        usernameLink.title = participant.first_name || participant.username;
        usernameLink.textContent = participant.username;

        const dropdownDiv = document.createElement('div');
        dropdownDiv.className = 'dropdown';

        const dropdownButton = document.createElement('a');
        dropdownButton.setAttribute('type', 'button');
        dropdownButton.setAttribute('data-bs-toggle', 'dropdown');
        dropdownButton.setAttribute('aria-expanded', 'false');
        dropdownButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-gear" viewBox="0 0 16 16">
                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0"/>
                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z"/>
            </svg>
        `;

        const dropdownMenu = document.createElement('ul');
        dropdownMenu.className = 'dropdown-menu';

        if(current_user.id == participant.id) {
            dropdownMenu.innerHTML = `
                <li>
                    <a class="dropdown-item" href="#">
                        <span data-bs-toggle="modal" data-bs-target="#removeUserModal">
                            Leave
                        </span>
                    </a>
                </li>
            `;
        } else if(current_user.id == room_admin.id) {
            dropdownMenu.innerHTML = `
                <li>
                    <a class="dropdown-item" href="#">
                        <span id="removeFriend" data-bs-toggle="modal" data-bs-target="#removeUserModal"  data-message-id="`  + participant.id + `">
                            Remove
                        </span>
                    </a>
                </li>
                <li><a class="dropdown-item" href="#">Profile</a></li>
            `;
        } else {
            dropdownMenu.innerHTML = `
                <li><a class="dropdown-item" href="#">Profile</a></li>
            `;
        }
        dropdownDiv.appendChild(dropdownButton);
        dropdownDiv.appendChild(dropdownMenu);

        containerDiv.appendChild(statusDiv);
        containerDiv.appendChild(usernameLink);
        containerDiv.appendChild(dropdownDiv);

        listItem.appendChild(containerDiv);

        participantsList.appendChild(listItem);
    });
}










jQuery.noConflict();
jQuery(document).ready(function ($) {
    const btn = document.getElementById('removeUserButton');
    const modal1 = $('#removeUserModal');
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const chat_id = btn.getAttribute('data-message-id');
    
        const user = document.getElementById('removeFriend');
        const userId = user.getAttribute('data-message-id');
    
        removeUser(chat_id, userId);
        modal1.modal('hide');
    });
});

function removeUser(chat_id, userId) {
    fetch(`/rooms/api/${chat_id}/${userId}/remove/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCsrfToken(), 
        },
    })
        .then(response => {
            if (response.ok) {
                const userElement = document.getElementById('member-' + userId + '-' + chat_id);
                if (userElement) {
                    userElement.remove();
                } else {
                    console.log("No such user");
                }
            } else {
                alert('Failed to remove user.');
            }
        })
        .catch(err => console.error('Error removing user: ', err));
}

jQuery.noConflict();
jQuery(document).ready(function ($) {
    $('#id_friends').select2({
        placeholder: 'Select friends to add to this chat',
        allowClear: true,
        width: '100%',
        dropdownCssClass: 'custom-select2-dropdown',
        containerCssClass: 'custom-select2-container'
    });
});







jQuery.noConflict();
jQuery(document).ready(function ($) {
    const btn = document.getElementById('leaveRoomButton');
    const modal1 = $('#leaveRoomModal');
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const chat_id = btn.getAttribute('data-message-id');
    
        const user = document.getElementById('leaveRoom');
        const userId = user.getAttribute('data-message-id');
    
        leaveRoom(chat_id, userId);
        modal1.modal('hide');
    });
});

function leaveRoom(chat_id, userId) {
    fetch(`/rooms/api/${chat_id}/${userId}/leave/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCsrfToken(), 
        },
    }).then(response => {
            if (response.ok) {
                const userElement = document.getElementById('member-' + userId + '-' + chat_id);
                if (userElement) {
                    userElement.remove();
                    window.location.href = '/rooms/';
                    setTimeout(() => location.reload(), 100);
                    console.log(window.location.href)
                } else {
                    console.log("No such user");
                }
            } else {
                alert('Failed to remove user.');
            }

        })
        .catch(err => console.error('Error removing user: ', err));
}

const userSocket = new WebSocket('ws://' + window.location.host + '/ws/chat_member/');

userSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.type === "participant_update") {
        const { event, user_id, username } = data;

        if (event === "add") {
            console.log(`${username} joined the chat.`);
            // Add the participant to the list
        } else if (event === "remove" || event === "leave") {
            console.log(`${username} left the chat.`);
            // Remove the participant from the list
        }
    }
};

userSocket.onclose = function(e) {
    console.error("Chat socket closed unexpectedly");
};