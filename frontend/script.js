const API = "https://your-backend-url.onrender.com";

// AUTH
function register() {
  fetch(API + "/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  }).then(() => alert("Registered"));
}

function login() {
  fetch(API + "/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  })
  .then(res => res.json())
  .then(data => {
    localStorage.setItem("token", data.token);
    location.href = "dashboard.html";
  });
}

function logout(){
  localStorage.removeItem("token");
  location.href = "index.html";
}

// UI
function showSection(id){
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// GENERATE
function generate() {
  fetch(API + "/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({
      prompt: prompt.value
    })
  })
  .then(res => res.json())
  .then(data => {
    preview.src = data.image;
    credits.innerText = "Credits: " + data.credits;
    loadImages();
  });
}

// LOAD IMAGES
function loadImages(){
  fetch(API + "/me", {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {
    images.innerHTML = "";
    data.images.forEach(img => {
      const el = document.createElement("img");
      el.src = img.url || img;
      images.appendChild(el);
    });
  });
}

// load on start
if(location.pathname.includes("dashboard")){
  loadImages();
}