"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Mic, Video, BarChart, CreditCard, Bitcoin, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import AIGallery from "@/components/ai-gallery";

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
  }, []);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">

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

          {/* 🔥 OFFER */}
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

            {/* 🔥 Direct Upgrade */}
            <Link
              href="/pricing"
              className="px-8 py-4 rounded-2xl bg-yellow-500 text-black font-bold hover:scale-105 transition"
            >
              Upgrade 🚀
            </Link>
          </div>
        </div>
      </section>

      {/* 💳 PAYMENT METHODS */}
      <section className="px-8 pb-16 text-center">
        <h2 className="text-2xl font-bold mb-6">We support all payments</h2>

        <div className="flex justify-center flex-wrap gap-6 text-gray-300">

          <div className="glass px-6 py-4 rounded-xl flex items-center gap-2">
            <CreditCard size={18} /> Card (Stripe)
          </div>

          <div className="glass px-6 py-4 rounded-xl flex items-center gap-2">
            <Bitcoin size={18} /> Crypto (USDT)
          </div>

          <div className="glass px-6 py-4 rounded-xl flex items-center gap-2">
            <Wallet size={18} /> BaridiMob 🇩🇿
          </div>

        </div>
      </section>

      {/* 🧠 TRUST */}
      <section className="text-center text-gray-500 mb-10">
        Trusted by 1,000+ creators worldwide
      </section>

      {/* 🧠 FEATURES */}
      <section className="grid md:grid-cols-4 gap-6 px-8 pb-20">
        <Feature title="AI Image" desc="Generate stunning images" icon={<Sparkles />} link="/ai-image" />
        <Feature title="AI Voice" desc="Text → realistic voice" icon={<Mic />} link="/ai-voice" />
        <Feature title="AI Video" desc="Create cinematic videos" icon={<Video />} link="/ai-video" />
        <Feature title="Dashboard" desc="Manage everything" icon={<BarChart />} link="/dashboard" />
      </section>

      <AIGallery />

      {/* 💬 Testimonials */}
      <section className="px-8 py-20">
        <h2 className="text-4xl text-center font-bold gradient-text mb-12">
          What creators say
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Card text="This AI changed my workflow 🚀" name="Alex" />
          <Card text="Best AI video generator 🔥" name="Sarah" />
          <Card text="Fast & high quality 💎" name="Omar" />
        </div>
      </section>

      {/* 💎 CTA */}
      <section className="px-8 pb-24">
        <div className="glass p-10 rounded-3xl flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Upgrade to Pro 🚀</h2>
            <p className="text-gray-400">
              Faster queue, more credits, premium models
            </p>
          </div>

          <Link
            href="/pricing"
            className="btn-primary mt-6 md:mt-0 px-8 py-3 rounded-xl"
          >
            View Plans
          </Link>
        </div>
      </section>

    </main>
  );
}

/* 🔹 Feature */
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

/* 🔹 Testimonial */
function Card({ text, name }: any) {
  return (
    <div className="glass p-6 rounded-2xl">
      <p className="text-gray-300">"{text}"</p>
      <p className="text-gray-500 mt-4">— {name}</p>
    </div>
  );
}