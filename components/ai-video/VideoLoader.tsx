"use client";

export default function VideoLoader({ status }: any) {
  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">
        {status || "Generating video..."}
      </p>
    </div>
  );
}