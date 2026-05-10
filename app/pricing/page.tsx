"use client";

import { useState, useEffect } from "react";

const PLANS = {
  pro: {
    usd: 15,
    usdt: 15,
    dzd: 4500,
    credits: 150,
  },
  premium: {
    usd: 25,
    usdt: 25,
    dzd: 7500,
    credits: 500,
  },
};

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] =
    useState<"pro" | "premium" | null>(null);

  const [paymentInfo, setPaymentInfo] = useState({
    rip: "",
    usdt: "",
  });

  const [method, setMethod] =
    useState<"USDT" | "BARIDIMOB" | null>(null);

  const [loadingCheckout, setLoadingCheckout] =
    useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payment-info")
      .then((res) => res.json())
      .then((data) => {
        setPaymentInfo({
          rip: data?.rip || "N/A",
          usdt: data?.usdt || "N/A",
        });
      })
      .catch(() => {
        setPaymentInfo({
          rip: "N/A",
          usdt: "N/A",
        });
      });
  }, []);

  const goToCheckout = async (plan: "pro" | "premium") => {
    try {
      setLoadingCheckout(true);
      setError(null);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Checkout failed");
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Checkout error");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const plan = selectedPlan ? PLANS[selectedPlan] : null;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

      <h1 className="text-5xl font-bold mb-3 text-center">
        AI Video SaaS 🚀
      </h1>

      <p className="text-gray-400 mb-10 text-center">
        Unlock premium AI generation tools
      </p>

      {/* FREE TEST */}
      <button
        onClick={() => (window.location.href = "/dashboard")}
        className="mb-10 bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
      >
        🎬 Try Free Dashboard
      </button>

      {/* PLANS */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">

        <PlanCard
          title="Pro"
          price="$15"
          credits="150 credits"
          onClick={() => setSelectedPlan("pro")}
        />

        <PlanCard
          title="Premium"
          price="$25"
          credits="500 credits"
          highlight
          onClick={() => setSelectedPlan("premium")}
        />

      </div>

      {/* MODAL */}
      {selectedPlan && plan && (
        <Modal>

          <h2 className="text-xl font-bold text-center mb-2">
            Complete Payment
          </h2>

          <p className="text-center text-gray-400 mb-6 text-sm">
            {plan.usd} USD • {plan.usdt} USDT • {plan.dzd} DZD
          </p>

          {/* ERROR */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 text-sm p-2 rounded mb-3">
              {error}
            </div>
          )}

          {/* CHECKOUT */}
          <button
            onClick={() => goToCheckout(selectedPlan)}
            disabled={loadingCheckout}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 py-3 rounded-xl text-black font-bold transition"
          >
            {loadingCheckout
              ? "Processing..."
              : "💳 Pay with Card"}
          </button>

          {/* INFO */}
          <div className="grid grid-cols-2 gap-4 mt-5">

            <PaymentBox
              title="USDT"
              value={paymentInfo.usdt}
            />

            <PaymentBox
              title="BaridiMob"
              value={paymentInfo.rip}
            />

          </div>

          {/* CLOSE */}
          <button
            onClick={() => {
              setSelectedPlan(null);
              setMethod(null);
              setError(null);
            }}
            className="mt-5 text-gray-400 w-full"
          >
            Close
          </button>

        </Modal>
      )}

    </main>
  );
}

/* ================= PLAN CARD ================= */
function PlanCard({
  title,
  price,
  credits,
  highlight,
  onClick,
}: any) {
  return (
    <div
      onClick={onClick}
      className={`p-8 rounded-2xl cursor-pointer border transition hover:scale-[1.02] ${
        highlight
          ? "border-cyan-500 bg-cyan-500/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-3xl font-bold mt-2">{price}</p>
      <p className="text-gray-400 mt-1">{credits}</p>

      <button className="mt-5 w-full bg-white text-black py-3 rounded-xl font-bold">
        Choose
      </button>
    </div>
  );
}

/* ================= PAYMENT BOX ================= */
function PaymentBox({ title, value }: any) {
  const copy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="p-4 border border-white/10 rounded-xl bg-white/5">
      <p className="text-sm mb-2">{title}</p>

      <p className="text-xs break-all text-gray-300">{value}</p>

      <button
        onClick={copy}
        className="mt-2 w-full bg-white/10 py-1 text-xs rounded hover:bg-white/20"
      >
        Copy
      </button>
    </div>
  );
}

/* ================= MODAL ================= */
function Modal({ children }: any) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] p-8 rounded-2xl w-full max-w-md border border-white/10">
        {children}
      </div>
    </div>
  );
}