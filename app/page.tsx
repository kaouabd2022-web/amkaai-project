"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Video, Mic, BarChart } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [visitors, setVisitors] = useState(1200);
  const [online, setOnline] = useState(12);
  const [loadingPlan, setLoadingPlan] = useState<"pro" | "premium" | null>(null);
  const [error, setError] = useState("");

  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [loadingAI, setLoadingAI] = useState(false);

  const fullText = "✨ AI generated cinematic video prompt ready...";

  // 📊 Live stats + FOMO
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitors((v) => v + Math.floor(Math.random() * 2));
      setOnline(Math.floor(Math.random() * 25));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 🧠 typing effect
  useEffect(() => {
    if (!loadingAI) return;

    if (typingIndex < fullText.length) {
      const t = setTimeout(() => {
        setResult((prev) => prev + fullText[typingIndex]);
        setTypingIndex((i) => i + 1);
      }, 30);
      return () => clearTimeout(t);
    } else {
      setLoadingAI(false);
    }
  }, [typingIndex, loadingAI]);

  // 💳 checkout
  const goToCheckout = async (plan: "pro" | "premium") => {
    try {
      setError("");
      setLoadingPlan(plan);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!data?.url) {
        setError("Checkout failed");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  };

  // ⚡ AI demo
  const generateAI = () => {
    if (!prompt) return;
    setResult("");
    setTypingIndex(0);
    setLoadingAI(true);
  };

  // 🎯 cursor glow
  useEffect(() => {
    const move = (e: any) => {
      const glow = document.getElementById("cursor-glow");
      if (glow) {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* 🎥 VIDEO */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover opacity-30"
      >
        <source src="/demo.mp4" type="video/mp4" />
      </video>

      {/* 🌈 CURSOR GLOW */}
      <div
        id="cursor-glow"
        className="fixed w-64 h-64 bg-cyan-500/20 blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"
      />

      <div className="fixed inset-0 bg-black/70 backdrop-blur-md" />

      {/* NAV */}
      <nav className="relative z-50 flex justify-between px-8 py-5 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <h1 className="font-bold text-xl">AMKAAI</h1>
        <div className="flex gap-6 text-gray-300">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 text-center py-32 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 text-transparent bg-clip-text"
        >
          Cinematic AI Creation
        </motion.h1>

        <p className="mt-6 text-gray-300">
          Create videos, voices, and images instantly
        </p>

        {/* 📊 STATS */}
        <div className="mt-10 flex justify-center gap-6">
          <Stat value={`${visitors}+`} label="Users" />
          <Stat value={online} label="Online" />
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/dashboard" className="px-8 py-4 bg-white text-black rounded-2xl font-bold">
            Start Free
          </Link>

          <button
            onClick={() => goToCheckout("pro")}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl font-bold"
          >
            {loadingPlan === "pro" ? "Processing..." : "Upgrade"}
          </button>
        </div>

        {error && <p className="text-red-400 mt-4">{error}</p>}
      </section>

      {/* ⚡ AI DEMO */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe cinematic video..."
            className="w-full bg-black/50 p-4 rounded-xl mb-4"
          />

          <button
            onClick={generateAI}
            className="px-6 py-3 bg-cyan-500 rounded-xl font-bold"
          >
            {loadingAI ? "Generating..." : "Generate"}
          </button>

          <div className="mt-6 h-40 bg-black/40 rounded-xl flex items-center justify-center text-gray-300 p-4">
            {result || "AI output appears here..."}
          </div>
        </div>
      </section>

      {/* 💰 PRICING */}
      <section className="relative z-10 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto pb-24">
        <Card title="Pro" price="$15" onClick={() => goToCheckout("pro")} />
        <Card title="Premium" price="$25" onClick={() => goToCheckout("premium")} />
      </section>

      {/* FEATURES */}
      <section className="relative z-10 grid md:grid-cols-4 gap-6 px-8 pb-20">
        <Feature icon={<Sparkles />} title="AI Image" />
        <Feature icon={<Mic />} title="AI Voice" />
        <Feature icon={<Video />} title="AI Video" />
        <Feature icon={<BarChart />} title="Analytics" />
      </section>
    </main>
  );
}

function Stat({ value, label }: any) {
  return (
    <div className="bg-white/5 px-6 py-4 rounded-2xl text-center">
      <p className="text-2xl font-bold text-cyan-400">{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

function Card({ title, price, onClick }: any) {
  return (
    <div className="p-8 bg-white/5 border border-white/10 rounded-2xl text-center backdrop-blur-xl">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-4xl mt-4">{price}</p>

      <button
        onClick={onClick}
        className="mt-6 w-full py-3 bg-white text-black rounded-xl font-bold"
      >
        Choose
      </button>
    </div>
  );
}

function Feature({ icon, title }: any) {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
      <div className="text-cyan-400 mb-3 flex justify-center">{icon}</div>
      <h3>{title}</h3>
    </div>
  );
}