"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Video, Mic, BarChart } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [visitors, setVisitors] = useState(0);
  const [loadingPlan, setLoadingPlan] = useState<"pro" | "premium" | null>(null);
  const [online, setOnline] = useState(0);

  const [particles, setParticles] = useState<{ top: number; left: number }[]>(
    []
  );

  useEffect(() => {
    // particles
    setParticles(
      Array.from({ length: 30 }).map(() => ({
        top: Math.random() * 100,
        left: Math.random() * 100,
      }))
    );

    // visitors API
    fetch("/api/visitors")
      .then((res) => res.json())
      .then((data) => {
        setVisitors(data.visitors);
        setOnline(data.online || 0);
      })
      .catch(() => {});
  }, []);

  const goToCheckout = async (plan: "pro" | "premium") => {
    try {
      setLoadingPlan(plan);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout failed");
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* 🌈 Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[800px] h-[800px] bg-purple-600/20 blur-[160px] top-[-200px] left-[-200px]" />
        <div className="absolute w-[800px] h-[800px] bg-cyan-500/20 blur-[160px] bottom-[-200px] right-[-200px]" />
      </div>

      {/* ✨ Particles */}
      <div className="absolute inset-0 -z-10">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{ top: `${p.top}%`, left: `${p.left}%` }}
          />
        ))}
      </div>

      {/* NAV */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-white/10 backdrop-blur-xl bg-black/40 sticky top-0 z-50">
        <h1 className="text-xl font-bold">amkaai</h1>

        <div className="flex gap-6 text-gray-300">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center py-28 px-6">

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 text-transparent bg-clip-text"
        >
          Create AI Content <br /> Like a Pro Studio
        </motion.h1>

        <p className="mt-6 text-gray-400 text-lg">
          Images • Voice • Video — powered by AI
        </p>

        {/* STATS */}
        <div className="mt-10 flex justify-center gap-6 flex-wrap">

          <div className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-center">
            <p className="text-2xl font-bold text-cyan-400">
              {visitors}+
            </p>
            <p className="text-gray-400 text-sm">Visitors</p>
          </div>

          <div className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-center">
            <p className="text-2xl font-bold text-purple-400">
              {online}
            </p>
            <p className="text-gray-400 text-sm">Online now</p>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center gap-4 flex-wrap">

          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-2xl bg-white text-black font-semibold hover:scale-105 transition"
          >
            Start Free
          </Link>

          <button
            onClick={() => goToCheckout("pro")}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 font-bold hover:scale-105 transition shadow-[0_0_30px_rgba(139,92,246,0.4)]"
          >
            Upgrade Pro ⚡
          </button>

        </div>
      </section>

      {/* PRICING */}
      <section className="px-8 pb-24 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">

        {/* PRO */}
        <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:scale-105 transition">

          <h2 className="text-2xl font-bold">Pro</h2>
          <p className="text-gray-400 mt-2">Best for creators</p>

          <p className="text-4xl font-bold mt-6">$15</p>

          <ul className="text-gray-400 mt-4 space-y-2">
            <li>✔ 150 credits</li>
            <li>✔ Fast generation</li>
          </ul>

          <button
            onClick={() => goToCheckout("pro")}
            className="mt-6 w-full py-3 rounded-xl bg-white text-black font-bold"
          >
            {loadingPlan === "pro" ? "Processing..." : "Choose Pro"}
          </button>

        </div>

        {/* PREMIUM */}
        <div className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:scale-105 transition">

          <h2 className="text-2xl font-bold">Premium</h2>
          <p className="text-gray-400 mt-2">Ultra performance</p>

          <p className="text-4xl font-bold mt-6">$25</p>

          <ul className="text-gray-400 mt-4 space-y-2">
            <li>✔ 500 credits</li>
            <li>✔ Ultra fast AI</li>
          </ul>

          <button
            onClick={() => goToCheckout("premium")}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 font-bold"
          >
            {loadingPlan === "premium" ? "Processing..." : "Choose Premium"}
          </button>

        </div>

      </section>

      {/* FEATURES */}
      <section className="grid md:grid-cols-4 gap-6 px-8 pb-20">

        <Feature icon={<Sparkles />} title="AI Image" />
        <Feature icon={<Mic />} title="AI Voice" />
        <Feature icon={<Video />} title="AI Video" />
        <Feature icon={<BarChart />} title="Dashboard" />

      </section>

      {/* LOADING */}
      {loadingPlan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
          <p className="text-white text-xl animate-pulse">
            Redirecting to secure checkout...
          </p>
        </div>
      )}

    </main>
  );
}

function Feature({ icon, title }: any) {
  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-center hover:scale-105 transition">
      <div className="text-cyan-400 mb-3 flex justify-center">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
    </div>
  );
}