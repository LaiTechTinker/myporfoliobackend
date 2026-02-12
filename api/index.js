import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import connectDB from "../config/database.js";
import Admin from "../models/Admin.js";

import projectRoutes from "../routes/projects.js";
import contactRoutes from "../routes/contacts.js";
import adminRoutes from "../routes/admin.js";

const app = express();

// Create initial admin function
const createInitialAdmin = async () => {
  try {
    const existingAdmin = await Admin.findOne();
    if (!existingAdmin) {
      const admin = new Admin({
        username: 'admin',
        password: 'admin123'
      });
      await admin.save();
      console.log('✅ Initial admin created: username=admin, password=admin123');
      console.log('🔐 Please change the password after first login!');
    }
  } catch (error) {
    console.error('Error creating initial admin:', error);
  }
};

/* CONNECT DB ONCE AND CREATE ADMIN */
await connectDB();
await createInitialAdmin();

/* MIDDLEWARE */
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ROOT */
app.get("/", (req, res) => {
  res.status(200).send("Portfolio backend is running 🚀");
});

/* HEALTH */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "API & DB working" });
});

/* ROUTES */
app.use("/api/projects", projectRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/admin", adminRoutes);

/* ERROR */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

/* 404 */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default serverless(app);
