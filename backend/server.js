const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));

// Define a schema for storing questions and answers
const questionAnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

// Create a model based on the schema
const QuestionAnswer = mongoose.model(
  "QuestionAnswer",
  questionAnswerSchema,
  "questions_and_answers"
);

// Route to forward the question to Python
app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question not provided" });
  }

    try {
        // Forward the request to the Python script
        const pythonResponse = await fetch("https://huggingface.co/spaces/Kshitu/Genai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

    const pythonData = await pythonResponse.json();

    // Save the question and answer to MongoDB
    const questionAnswer = new QuestionAnswer({
      question: question,
      answer: pythonData.answer || pythonData.error || "No answer returned",
    });

    await questionAnswer.save(); // Save to the database

    console.log("Question and answer saved:", questionAnswer);

    if (pythonResponse.ok) {
      res.json({ answer: pythonData.answer });
    } else {
      res.status(pythonResponse.status).json({ error: pythonData.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});