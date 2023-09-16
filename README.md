# Tutorials Blog Website
Welcome to the Tutorials Blog Website, a Node.js-based web application that allows admins to create courses and manage user privileges. Users can add courses and their contents. Please follow the instructions below to get started.

# Table of Contents
<ul> 
    <li>Getting Started</li>
        <ul> 
            <li>Prerequisites</li>
            <li>Installation</li>
        </ul>
    <li>Usage</li>
        <ul> 
            <li>Logging In</li>
            <li>Admin Privileges</li>
            <li>Adding Courses</li>
            <li>Adding Course Contents</li>
        </ul>
</ul>

# Getting Started
## Prerequisites
Make sure you have the following software installed on your system:
<ul> 
    <li>Node.js</li>
    <li>MongoDB</li>
</ul>

## Installation
1. Clone the repository:
```bash
    git clone https://github.com/yourusername/course-management-website.git
    cd course-management-website
```
2. Install dependencies:
```bash
    npm install
```
3. Configure environment variables:
Create a `.env` file in the project root and configure the following variables
(Replace your-session-secret with a secure session secret.):
```bash
    MONGODB_URI={local mongodb URI: "mongodb://localhost:27017/blogDB" or online URI such as AWS}
    SESSION_SECRET=your-session-secret
```
4. Start the application:
```bash
    node app.js
```

# Usage
## Logging In
To access the website, follow these steps:
1. Open your web browser and go to the login page:
```bash
    http://localhost:3000/login
```
2. Start the application:
Enter your credentials (username and password).
3. Enter your credentials (username and password).
If the credentials are correct, you will be redirected to the main page <b>(`http://localhost:3000/`)</b> that contains the list of courses.

## Admin Privileges
Admins have additional privileges to manage users and courses. Regular users can only add or edit tutorials.

* Admins can add users to the system and modify their privileges.
* Regular users can only add or edit tutorials within existing courses.
* Admins can add, edit, and remove courses.

## Adding Courses
<ol>
    <li>If you are an admin, log in to the website.</li>
    <li>Click the "Create Course" button on the main page.</li>
    <li>Fill in the course details, such as the course name, description, and any other relevant information.</li>
    <li>Click the "Create" button to add the course.</li>
</ol>

## Adding Course Contents
<ol>
    <li>If you have access to a course, you can add or edit tutorials within that course.</li>
    <li>Navigate to the course's page by clicking on the course title on the main page.</li>
    <li>Click the "Add Tutorial" button on the course page.</li>
    <li>Fill in the tutorial details, such as the tutorial title, description, and content.</li>
    <li>Click the "Save" button to add or update the tutorial.</li>
</ol>





