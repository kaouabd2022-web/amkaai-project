const API_URL = "/api";

// 🌍 TRANSLATIONS
const translations = {
  en: {
    subtitle: "Next Generation AI Creator",
    imgTitle: "AI Image",
    imgBtn: "Generate Image",
    vidTitle: "AI Video",
    vidBtn: "Generate Video"
  },
  fr: {
    subtitle: "Créateur IA nouvelle génération",
    imgTitle: "Image IA",
    imgBtn: "Générer Image",
    vidTitle: "Vidéo IA",
    vidBtn: "Générer Vidéo"
  },
  ar: {
    subtitle: "منصة الذكاء الاصطناعي",
    imgTitle: "صورة AI",
    imgBtn: "إنشاء صورة",
    vidTitle: "فيديو AI",
    vidBtn: "إنشاء فيديو"
  },
  es: {
    subtitle: "Creador IA",
    imgTitle: "Imagen IA",
    imgBtn: "Generar Imagen",
    vidTitle: "Video IA",
    vidBtn: "Generar Video"
  },
  it: {
    subtitle: "Creatore AI",
    imgTitle: "Immagine AI",
    imgBtn: "Genera Immagine",
    vidTitle: "Video AI",
    vidBtn: "Genera Video"
  },
  de: {
    subtitle: "KI Generator",
    imgTitle: "KI Bild",
    imgBtn: "Bild erstellen",
    vidTitle: "KI Video",
    vidBtn: "Video erstellen"
  },
  zh: {
    subtitle: "AI 创作平台",
    imgTitle: "AI 图像",
    imgBtn: "生成图像",
    vidTitle: "AI 视频",
    vidBtn: "生成视频"
  }
};

// 🌍 LANGUAGE SWITCH
function setLang(lang) {
  localStorage.setItem("lang", lang);

  document.getElementById("subtitle").innerText = translations[lang].subtitle;
  document.getElementById("imgTitle").innerText = translations[lang].imgTitle;
  document.getElementById("imgBtn").innerText = translations[lang].imgBtn;
  document.getElementById("vidTitle").innerText = translations[lang].vidTitle;
  document.getElementById("vidBtn").innerText = translations[lang].vidBtn;
}

// load language
window.onload = () => {
  const lang = localStorage.getItem("lang") || "en";
  setLang(lang);
};

// 🎨 IMAGE
async function generateImage() {
  const prompt = document.getElementById("prompt").value;

  const res = await fetch(API_URL + "/generate-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  document.getElementById("result").src = data.image;
}

// 🎬 VIDEO
async function generateVideo() {
  const prompt = document.getElementById("videoPrompt").value;

  const res = await fetch(API_URL + "/generate-video", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ prompt })
  });

  const data = await res.json();
  document.getElementById("videoResult").src = data.video;
}