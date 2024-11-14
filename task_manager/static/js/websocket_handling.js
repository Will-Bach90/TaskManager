const taskSocket = new WebSocket(
    'ws://' + window.location.host + '/ws/tasks/'  // Ensure the URL matches your Django Channels routing
);

taskSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log("Message received: ", data);
    if (data.action === 'deleted') {
        handleTaskDeletion(data.id); // Handle task deletion
    } else if (data.action === 'created' || data.action === 'updated') {
        alert('Task ' + data.id + ' was ' + data.action);
        // Optionally update or add to the UI
    }
};

taskSocket.onclose = function(e) {
    console.error('Task socket closed unexpectedly');
};

function sendMessage(message) {
    taskSocket.send(JSON.stringify({'message': message}));
}

// Function to handle task deletion in the UI
function handleTaskDeletion(taskId) {
    console.log("Handling deletion for task", taskId);
    const taskElement = document.getElementById('task-' + taskId);
    if (taskElement) {
        taskElement.remove();  // Remove the task element from the DOM
    } else {
        console.warn("Task element not found in DOM: ", taskId);
    }
}
