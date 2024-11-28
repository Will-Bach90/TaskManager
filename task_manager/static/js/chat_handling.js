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
};

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
                    <ul class="dropdown-menu">
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
                        <ul class="dropdown-menu">
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

    // Iterate over all child nodes of the element
    Array.from(element.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            // Remove text node
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