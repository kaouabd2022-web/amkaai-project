"use client";

import { useEffect, useState } from "react";
import { UserButton } from "@clerk/nextjs";

type Payment = {
  id: string;
  userId: string;
  plan: string;
  amount: number;
  status: string;
  screenshotUrl?: string;
};

export default function AdminPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    const res = await fetch("/api/admin/payments");
    const data = await res.json();
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const approve = async (id: string) => {
    await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: id }),
    });

    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "APPROVED" } : p
      )
    );
  };

  const reject = async (id: string) => {
    await fetch("/api/admin/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: id }),
    });

    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "REJECTED" } : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin PRO Dashboard 🧠</h1>
        <UserButton />
      </div>

      <h2 className="text-xl text-gray-400">Manual Payments</h2>

      {loading && <p>Loading...</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {payments.map((p) => (
          <div
            key={p.id}
            className="bg-white/5 p-4 rounded-2xl border border-white/10"
          >

            {/* 📸 Screenshot */}
            {p.screenshotUrl && (
              <img
                src={p.screenshotUrl}
                className="w-full h-48 object-cover rounded-xl mb-3"
              />
            )}

            {/* 📊 Info */}
            <div className="space-y-1 text-sm mb-3">
              <p>User: {p.userId}</p>
              <p>
                Plan: <span className="text-cyan-400">{p.plan}</span>
              </p>
              <p>Amount: {p.amount} DZD</p>

              <p>
                Status:{" "}
                <span
                  className={
                    p.status === "APPROVED"
                      ? "text-green-400"
                      : p.status === "REJECTED"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }
                >
                  {p.status}
                </span>
              </p>
            </div>

            {/* 🎯 ACTIONS */}
            {p.status === "PENDING" && (
              <div className="flex gap-3">

                <button
                  onClick={() => approve(p.id)}
                  className="flex-1 bg-green-500 py-2 rounded-xl text-black font-bold hover:scale-105 transition"
                >
                  Activate ✅
                </button>

                <button
                  onClick={() => reject(p.id)}
                  className="flex-1 bg-red-500 py-2 rounded-xl text-black font-bold hover:scale-105 transition"
                >
                  Reject ❌
                </button>

              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}