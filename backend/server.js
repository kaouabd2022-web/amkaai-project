const express = require("express");
const cors = require("cors");
require("dotenv").config();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🧠 قاعدة بيانات مؤقتة (Memory)
let users = [];

//////////////////////////////////////////////////
// 🔐 Middleware Auth
//////////////////////////////////////////////////
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}

//////////////////////////////////////////////////
// 🟢 REGISTER
//////////////////////////////////////////////////
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ error: "Missing fields" });
  }

  const exist = users.find(u => u.email === email);
  if (exist) {
    return res.json({ error: "User already exists" });
  }

  const hashed = await bcrypt.hash(password, 8);

  users.push({
    email,
    password: hashed,
    credits: 5, // 🎁 Free plan
    images: [],
    createdAt: new Date()
  });

  res.json({ message: "User created successfully" });
});

//////////////////////////////////////////////////
// 🔵 LOGIN
//////////////////////////////////////////////////
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: "Invalid email" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid password" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

  res.json({ token, email });
});

//////////////////////////////////////////////////
// 🟣 GENERATE IMAGE
//////////////////////////////////////////////////
app.post("/generate", auth, async (req, res) => {
  const { prompt } = req.body;
  const email = req.user.email;

  if (!prompt) {
    return res.json({ error: "Prompt is required" });
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.credits <= 0) {
    return res.status(403).json({ error: "No credits left" });
  }

  user.credits--;

  // 🔥 حالياً صورة تجريبية (يمكن ربط OpenAI لاحقاً)
  const imageUrl = `https://via.placeholder.com/512?text=${encodeURIComponent(prompt)}`;

  user.images.push({
    url: imageUrl,
    prompt,
    date: new Date()
  });

  res.json({
    image: imageUrl,
    credits: user.credits
  });
});

//////////////////////////////////////////////////
// 🟡 GET PROFILE
//////////////////////////////////////////////////
app.get("/me", auth, (req, res) => {
  const user = users.find(u => u.email === req.user.email);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    email: user.email,
    credits: user.credits,
    images: user.images
  });
});

//////////////////////////////////////////////////
// 🟠 CHANGE EMAIL
//////////////////////////////////////////////////
app.post("/change-email", auth, (req, res) => {
  const { newEmail } = req.body;

  if (!newEmail) {
    return res.json({ error: "New email required" });
  }

  const exist = users.find(u => u.email === newEmail);
  if (exist) {
    return res.json({ error: "Email already used" });
  }

  const user = users.find(u => u.email === req.user.email);

  if (!user) return res.status(404).json({ error: "User not found" });

  user.email = newEmail;

  const newToken = jwt.sign({ email: newEmail }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

  res.json({
    message: "Email updated",
    token: newToken
  });
});

//////////////////////////////////////////////////
// 🔴 DELETE ACCOUNT (احترافي 🔥)
//////////////////////////////////////////////////
app.delete("/delete-account", auth, (req, res) => {
  const email = req.user.email;

  users = users.filter(u => u.email !== email);

  res.json({ message: "Account deleted" });
});

//////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log("🔥 Backend running on http://localhost:" + PORT);
});