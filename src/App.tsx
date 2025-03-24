import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AccountData from "./components/AccountSection/AccountData";
import Footer from "./components/Footer";
import Menu from "./components/Menu/Menu";
import TasksSection from "./components/TasksSection/TasksSection";
import ModalCreateTask from "./components/Utilities/ModalTask";
import Login from "./pages/login";
import Register from "./pages/register";
import { Task } from "./interfaces";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { modalActions } from "./store/Modal.store";
import { tasksActions } from "./store/Tasks.store";
import Statistics from "./pages/statistics";

const App: React.FC = () => {
  const modal = useAppSelector((state) => state.modal);
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const dispatch = useAppDispatch();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:10000/api/auth/check", {
          credentials: "include",
        });
        if (response.ok) {
          setIsAuthenticated(true);
          console.log("User is authenticated");
        } else {
          setIsAuthenticated(false);
          console.log("User is not authenticated");
        }
      } catch (error) {
        console.error("Authentication check failed, setting as not authenticated", error);
        setIsAuthenticated(false);
      }
    };
  
    checkAuth();
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(tasksActions.fetchTasks());
    }
  }, [isAuthenticated, dispatch]);

  const closeModalCreateTask = () => {
    dispatch(modalActions.closeModalCreateTask());
  };

  const createNewTaskHandler = async (task: Task) => {
    try {
      if (!task.title) {
        task.title = "Untitled Task";
      }
      if (!task.description) {
        task.description = "No description provided";
      }
      if (!task.date) {
        const currentDate = new Date().toISOString().split("T")[0];
        task.date = currentDate;
      }
  
      // Await the task creation and state update
      await dispatch(tasksActions.addNewTask(task)).unwrap();
      await dispatch(tasksActions.fetchTasks()); // Refresh task list after addition
  
      console.log("Task added successfully", task);
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };
  

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/tasks" replace /> : <Navigate to="/login" replace />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/tasks" replace /> : <Login setIsAuthenticated={setIsAuthenticated} />        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/tasks" replace /> : <Register />
        }
      />

      <Route
        path="/tasks/*"
        element={
          isAuthenticated ? (
            <div className="bg-slate-200 min-h-screen text-slate-600 dark:bg-slate-900 dark:text-slate-400 xl:text-base sm:text-sm text-xs">
              {modal.modalCreateTaskOpen && (
                <ModalCreateTask
                  onClose={closeModalCreateTask}
                  nameForm="Add a task"
                  onConfirm={createNewTaskHandler}
                />
              )}
              <Menu />
              <TasksSection tasks={tasks} />
              <Footer />
              <AccountData />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/statistics"
        element={isAuthenticated ? <Statistics /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;
