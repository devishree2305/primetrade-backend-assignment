# Primetrade Backend Developer Assignment

## Overview

This project implements a scalable REST API with authentication, role-based access control, and task management, along with a basic frontend UI for interaction.

---

## Tech Stack

* Backend: FastAPI (Python)
* Frontend: React (Vite)
* Authentication: JWT

---

## Project Structure

```
Backend/backend
│
├── app/
├── .env (not included in repo)
├── API_DOCUMENTATION.md
├── requirements.txt
├── primetradeai.db
│
Frontend/
├── src/
├── index.html
├── package.json
```

---

## Features

### Authentication

* User registration and login
* Password hashing using bcrypt
* JWT-based authentication

### Role-Based Access

* Default role: User
* Admin role via request and approval system
* Protected routes based on roles

### Admin Features

* View admin requests
* Approve or reject requests

### Task Management

* Admin: Create, update, delete tasks
* User: View own tasks

---

## API Documentation

Available in:

* Swagger UI: http://127.0.0.1:8000/docs
* File: `Backend/API_DOCUMENTATION.md`

---

## Frontend Features

* Registration and login interface
* Dashboard for viewing tasks
* Admin panel for managing tasks and requests

---

## Setup Instructions

### Backend Setup

```
cd Backend/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

### Frontend Setup

```
cd Frontend
npm install
npm run dev
```

---

## API Base URL

http://127.0.0.1:8000/api/v1

---

## Scalability Notes

* Modular architecture with separation of concerns (routes, models, schemas)
* Can be extended into microservices (authentication, tasks, admin modules)
* Redis can be integrated for caching
* Load balancing can be implemented using Nginx
* Docker support can be added for deployment

---

## Deliverables Covered

* Authentication APIs
* Role-based access control
* CRUD operations
* Frontend integration
* API documentation
* Scalable backend design

---

## Author

Devishree Nadar
