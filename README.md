# Learning-of-Legends
![Screenshot 2025-03-09 193341](https://github.com/user-attachments/assets/56210f2c-21a9-449d-b8b0-94789dc1d38d)

Team 66 Group Project

Learning of Legends is an educational strategy game tailored for primary school students to enhance math skills through engaging battles and problem-solving tasks. Players dive into PvE (Player vs Environment) and PvP (Player vs Player) modes, answering math questions accurately to advance and overcome foes. A parent dashboard is included, enabling guardians to monitor their child’s performance and progress closely. The game blends learning with fun. It targets young minds effectively.

# Prerequisites
Before running the project, ensure that you have the following installed:
- Node.js
- npm
- SQLite3

# Setup Instructions
1. Install Dependencies npm install
2. Build the Database: node server.js

The web app will be available at http://localhost:3000.

# Key Routes
Here are some important routes in the application:
- Homepage: http://localhost:3000/student.html
- Sign In: http://localhost:3000/login.html
- Sign Up: http://localhost:3000/register.html
- Reset Password: http://localhost:3000/reset-password.html
- PVE: http://localhost:3000/pve.html
- PVP: http://localhost:3000/pvp.html
- Statistics: http://localhost:3000/statistics.html
- Settings: http://localhost:3000/settings.html

# Folder Structure
The key files and folders in this project are:
- /routes: Contains the route definitions for the application.
- /public: Holds the Javascript, CSS, Image and HTML files.
- /db: Holds the database.
- /middleware: Contains the JSON web tokens.

# Accounts 
username || password 
admin || admin
testuser1 || testuser1 (parents)
testuser2 || testuser2 (students)
testuser3 || testuser3 (teachers)
