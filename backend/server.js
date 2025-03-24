require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const wakatimeRoutes = require("./routes/waka");

const app = express();

// ✅ Allow multiple origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://tasks-frontend-2.onrender.com",
  "http://localhost:10000",
];

// ✅ CORS Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,  // ✅ Allow sending credentials like cookies
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",  // ✅ Allowed methods
  allowedHeaders: "Origin,X-Requested-With,Content-Type,Accept,Authorization",  // ✅ Allowed headers
  maxAge: 86400,  // ✅ Cache preflight response for 24 hours
}));

app.use(express.json()); // Ensure JSON body is parsed properly
app.use(cookieParser());

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is not defined in .env file");
  process.exit(1);
}

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const SECRET = process.env.JWT_SECRET || "supersecret";

// ✅ Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ User Schema
const User = mongoose.model("User", new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

// ✅ Task Schema
const Task = mongoose.model("Task", new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  description: String,
  completed: { type: Boolean, default: false },
  date: { type: Date , required:true }// ✅ Add this line  , default: Date.now
}));

// ✅ Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// ✅ Routes
app.use("/api", wakatimeRoutes);

app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ User Login
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("Received Login Request:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "I.nvalid credentials" });

    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: "1h" });

// ✅ Set the cookie in the login route
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",  // Use secure only in production
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
}).json({ message: "Logged in", token });
    
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Auth Check Route
// Auth Check Route
app.get("/api/auth/check", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    console.log("No token found");
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      console.error("Invalid token:", err);
      return res.status(403).json({ error: "Invalid token" });
    }
    console.log("Authenticated user:", decoded.userId);
    res.json({ authenticated: true });
  });
});


// ✅ Logout
// Logout Route
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  }).json({ message: "Logged out successfully" });
});


// ✅ Get User's Tasks
app.get("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Add Task
// ✅ Add Task
app.post("/api/tasks", authMiddleware, async (req, res) => {
  try {
    const { title, description, date } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ error: "Title, description, and date are required" });
    }

    // Log the incoming date for debugging
    console.log("Received date:", date);

    // Create a Date object to ensure it is valid and adjusted correctly
    const taskDate = new Date(date);
    const formattedDate = new Date(taskDate.getTime() + Math.abs(taskDate.getTimezoneOffset() * 60000));

    // Log the final formatted date
    console.log("Formatted date for database:", formattedDate);

    const task = new Task({ userId: req.user.userId, title, description, date: formattedDate });
    await task.save();

    // ✅ Send email notification
    const user = await User.findById(req.user.userId);
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: `${user.email}, evanjoroge3@gmail.com,x2023fft@stfx.ca`, 
      subject: "New Task Added",
      text: `A new task has been added:\n\nTitle: ${title}\nDescription: ${description}\nDue Date: ${formattedDate.toISOString().split('T')[0]}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    res.json({ message: "Task created successfully", task });
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ Send Email Alerts for Unfinished Tasks
// ✅ Send Email Alerts for Unfinished Tasks (Scheduled after 5 minutes)
app.post("/send-alert", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const tasks = await Task.find({ userId: req.user.userId, completed: false });

    if (!tasks.length) {
      return res.status(400).json({ error: "No unfinished tasks to remind about" });
    }

    const recipients = ["Evanjoroge33@gmail.com", "x2023fft@stfx.ca"];
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipients,
      subject: "Tasks Alert (Scheduled)",
      text: `Reminder from Task Planner: You have unfinished tasks:\n\n${tasks.map(task => `- ${task.title}`).join("\n")}`,
    };

    // ✅ Schedule the email to be sent after 5 minutes (300000 ms)
    setTimeout(() => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Scheduled Email Sending Error:", error);
        } else {
          console.log("Scheduled Email Sent:", info.response);
        }
      });
    }, 300000); // 5 minutes delay

    res.status(200).json({ message: "Email alert scheduled in 5 minutes" });

  } catch (err) {
    console.error("Send Alert Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
