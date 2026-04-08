const translations = {
  en: {
    home: "Home",
    features: "Features",
    pricing: "Pricing",
    login: "Sign In",
    signup: "Get Started",
    title: "Create AI Videos in Seconds",
    subtitle: "Transform your ideas into stunning AI videos instantly",
    cta: "Start Free",
    f1_title: "AI Avatars",
    f1_desc: "Create realistic avatars with AI",
    f2_title: "Text to Video",
    f2_desc: "Turn text into powerful videos",
    f3_title: "Voice AI",
    f3_desc: "Generate realistic voices"
  },

  fr: {
    home: "Accueil",
    features: "Fonctionnalités",
    pricing: "Tarifs",
    login: "Connexion",
    signup: "Commencer",
    title: "Créez des vidéos AI en secondes",
    subtitle: "Transformez vos idées en vidéos incroyables",
    cta: "Commencer",
    f1_title: "Avatars AI",
    f1_desc: "Créez des avatars réalistes",
    f2_title: "Texte vers vidéo",
    f2_desc: "Transformez le texte en vidéo",
    f3_title: "Voix AI",
    f3_desc: "Générez des voix réalistes"
  },

  ar: {
    home: "الرئيسية",
    features: "المميزات",
    pricing: "الأسعار",
    login: "تسجيل الدخول",
    signup: "ابدأ الآن",
    title: "أنشئ فيديوهات بالذكاء الاصطناعي في ثواني",
    subtitle: "حوّل أفكارك إلى فيديوهات مذهلة",
    cta: "ابدأ مجانًا",
    f1_title: "شخصيات AI",
    f1_desc: "إنشاء شخصيات واقعية",
    f2_title: "نص إلى فيديو",
    f2_desc: "تحويل النص إلى فيديو",
    f3_title: "صوت AI",
    f3_desc: "إنشاء أصوات واقعية"
  }
};

const languageSelect = document.getElementById("language");

function setLanguage(lang) {
  document.querySelectorAll("[data-key]").forEach(el => {
    el.innerText = translations[lang][el.getAttribute("data-key")];
  });

  document.body.style.direction = (lang === "ar") ? "rtl" : "ltr";

  localStorage.setItem("lang", lang);
}

languageSelect.addEventListener("change", (e) => {
  setLanguage(e.target.value);
});

window.onload = () => {
  const lang = localStorage.getItem("lang") || "en";
  languageSelect.value = lang;
  setLanguage(lang);
};