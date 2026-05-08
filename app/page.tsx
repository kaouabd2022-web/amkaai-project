"use client";

import Link from "next/link";
import Script from "next/script";
import { motion } from "framer-motion";
import {
  Sparkles,
  Mic,
  Video,
  BarChart,
  CreditCard,
  Bitcoin,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import AIGallery from "@/components/ai-gallery";

declare global {
  interface Window {
    Paddle: any;
  }
}

export default function Home() {
  const [particles, setParticles] = useState<
    { top: number; left: number }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 20 }).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
    }));

    setParticles(generated);

    // ✅ Paddle Initialize
    if (typeof window !== "undefined" && window.Paddle) {
      window.Paddle.Environment.set("sandbox"); // change to production later

      window.Paddle.Initialize({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
      });
    }
  }, []);

  // ✅ PRO Checkout
  const buyPro = () => {
    if (!window.Paddle) {
      alert("Paddle not loaded");
      return;
    }

    window.Paddle.Checkout.open({
      items: [
        {
          priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO!,
          quantity: 1,
        },
      ],
    });
  };

  // ✅ PREMIUM Checkout
  const buyPremium = () => {
    if (!window.Paddle) {
      alert("Paddle not loaded");
      return;
    }

    window.Paddle.Checkout.open({
      items: [
        {
          priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_PREMIUM!,
          quantity: 1,
        },
      ],
    });
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* ✅ Paddle Script */}
      <Script
        src="https://cdn.paddle.com/paddle/v2/paddle.js"
        strategy="beforeInteractive"
      />

      {/* 🌊 Background */}
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute w-[800px] h-[800px] bg-cyan-500/20 blur-[140px] top-[-200px] left-[-200px]" />
        <div className="absolute w-[800px] h-[800px] bg-purple-500/20 blur-[140px] bottom-[-200px] right-[-200px]" />
      </div>

      {/* ✨ Particles */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-pulse"
            style={{ top: `${p.top}%`, left: `${p.left}%` }}
          />
        ))}
      </div>

      {/* 🔝 NAV */}
      <nav className="sticky top-0 z-50 flex justify-between items-center px-8 py-5 border-b border-white/10 backdrop-blur-xl bg-black/40">
        <h1 className="text-xl font-bold tracking-wide">amkaai</h1>

        <div className="flex gap-6 text-gray-300">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
      </nav>

      {/* 🎥 HERO */}
      <section className="relative text-center py-28 px-6">

        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source src="/demo.mp4" />
        </video>

        <div className="relative z-10">

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold gradient-text"
          >
            Create AI Content <br /> That Feels Alive
          </motion.h1>

          <p className="mt-6 text-gray-400 text-lg">
            Images, Voices, Videos — powered by AI
          </p>

          <p className="mt-4 text-yellow-400 font-semibold animate-pulse">
            ⚡ Only today: 20% OFF
          </p>

          <div className="mt-10 flex justify-center gap-4 flex-wrap">

            <Link
              href="/dashboard"
              className="btn-primary px-10 py-4 rounded-2xl font-semibold"
            >
              Start Free →
            </Link>

            <Link
              href="/pricing"
              className="px-8 py-4 rounded-2xl border border-white/20 hover:border-white transition"
            >
              Pricing
            </Link>

            <button
              onClick={buyPro}
              className="px-8 py-4 rounded-2xl bg-yellow-500 text-black font-bold hover:scale-105 transition"
            >
              Upgrade Pro 🚀
            </button>

          </div>
        </div>
      </section>

      {/* 💳 PAYMENT METHODS */}
      <section className="px-8 pb-16 text-center">

        <h2 className="text-2xl font-bold mb-6">
          Secure Payments via Paddle
        </h2>

        <div className="flex justify-center flex-wrap gap-6 text-gray-300">

          <div className="glass px-6 py-4 rounded-xl flex items-center gap-2">
            <CreditCard size={18} /> Cards
          </div>

          <div className="glass px-6 py-4 rounded-xl flex items-center gap-2">
            <Bitcoin size={18} /> Crypto
          </div>

          <div className="glass px-6 py-4 rounded-xl flex items-center gap-2">
            <Wallet size={18} /> Global Checkout
          </div>

        </div>

        <div className="mt-6">

          <button
            onClick={buyPremium}
            className="px-8 py-3 rounded-xl bg-purple-500 text-white font-bold hover:scale-105 transition"
          >
            Upgrade Premium 💎
          </button>

        </div>
      </section>

      {/* 🧠 TRUST */}
      <section className="text-center text-gray-500 mb-10">
        Trusted by 1,000+ creators worldwide
      </section>

      {/* 🧠 FEATURES */}
      <section className="grid md:grid-cols-4 gap-6 px-8 pb-20">

        <Feature
          title="AI Image"
          desc="Generate stunning images"
          icon={<Sparkles />}
          link="/ai-image"
        />

        <Feature
          title="AI Voice"
          desc="Text → realistic voice"
          icon={<Mic />}
          link="/ai-voice"
        />

        <Feature
          title="AI Video"
          desc="Create cinematic videos"
          icon={<Video />}
          link="/ai-video"
        />

        <Feature
          title="Dashboard"
          desc="Manage everything"
          icon={<BarChart />}
          link="/dashboard"
        />

      </section>

      <AIGallery />
    </main>
  );
}

function Feature({ title, desc, icon, link }: any) {
  return (
    <motion.div whileHover={{ scale: 1.05 }}>
      <Link href={link} className="glass p-6 rounded-2xl block">
        <div className="text-cyan-400 mb-4">{icon}</div>

        <h3 className="text-lg font-semibold">{title}</h3>

        <p className="text-gray-400">{desc}</p>
      </Link>
    </motion.div>
  );
}