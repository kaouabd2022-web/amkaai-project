"use client";

import Link from "next/link";

export default function Landing() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* 🚀 HERO */}
      <section className="text-center py-28 px-6">
        <h1 className="text-5xl md:text-7xl font-bold">
          Turn Ideas Into AI Content in Seconds ⚡
        </h1>

        <p className="mt-6 text-gray-400 text-lg">
          Generate Images, Voices & Videos instantly — no skills needed
        </p>

        {/* ⭐ Trust */}
        <p className="mt-4 text-gray-500 text-sm">
          Trusted by 1,000+ creators • Free plan available
        </p>

        {/* 🔥 CTA */}
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-10 py-5 text-lg rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-110 transition shadow-xl"
          >
            Start Free → Upgrade Later
          </Link>
        </div>

        {/* ⏳ Soft urgency */}
        <p className="mt-4 text-gray-500 text-sm">
          High demand — Free plan may be slower
        </p>
      </section>

      {/* 🎬 DEMO */}
      <section className="px-8 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-6">
          See it in action 🎬
        </h2>

        <div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-4">
          <video src="/demo.mp4" controls className="rounded-xl" />
        </div>
      </section>

      {/* 🖼️ AI RESULTS */}
      <section className="px-8 pb-24">
        <h2 className="text-3xl font-bold text-center mb-10">
          Real AI Results 🔥
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <img src="/ai1.png" className="rounded-xl hover:scale-105 transition" />
          <img src="/ai2.png" className="rounded-xl hover:scale-105 transition" />
          <img src="/ai3.png" className="rounded-xl hover:scale-105 transition" />
        </div>
      </section>

      {/* 💬 TESTIMONIALS */}
      <section className="px-8 pb-24">
        <h2 className="text-3xl font-bold text-center mb-10">
          What users say 💬
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <Card text="I made 10 videos in 5 minutes 😳" name="Alex" />
          <Card text="This is insanely fast 🔥" name="Sarah" />
          <Card text="Best AI tool I've used 💎" name="Omar" />
        </div>
      </section>

      {/* 💎 PRICING PUSH */}
      <section className="text-center pb-32">
        <h2 className="text-4xl font-bold mb-6">
          Start Free — Upgrade Anytime 🚀
        </h2>

        <Link
          href="/pricing"
          className="px-10 py-5 bg-white text-black rounded-2xl font-bold hover:scale-110 transition"
        >
          View Plans
        </Link>
      </section>

      {/* 🚀 STICKY CTA (Conversion Boost) */}
      <div className="fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur border-t border-white/10 p-4 flex justify-between items-center z-50">
        <p className="text-sm text-gray-300">
          Create your first AI content now 🚀
        </p>

        <Link
          href="/pricing"
          className="bg-cyan-500 px-6 py-2 rounded-xl text-black font-semibold hover:scale-105 transition"
        >
          Upgrade
        </Link>
      </div>

    </main>
  );
}

/* 💬 Testimonial Card */
function Card({ text, name }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
      <p className="text-gray-300">"{text}"</p>
      <p className="mt-4 text-sm text-gray-500">— {name}</p>
    </div>
  );
}