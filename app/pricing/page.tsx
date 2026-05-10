"use client";

import { useState, useEffect } from "react";

const PLANS = {
  pro: {
    usd: 15,
    usdt: 15,
    dzd: 4500,
    credits: 150,
    color: "cyan",
  },
  premium: {
    usd: 25,
    usdt: 25,
    dzd: 7500,
    credits: 500,
    color: "purple",
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

  const [copied, setCopied] =
    useState<"usdt" | "rip" | null>(null);

  const [uploading, setUploading] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    fetch("/api/payment-info")
      .then((res) => res.json())
      .then((data) => {
        setPaymentInfo({
          rip: data?.rip || "YOUR_RIP_HERE",
          usdt: data?.usdt || "YOUR_USDT_ADDRESS",
        });
      });
  }, []);

  const copy = (text: string, type: "usdt" | "rip") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const goToCheckout = async (
    plan: "pro" | "premium"
  ) => {
    try {
      setLoadingCheckout(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();

      if (!data?.url) {
        alert("❌ Checkout failed");
        return;
      }

      window.location.href = data.url;
    } catch {
      alert("❌ Checkout error");
    } finally {
      setLoadingCheckout(false);
    }
  };

  const planData =
    selectedPlan ? PLANS[selectedPlan] : null;

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

      <h1 className="text-5xl font-bold mb-4">
        Create AI Videos 🚀
      </h1>

      <p className="text-gray-400 mb-12">
        No free plan. Real power starts here.
      </p>

      {/* TRY */}
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
          highlight={false}
          onClick={() => setSelectedPlan("pro")}
        />

        <Card
          title="Premium"
          price="$25"
          sub="500 credits"
          highlight={true}
          onClick={() => setSelectedPlan("premium")}
        />

      </div>

      {/* MODAL */}
      {selectedPlan && planData && (
        <Modal>

          <h2 className="text-xl font-bold text-center mb-2">
            Complete Payment
          </h2>

          <p className="text-center text-gray-400 mb-6 text-sm">
            {planData.usd} USD • {planData.usdt} USDT • {planData.dzd} DZD
          </p>

          <button
            onClick={() =>
              goToCheckout(selectedPlan)
            }
            disabled={loadingCheckout}
            className="w-full bg-cyan-500 py-3 rounded-xl text-black font-bold mb-4"
          >
            {loadingCheckout
              ? "Processing..."
              : "💳 Pay with Card"}
          </button>

          {/* PAYMENT METHODS */}
          <div className="grid grid-cols-2 gap-4">

            <PaymentBox
              title="USDT"
              value={paymentInfo.usdt}
              active={method === "USDT"}
              onClick={() => setMethod("USDT")}
              copied={copied === "usdt"}
              onCopy={() =>
                copy(paymentInfo.usdt, "usdt")
              }
              color="green"
            />

            <PaymentBox
              title="BaridiMob"
              value={paymentInfo.rip}
              active={method === "BARIDIMOB"}
              onClick={() => setMethod("BARIDIMOB")}
              copied={copied === "rip"}
              onCopy={() =>
                copy(paymentInfo.rip, "rip")
              }
              color="blue"
            />

          </div>

          <button
            onClick={() => {
              setSelectedPlan(null);
              setMethod(null);
            }}
            className="mt-4 text-gray-400 w-full"
          >
            Cancel
          </button>

        </Modal>
      )}

    </main>
  );
}

/* CARD */
function Card({
  title,
  price,
  sub,
  onClick,
  highlight,
}: any) {
  return (
    <div
      onClick={onClick}
      className={`p-8 rounded-2xl border cursor-pointer bg-white/5 ${
        highlight
          ? "border-purple-500"
          : "border-white/10"
      }`}
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-3xl font-bold">{price}</p>
      <p className="text-gray-400">{sub}</p>

      <button className="mt-4 w-full bg-white text-black py-3 rounded-xl">
        Choose
      </button>
    </div>
  );
}

/* PAYMENT BOX */
function PaymentBox({
  title,
  value,
  active,
  onClick,
  copied,
  onCopy,
  color,
}: any) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer ${
        active
          ? "border-white bg-white/10"
          : "border-white/10"
      }`}
    >
      <p className="text-sm mb-2">{title}</p>

      <p className="text-xs break-all">{value}</p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        className="mt-2 w-full bg-white/10 py-1 text-xs rounded"
      >
        {copied ? "Copied ✔" : "Copy"}
      </button>
    </div>
  );
}

/* MODAL */
function Modal({ children }: any) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
      <div className="bg-[#0f0f0f] p-8 rounded-2xl w-full max-w-md border border-white/10">
        {children}
      </div>
    </div>
  );
}