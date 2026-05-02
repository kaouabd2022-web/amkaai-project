const fetch = require("node-fetch");
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// 🔥 ربط frontend
app.use(express.static(path.join(__dirname, "public")));

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
// 🧠 اختبار السيرفر
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is working ✅" });
});

// 🎨 توليد صورة (OpenAI)
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
 },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        size: "1024x1024"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json(data);
    }

    res.json({
      image: data.data[0].url
    });

  } catch (error) {
console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 🌍 PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});