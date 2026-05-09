"use client";

import { useState, useEffect } from "react";

type Plan = "pro" | "premium";
type Method = "USDT" | "BARIDIMOB";
type Color = "green" | "blue";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentInfo, setPaymentInfo] = useState({ rip: "", usdt: "" });
  const [method, setMethod] = useState<Method | null>(null);
  const [copied, setCopied] = useState<"usdt" | "rip" | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    fetch("/api/payment-info")
      .then((res) => res.json())
      .then((data) => {
        setPaymentInfo({
          rip: data?.rip || "YOUR_RIP_HERE",
          usdt: data?.usdt || "YOUR_USDT_ADDRESS",
        });
      })
      .catch(() => {
        setPaymentInfo({
          rip: "YOUR_RIP_HERE",
          usdt: "YOUR_USDT_ADDRESS",
        });
      });
  }, []);

  const copy = (text: string, type: "usdt" | "rip") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const goToCheckout = async (plan: Plan) => {
    try {
      setLoadingCheckout(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!data?.url) {
        alert("❌ Payment error");
        return;
      }

      window.location.href = data.url;
    } catch {
      alert("❌ Checkout failed");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const priceText =
    selectedPlan === "pro"
      ? "15 USD • 15 USDT • 4500 DZD"
      : "25 USD • 25 USDT • 7500 DZD";

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

      <h1 className="text-5xl font-bold mb-4 text-center">
        Create AI Videos 🚀
      </h1>

      <p className="text-gray-400 mb-10 text-center">
        No free plan. Real power starts here.
      </p>

      <button
        onClick={() => (window.location.href = "/dashboard")}
        className="mb-10 bg-white text-black px-6 py-3 rounded-xl font-bold"
      >
        🎬 Try 1 Free Video
      </button>

      {/* PLANS */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">

        <Card
          title="Pro"
          price="$15"
          sub="150 credits"
          onClick={() => setSelectedPlan("pro")}
        />

        <Card
          title="Premium"
          price="$25"
          sub="500 credits"
          onClick={() => setSelectedPlan("premium")}
        />

      </div>

      {/* MODAL */}
      {selectedPlan && (
        <Modal>

          <h2 className="text-xl font-bold text-center mb-2">
            Complete Payment
          </h2>

          <p className="text-center text-gray-400 mb-6 text-sm">
            {priceText}
          </p>

          {/* PAY BUTTON */}
          <button
            onClick={() => goToCheckout(selectedPlan)}
            disabled={loadingCheckout}
            className="w-full bg-cyan-500 py-3 rounded-xl text-black font-bold mb-4"
          >
            {loadingCheckout ? "Processing..." : "💳 Pay with Card"}
          </button>

          <p className="text-xs text-yellow-400 text-center mb-3">
            Or manual payment
          </p>

          <div className="grid grid-cols-2 gap-4">

            <PaymentBox
              active={method === "USDT"}
              onClick={() => setMethod("USDT")}
              title="USDT"
              value={paymentInfo.usdt}
              copied={copied === "usdt"}
              onCopy={(e) => {
                e.stopPropagation();
                copy(paymentInfo.usdt, "usdt");
              }}
              color="green"
            />

            <PaymentBox
              active={method === "BARIDIMOB"}
              onClick={() => setMethod("BARIDIMOB")}
              title="BaridiMob"
              value={paymentInfo.rip}
              copied={copied === "rip"}
              onCopy={(e) => {
                e.stopPropagation();
                copy(paymentInfo.rip, "rip");
              }}
              color="blue"
            />

          </div>

        </Modal>
      )}

    </main>
  );
}

/* ================= PAYMENT BOX ================= */

function PaymentBox({
  active,
  onClick,
  title,
  value,
  copied,
  onCopy,
  color,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  value: string;
  copied: boolean;
  onCopy: (e: React.MouseEvent) => void;
  color: Color;
}) {
  const styles = {
    green: "border-green-500 bg-green-500/20",
    blue: "border-blue-500 bg-blue-500/20",
  } as const;

  const colorClass = styles[color];

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl text-center cursor-pointer border transition ${
        active ? colorClass : "border-white/10"
      }`}
    >
      <p className="text-sm mb-2">{title}</p>
      <p className="text-xs break-all mb-2">{value}</p>

      <button
        onClick={onCopy}
        className="w-full bg-white/10 py-1 rounded text-xs"
      >
        {copied ? "Copied ✔" : "Copy"}
      </button>
    </div>
  );
}

/* ================= CARD ================= */

function Card({
  title,
  price,
  sub,
  onClick,
}: {
  title: string;
  price: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-3xl font-bold mb-1">{price}</p>
      <p className="text-gray-400 text-sm mb-6">{sub}</p>

      <button
        onClick={onClick}
        className="w-full bg-white text-black py-3 rounded-xl font-bold"
      >
        Choose
      </button>
    </div>
  );
}

/* ================= MODAL ================= */

function Modal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] p-8 rounded-2xl w-full max-w-md border border-white/10">
        {children}
      </div>
    </div>
  );
}