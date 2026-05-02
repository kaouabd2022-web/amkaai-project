"use client";

import { useState } from "react";

const styles = [
  { name: "Cinematic", value: "cinematic lighting, dramatic" },
  { name: "Anime", value: "anime style, vibrant colors" },
  { name: "Realistic", value: "ultra realistic, 4k detailed" },
];

export default function AIVideoPage() {
  const [prompt, setPrompt] = useState("");
  const [video, setVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [position, setPosition] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [style, setStyle] = useState(styles[0].value);
  const [quality, setQuality] = useState("medium");

  const formatTime = (sec: number) => {
    if (sec < 60) return `~${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `~${m}m ${s}s`;
  };

  const generateVideo = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setVideo(null);
      setStatus("Starting...");
      setProgress(5);
      setPosition(null);
      setEstimatedTime(null);

      const finalPrompt = `${prompt}, ${style}`;

      const res = await fetch("/api/video", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ prompt: finalPrompt, quality }),
      });

      if (res.status === 403) {
        alert("❌ Not enough credits");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setJobId(data.jobId);

      let done = false;
      let fakeProgress = 10;

      while (!done) {
        await new Promise((r) => setTimeout(r, 2000));

        fakeProgress += Math.random() * 6;
        if (fakeProgress > 95) fakeProgress = 95;
        setProgress(Math.floor(fakeProgress));

        const check = await fetch("/api/video/status", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ jobId: data.jobId }),
        });

        const resData = await check.json();

        if (resData.position !== undefined) {
          setPosition(resData.position);
        }

        if (resData.estimatedTime !== undefined) {
          setEstimatedTime(resData.estimatedTime);
        }

        if (resData.status === "pending") {
          setStatus("Waiting in queue...");
        }

        if (resData.status === "processing") {
          setStatus("Generating video...");
          setPosition(null);
        }

        if (resData.status === "cancelled") {
          setStatus("Cancelled ❌");
          setLoading(false);
          setProgress(0);
          return;
        }

        if (resData.status === "done") {
          setVideo(resData.video);
          setStatus("Done ✅");
          setProgress(100);
          done = true;
        }
      }

    } catch (err) {
      console.error(err);
      alert("Error generating video");
    } finally {
      setLoading(false);
    }
  };

  const cancelJob = async () => {
    if (!jobId) return;

    await fetch("/api/video/cancel", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ jobId }),
    });

    setStatus("Cancelled ❌");
    setLoading(false);
    setProgress(0);
  };

  const handleUpgrade = async () => {
    setStatus("Upgrading... 🚀");

    await fetch("/api/upgrade", {
      method: "POST",
    });

    setStatus("Priority activated ⚡");
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">🎬 AI Video Generator</h1>

      <textarea
        placeholder="Describe your video..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-4 rounded-xl bg-gray-900 mb-6"
      />

      {/* STYLE */}
      <div className="mb-6">
        <p className="mb-2 text-gray-400">Style</p>
        <div className="flex gap-3 flex-wrap">
          {styles.map((s) => (
            <button
              key={s.name}
              onClick={() => setStyle(s.value)}
              className={`px-4 py-2 rounded-xl border ${
                style === s.value
                  ? "bg-cyan-500 text-black"
                  : "border-gray-700"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* QUALITY */}
      <div className="mb-6">
        <p className="mb-2 text-gray-400">Quality</p>
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          className="bg-gray-900 p-3 rounded-xl"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* BUTTONS */}
      <div className="flex gap-4">
        <button
          onClick={generateVideo}
          disabled={loading}
          className="bg-cyan-500 px-6 py-3 rounded-xl text-black font-semibold"
        >
          {loading ? "Processing..." : "Generate Video"}
        </button>

        {loading && (
          <button
            onClick={cancelJob}
            className="bg-red-500 px-6 py-3 rounded-xl"
          >
            Cancel
          </button>
        )}
      </div>

      {/* QUEUE + UPGRADE */}
      {position !== null && (
        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl max-w-xl">
          <p className="text-yellow-400 mb-1">
            ⏳ Position: {position}
          </p>

          {estimatedTime !== null && (
            <p className="text-gray-300">
              Estimated wait: {formatTime(estimatedTime)}
            </p>
          )}

          <button
            onClick={handleUpgrade}
            className="mt-3 bg-cyan-500 text-black px-4 py-2 rounded-lg font-semibold"
          >
            🚀 Upgrade & Skip Queue
          </button>
        </div>
      )}

      {/* PROGRESS */}
      {loading && (
        <div className="mt-6 max-w-xl">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>{status}</span>
            <span>{progress}%</span>
          </div>

          <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
            <div
              className="bg-cyan-500 h-3 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* RESULT */}
      {video && (
        <div className="mt-10">
          <video controls className="w-full rounded-xl mb-4">
            <source src={video} type="video/mp4" />
          </video>

          <a
            href={video}
            download
            className="bg-white text-black px-4 py-2 rounded"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}