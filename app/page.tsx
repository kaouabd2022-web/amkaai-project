"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Video, Mic, BarChart } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [visitors, setVisitors] = useState(0);
  const [online, setOnline] = useState(0);
  const [loadingPlan, setLoadingPlan] = useState<"pro" | "premium" | null>(null);
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // 📊 Visitors + fake live effect
  useEffect(() => {
    fetch("/api/visitors")
      .then((res) => res.json())
      .then((data) => {
        setVisitors(data.visitors || 1200);
        setOnline(data.online || 12);
      })
      .catch(() => {});

    const interval = setInterval(() => {
      setVisitors((v) => v + Math.floor(Math.random() * 3));
      setOnline(Math.floor(Math.random() * 20));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 💳 Checkout
  const goToCheckout = async (plan: "pro" | "premium") => {
    try {
      setError("");
      setLoadingPlan(plan);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!data?.url) {
        setError("Checkout failed. Try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoadingPlan(null);
    }
  };

  // ⚡ Fake AI demo
  const generateAI = () => {
    if (!prompt) return;

    setLoadingAI(true);
    setResult("");

    setTimeout(() => {
      setResult("✨ AI content generated successfully!");
      setLoadingAI(false);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* 🎥 VIDEO BACKGROUND */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 blur-[2px]"
      >
        <source src="/demo.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/70" />

      {/* 🌈 GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[800px] h-[800px] bg-purple-600/20 blur-[160px] top-[-200px] left-[-200px]" />
        <div className="absolute w-[800px] h-[800px] bg-cyan-500/20 blur-[160px] bottom-[-200px] right-[-200px]" />
      </div>

      {/* NAV */}
      <nav className="relative z-50 flex justify-between items-center px-8 py-5 border-b border-white/10 backdrop-blur-xl bg-black/40">
        <h1 className="text-xl font-bold tracking-wide">amkaai</h1>
        <div className="flex gap-6 text-gray-300">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 text-center py-32 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 text-transparent bg-clip-text"
        >
          Create AI Content <br /> That Feels Alive
        </motion.h1>

        <p className="mt-6 text-gray-300 text-lg">
          Images • Voice • Video — powered by AI
        </p>

        {/* STATS */}
        <div className="mt-10 flex justify-center gap-6 flex-wrap">
          <div className="glass px-6 py-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-cyan-400">{visitors}+</p>
            <p className="text-gray-400 text-sm">Visitors</p>
          </div>

          <div className="glass px-6 py-4 rounded-2xl text-center">
            <p className="text-2xl font-bold text-purple-400">{online}</p>
            <p className="text-gray-400 text-sm">Online now</p>
          </div>
        </div>

        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-2xl bg-white text-black font-semibold hover:scale-105 transition"
          >
            Start Free
          </Link>

          <button
            onClick={() => goToCheckout("pro")}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 font-bold hover:scale-105 transition"
          >
            Upgrade Pro ⚡
          </button>
        </div>

        {error && (
          <p className="text-red-400 mt-4">{error}</p>
        )}
      </section>

      {/* ⚡ LIVE AI DEMO */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-10">
          Try AI Instantly ⚡
        </h2>

        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your video..."
            className="w-full bg-black/50 border border-white/10 p-4 rounded-xl mb-4"
          />

          <button
            onClick={generateAI}
            className="px-6 py-3 bg-cyan-500 rounded-xl font-bold"
          >
            {loadingAI ? "Generating..." : "Generate"}
          </button>

          <div className="mt-6 h-40 bg-black/40 rounded-xl flex items-center justify-center text-gray-400">
            {loadingAI ? "⏳ AI is thinking..." : result || "Result appears here"}
          </div>
        </div>
      </section>

      {/* 💰 PRICING */}
      <section className="relative z-10 px-8 pb-24 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card title="Pro" price="$15" onClick={() => goToCheckout("pro")} loading={loadingPlan === "pro"} />
        <Card title="Premium" price="$25" onClick={() => goToCheckout("premium")} loading={loadingPlan === "premium"} />
      </section>

      {/* FEATURES */}
      <section className="relative z-10 grid md:grid-cols-4 gap-6 px-8 pb-20">
        <Feature icon={<Sparkles />} title="AI Image" />
        <Feature icon={<Mic />} title="AI Voice" />
        <Feature icon={<Video />} title="AI Video" />
        <Feature icon={<BarChart />} title="Dashboard" />
      </section>
    </main>
  );
}

function Card({ title, price, onClick, loading }: any) {
  return (
    <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-4xl font-bold mt-4">{price}</p>

      <button
        onClick={onClick}
        className="mt-6 w-full py-3 rounded-xl bg-white text-black font-bold"
      >
        {loading ? "Processing..." : "Choose"}
      </button>
    </div>
  );
}

function Feature({ icon, title }: any) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 text-center">
      <div className="text-cyan-400 mb-3 flex justify-center">{icon}</div>
      <h3>{title}</h3>
    </div>
  );
}