import { createSlice, PayloadAction, createAsyncThunk, Middleware } from "@reduxjs/toolkit";
import { Task } from "../interfaces";

// Fetch Tasks
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async () => {
  const response = await fetch("http://localhost:10000/api/tasks", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return response.json();
});

// Add Task
export const addNewTask = createAsyncThunk("tasks/addNewTask", async (task: Task) => {
  const response = await fetch("http://localhost:10000/api/tasks", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to add task:", errorText);
    throw new Error("Failed to add task");
  }

  const data = await response.json();
  console.log("API Response:", data);
  return data;
});

// Remove Task
export const removeTask = createAsyncThunk("tasks/removeTask", async (taskId: string) => {
  await fetch(`http://localhost:10000/api/tasks/${taskId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return taskId;
});

// Edit Task
export const editTask = createAsyncThunk("tasks/editTask", async (task: Task) => {
  await fetch(`http://localhost:10000/api/tasks/${task.id}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });
  return task;
});

// Delete All Tasks
export const deleteAllData = createAsyncThunk("tasks/deleteAllData", async () => {
  await fetch("http://localhost:10000/api/tasks", {
    method: "DELETE",
    credentials: "include",
  });
  return true;
});

const initialState: {
  tasks: Task[];
  directories: string[];
} = {
  tasks: [],
  directories: ["Main"],
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    markAsImportant: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((task) => task.id === action.payload);
      if (task) {
        task.important = !task.important;
      }
    },
    toggleTaskCompleted: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find((task) => task.id === action.payload);
      if (task) {
        task.completed = !task.completed;
      }
    },
    createDirectory: (state, action: PayloadAction<string>) => {
      if (!state.directories.includes(action.payload)) {
        state.directories = [action.payload, ...state.directories];
      }
    },
    deleteDirectory: (state, action: PayloadAction<string>) => {
      state.directories = state.directories.filter((dir) => dir !== action.payload);
      state.tasks = state.tasks.filter((task) => task.dir !== action.payload);
    },
    editDirectoryName: (
      state,
      action: PayloadAction<{ newDirName: string; previousDirName: string }>
    ) => {
      if (!state.directories.includes(action.payload.newDirName)) {
        const index = state.directories.indexOf(action.payload.previousDirName);
        if (index !== -1) {
          state.directories[index] = action.payload.newDirName;
        }
        state.tasks.forEach((task) => {
          if (task.dir === action.payload.previousDirName) {
            task.dir = action.payload.newDirName;
          }
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
      })
      .addCase(addNewTask.fulfilled, (state, action) => {
        state.tasks = [action.payload, ...state.tasks];
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      })
      .addCase(editTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex((task) => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(deleteAllData.fulfilled, (state) => {
        state.tasks = [];
        state.directories = ["Main"];
      });
  },
});

// Middleware
export const tasksMiddleware: Middleware = (store) => (next) => (action) => {
  console.log("Middleware triggered:", action);
  return next(action);
};

// Actions and Reducer Export
export const tasksActions = { ...tasksSlice.actions, fetchTasks, addNewTask, removeTask, editTask, deleteAllData };
export default tasksSlice.reducer;
