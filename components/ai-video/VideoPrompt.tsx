"use client";

export default function VideoPrompt({ prompt, setPrompt }: any) {
  return (
    <textarea
      value={prompt}
      onChange={(e) => setPrompt(e.target.value)}
      placeholder="Describe your video..."
      className="w-full p-4 rounded-xl bg-black border border-white/10 focus:outline-none focus:border-cyan-500"
    />
  );
}