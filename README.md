# Real-Time Chat and Task Management System

## Features
- **Task Management**: 
  - Create, update, and delete tasks.
  - Associate tasks with specific projects.
  - Real-time updates for task actions across users.

- **Real-Time Chat**:
  - Join/create chatrooms with friends.
  - Send, edit, delete and receive messages with real-time updates.
  - Edit or delete messages dynamically (for the message owner).
  - Hover-based dropdown options for message actions.
  - Check whether other users ar active, idle, inactive, or offline.


## How It Works
1. **Backend**:
   - Django provides the core framework for task and project management.
   - Django Channels and Redis enable WebSocket communication for real-time functionality.
   - Signals announce changes (e.g., task or message updates) to WebSocket consumers, which broadcast them to relevant clients.
   - #### Database  
        - Uses **PostgreSQL** for data storage, managing users, projects, tasks, and chat messages.

2. **Frontend**:
   - Dynamic chat and task components update in real-time using JavaScript.
   - A WebSocket connection listens for server-sent events and updates the DOM accordingly.
   - Bootstrap-based UI.

## Stack
- **Django**
- **Django Channels**
- **Redis**
- **Bootstrap**
- **JavaScript**

## How to Use
1. **Run the Server**:
   - Install dependencies:
        - `pip install pipenv`  
        - `pipenv lock`   
        - `pipenv install`  
        - `pipenv shell`
   - Start the Redis server.
   - Run the Django server with `python manage.py runserver`.

2. **Task Management**:
   - Create or view projects.
   - Add, edit, or delete tasks within projects.

3. **Chat**:
   - Join a project chatroom.
   - Send messages in real-time.
   - Edit or delete your own messages.

## Future Enhancements
- Notifications for task assignments and deadlines.
- Kanban board
- Email notifications
- Advanced user permissions and roles.
- Additional chat functionality:  
    - Create chat channels
    - Adjust permission levels for channels
    - Invite users to channel/remove based on admin level
    - Create rooms within channel
- Additional real-time collaboration tools (e.g. shared documents).
- Expand user profile functionality with a user dashboard for personal tracking of projects, deadlines, chats
- Dockerization
- Switch to nginx/gunicorn with uvicorn workers