"use client";

import { useState } from "react";
import VideoPrompt from "./VideoPrompt";
import VideoLoader from "./VideoLoader";
import VideoError from "./VideoError";
import VideoPlayer from "./VideoPlayer";

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateVideo = async () => {
    try {
      setLoading(true);
      setError(null);
      setVideoUrl(null);
      setStatus("starting...");

      // 🎯 CREATE JOB
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

      // 🔁 POLLING
      const interval = setInterval(async () => {
        try {
          const check = await fetch(`/api/job/${jobId}`);
          const job = await check.json();

          setStatus(job.status);

          if (job.status === "completed") {
            setVideoUrl(job.resultUrl);
            clearInterval(interval);
            setLoading(false);
          }

          if (job.status === "failed") {
            clearInterval(interval);
            setLoading(false);
            setError("Video generation failed ❌");
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

      {/* PROMPT */}
      <VideoPrompt prompt={prompt} setPrompt={setPrompt} />

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
      <VideoError error={error} />

      {/* LOADER */}
      {loading && <VideoLoader status={status} />}

      {/* RESULT */}
      <VideoPlayer url={videoUrl} />

    </div>
  );
}