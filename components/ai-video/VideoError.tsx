"use client";

export default function VideoError({ error }: any) {
  if (!error) return null;

  return (
    <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">
      {error}
    </div>
  );
}