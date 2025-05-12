/* eslint-disable no-unused-vars */
import http from "http";
import admin from "firebase-admin";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";

// Read Firebase Admin JSON credentials
const serviceAccount = JSON.parse(fs.readFileSync("firebase-admin.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Handle form submission
app.post("/submit", async (req, res) => {
  try {
    await db.collection("form-submissions").add(req.body);
    res.status(200).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Failed to save data" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
