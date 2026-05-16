"use client";

import { useState, useRef } from "react";

export default function AIVideo() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const generateVideo = async () => {
    try {
      stopPolling(); // 🔥 مهم جداً

      setLoading(true);
      setError(null);
      setVideoUrl(null);
      setStatus("starting...");

      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok || !data?.jobId) {
        throw new Error(data?.error || "Failed to create job");
      }

      const jobId = data.jobId;

      let attempts = 0;
      const MAX_ATTEMPTS = 40; // ~2 minutes

      intervalRef.current = setInterval(async () => {
        try {
          attempts++;

          const check = await fetch(`/api/job/${jobId}`);
          const job = await check.json();

          setStatus(job.status);

          // ✅ SUCCESS
          if (job.status === "completed") {
            setVideoUrl(job.resultUrl);
            stopPolling();
            setLoading(false);
          }

          // ❌ FAILED
          if (job.status === "failed") {
            stopPolling();
            setLoading(false);
            setError("Video generation failed ❌");
          }

          // ⏱ TIMEOUT
          if (attempts > MAX_ATTEMPTS) {
            stopPolling();
            setLoading(false);
            setError("Timeout: AI is taking too long ⏳");
          }

        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);

    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-2">
        🎬 AI Video Generator
      </h1>

      <p className="text-gray-400 mb-6">
        Generate videos from text using AI
      </p>

      {/* INPUT */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your video..."
        className="w-full p-4 rounded-xl bg-black border border-white/10 focus:outline-none focus:border-cyan-500"
      />

      {/* BUTTON */}
      <button
        onClick={generateVideo}
        disabled={loading || !prompt}
        className="mt-4 w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 py-3 rounded-xl text-black font-bold transition"
      >
        {loading ? "⏳ Generating..." : "🚀 Generate Video"}
      </button>

      {/* STATUS */}
      <div className="mt-4 text-sm text-gray-400">
        Status: <span className="text-white">{status}</span>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">
            AI is generating your video...
          </p>
        </div>
      )}

      {/* VIDEO */}
      {videoUrl && (
        <div className="mt-6">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-xl border border-white/10"
          />
        </div>
      )}

    </div>
  );
}