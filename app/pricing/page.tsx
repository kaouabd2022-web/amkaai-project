"use client";

import { useState, useEffect } from "react";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<"pro" | "premium" | null>(null);
  const [paymentInfo, setPaymentInfo] = useState({ rip: "", usdt: "" });
  const [method, setMethod] = useState<"USDT" | "BARIDIMOB" | null>(null);
  const [copied, setCopied] = useState<"usdt" | "rip" | null>(null);
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

  const goToCheckout = async (plan: "pro" | "premium") => {
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
        alert("❌ Stripe error");
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

      <h1 className="text-5xl font-bold mb-4">Create AI Videos 🚀</h1>
      <p className="text-gray-400 mb-12">No free plan. Real power starts here.</p>

      {/* 🔥 TRY BUTTON */}
      <button
        onClick={() => window.location.href = "/dashboard"}
        className="mb-10 bg-white text-black px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
      >
        🎬 Try 1 Free Video
      </button>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">

        <Card
          title="Pro"
          highlight
          price="$15"
          sub="15 USDT • 4500 DZD"
          onClick={() => setSelectedPlan("pro")}
        >
          <li>150 credits</li>
          <li>Fast generation</li>
        </Card>

        <Card
          title="Premium"
          price="$25"
          sub="25 USDT • 7500 DZD"
          onClick={() => setSelectedPlan("premium")}
        >
          <li>500 credits</li>
          <li>Ultra fast</li>
        </Card>

      </div>

      {/* 💰 PAYMENT */}
      {selectedPlan && (
        <Modal>

          <h2 className="text-xl font-bold text-center mb-2">
            Complete Payment
          </h2>

          <p className="text-center text-gray-400 mb-6 text-sm">
            {priceText}
          </p>

          {/* 💳 STRIPE */}
          <button
            onClick={() => goToCheckout(selectedPlan)}
            disabled={loadingCheckout}
            className="w-full bg-cyan-500 py-3 rounded-xl text-black font-bold mb-4"
          >
            {loadingCheckout ? "Processing..." : "💳 Pay with Card"}
          </button>

          {!method && (
            <p className="text-xs text-yellow-400 text-center mb-2">
              Select payment method 👇
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">

            {/* USDT */}
            <PaymentBox
              active={method === "USDT"}
              onClick={() => setMethod("USDT")}
              title="USDT (TRC20)"
              value={paymentInfo.usdt}
              copied={copied === "usdt"}
              onCopy={(e: any) => {
                e.stopPropagation();
                copy(paymentInfo.usdt, "usdt");
              }}
              color="green"
            />

            {/* BARIDIMOB */}
            <PaymentBox
              active={method === "BARIDIMOB"}
              onClick={() => setMethod("BARIDIMOB")}
              title="BaridiMob"
              value={paymentInfo.rip}
              copied={copied === "rip"}
              onCopy={(e: any) => {
                e.stopPropagation();
                copy(paymentInfo.rip, "rip");
              }}
              color="blue"
            />

          </div>

          {/* 📸 Upload */}
          <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/10">
            <p className="text-sm mb-2 text-center">
              📸 Upload Screenshot
            </p>

            <input
              type="file"
              accept="image/*"
              disabled={!method}
              className="text-xs mb-3 w-full"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !method) return;

                setUploading(true);

                try {
                  const formData = new FormData();
                  formData.append("file", file);

                  const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                  });

                  const uploadData = await uploadRes.json();

                  await fetch("/api/upload-payment", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      plan: selectedPlan.toUpperCase(),
                      method,
                      amount: selectedPlan === "pro" ? 15 : 25,
                      screenshotUrl: uploadData.url,
                    }),
                  });

                  window.location.href = "/billing/pending";

                } catch {
                  alert("❌ Upload failed");
                }

                setUploading(false);
              }}
            />

            {uploading && (
              <p className="text-xs text-yellow-400 text-center">
                Uploading...
              </p>
            )}
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

/* 🔹 Payment Box */
function PaymentBox({ active, onClick, title, value, copied, onCopy, color }: any) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl text-center cursor-pointer border ${
        active
          ? `border-${color}-500 bg-${color}-500/20`
          : "border-white/10"
      }`}
    >
      <p className="text-sm mb-2">{title}</p>

      {value && (
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${value}`}
          className="mx-auto mb-2"
        />
      )}

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

/* CARD */
function Card({ title, price, sub, children, onClick, highlight }: any) {
  return (
    <div className={`p-8 rounded-2xl border ${
      highlight ? "border-cyan-500" : "border-white/10"
    } bg-white/5`}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-3xl font-bold mb-2">{price}</p>
      {sub && <p className="text-gray-400 text-sm mb-4">{sub}</p>}
      <ul className="text-gray-300 space-y-2 mb-6">{children}</ul>

      <button
        onClick={onClick}
        className="w-full bg-white text-black py-3 rounded-xl font-bold hover:scale-105 transition"
      >
        Choose
      </button>
    </div>
  );
}

/* MODAL */
function Modal({ children }: any) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#0f0f0f] p-8 rounded-2xl w-full max-w-md border border-white/10">
        {children}
      </div>
    </div>
  );
}