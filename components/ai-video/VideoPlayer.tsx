"use client";

export default function VideoPlayer({ url }: any) {
  if (!url) return null;

  return (
    <div className="mt-6">
      <video
        src={url}
        controls
        className="w-full rounded-xl border border-white/10"
      />
    </div>
  );
}