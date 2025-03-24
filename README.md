Tasks app
# Task Manager App

This is a full-stack task web management application with a **React frontend** and a **Node.js backend** using MongoDB for data storage.

## Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [MongoDB](https://www.mongodb.com/)
- npm (comes with Node.js)

## Installation
Clone the repository:
```sh
git clone https://github.com/Lunar9999/tasksapp.git
cd tasksapp
```

## Running the Frontend
1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm start
   ```
4. The frontend will run at:
   ```
   Local:            http://localhost:3000
   On Your Network:  http://192.168.x.x:3000
   ```

## Running the Backend
1. Navigate to the backend directory:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm start
   ```
4. The backend will run at:
   ```
   Server is running on port 10000
   Connected to MongoDB
   ```

## Building for Production
For the frontend:
```sh
npm run build
```
This will create an optimized production build in the `build/` directory.

## Environment Variables
Create a `.env` file in the `backend/` directory and configure the following:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=10000
```

## API Routes (Backend)
- **POST** `/api/auth/login` - Login a user
- **POST** `/api/auth/register` - Register a new user
- **GET** `/api/tasks` - Fetch all tasks
- **POST** `/api/tasks` - Create a new task
- **PUT** `/api/tasks/:id` - Update a task
- **DELETE** `/api/tasks/:id` - Delete a task

## Troubleshooting
- If `npm start` fails, try deleting `node_modules` and `package-lock.json`, then reinstall:
  ```sh
  rm -rf node_modules package-lock.json
  npm install
  ```
- If MongoDB connection fails, ensure MongoDB is running locally or update the `MONGO_URI`.

## License
This project is open-source under the [MIT License](LICENSE).


