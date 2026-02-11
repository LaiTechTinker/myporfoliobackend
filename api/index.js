import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import connectDB from "../config/database.js";

import projectRoutes from "../routes/projects.js";
import contactRoutes from "../routes/contacts.js";
import adminRoutes from "../routes/admin.js";

const app = express();

/* -------------------- BASIC MIDDLEWARE -------------------- */
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* -------------------- ROOT ROUTE (VERY IMPORTANT) -------------------- */
/* Prevents 504 timeout when visiting the base URL */
app.get("/", (req, res) => {
  res.status(200).send("Portfolio backend is running 🚀");
});

/* -------------------- HEALTH CHECK -------------------- */
app.get("/api/health", async (req, res) => {
  try {
    await connectDB(); // connect only when needed
    res.json({ status: "OK", message: "API & DB working" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Database failed" });
  }
});

/* -------------------- ROUTES -------------------- */
/* DB connection happens inside routes when first used */
app.use("/api/projects", projectRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/admin", adminRoutes);

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: "Duplicate field value",
      field: Object.keys(err.keyValue)[0],
    });
  }

  res.status(500).json({ message: "Something went wrong!" });
});

/* -------------------- 404 HANDLER -------------------- */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* -------------------- EXPORT FOR VERCEL -------------------- */
export default serverless(app);
