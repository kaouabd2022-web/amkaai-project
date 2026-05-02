"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const images = [
  "/ai1.png",
  "/ai2.png",
  "/ai3.png",
];

export default function AIGallery() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section className="px-8 py-24">

      {/* 🔥 Title */}
      <h2 className="text-4xl font-bold text-center mb-14 gradient-text">
        AI Generated Examples ✨
      </h2>

      {/* 🧠 Grid */}
      <div className="grid md:grid-cols-3 gap-8">

        {images.map((src, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative cursor-pointer group"
            onClick={() => setSelected(src)}
          >
            {/* Image */}
            <div className="overflow-hidden rounded-2xl">
              <Image
                src={src}
                alt="AI Example"
                width={500}
                height={500}
                className="
                  object-cover w-full h-[260px]
                  group-hover:scale-110
                  transition duration-500
                "
              />
            </div>

            {/* Overlay */}
            <div className="
              absolute inset-0
              bg-gradient-to-t from-black/80 via-black/30 to-transparent
              opacity-0 group-hover:opacity-100
              transition
              rounded-2xl
              flex items-center justify-center
            ">
              <span className="text-white text-sm tracking-wide">
                View Preview
              </span>
            </div>

          </motion.div>
        ))}

      </div>

      {/* 💎 Modal Preview */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-5xl w-full p-4"
          >
            <Image
              src={selected}
              alt="Preview"
              width={1200}
              height={800}
              className="rounded-2xl w-full shadow-2xl"
            />
          </motion.div>
        </div>
      )}

    </section>
  );
}