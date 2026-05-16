// lib/config.ts

//////////////////////////////////////////////////
// 💳 PLANS CONFIG (المصدر الوحيد للحقيقة)
//////////////////////////////////////////////////

export const PLANS = {
  free: {
    name: "Free",
    credits: 10,
    price: 0,
    isPro: false,
  },

  pro: {
    name: "Pro",
    credits: 120,
    price: 15, // USD
    isPro: true,
  },

  premium: {
    name: "Premium",
    credits: 320,
    price: 25, // USD
    isPro: true,
  },
} as const;

export type PlanType = keyof typeof PLANS;

//////////////////////////////////////////////////
// 🎯 AI COSTS (مكان واحد فقط)
//////////////////////////////////////////////////

export const AI_COSTS = {
  image: 1,
  voice: 3,
  video: 30,
} as const;

export type AIType = keyof typeof AI_COSTS;

//////////////////////////////////////////////////
// 🍋 LEMON SQUEEZY CONFIG
//////////////////////////////////////////////////

export const LEMON_VARIANTS = {
  pro: process.env.LEMON_SQUEEZY_PRO_VARIANT_ID,
  premium: process.env.LEMON_SQUEEZY_PREMIUM_VARIANT_ID,
};

//////////////////////////////////////////////////
// 🔐 SECURITY / LIMITS
//////////////////////////////////////////////////

export const LIMITS = {
  maxPromptLength: 1000,
  minPromptLength: 3,
  maxTextLength: 2000,
};

//////////////////////////////////////////////////
// ⚡ FEATURE FLAGS (مستقبلاً)
//////////////////////////////////////////////////

export const FEATURES = {
  enableVideoQueue: true,
  enableVoice: true,
  enableImage: true,
};

//////////////////////////////////////////////////
// 🧠 HELPER FUNCTIONS
//////////////////////////////////////////////////

// ✅ get credits by plan
export function getPlanCredits(plan: PlanType) {
  return PLANS[plan]?.credits || 0;
}

// ✅ check if user is pro
export function isProPlan(plan: PlanType) {
  return PLANS[plan]?.isPro || false;
}

// ✅ get AI cost
export function getAICost(type: AIType) {
  return AI_COSTS[type];
}

// ✅ map variant → plan
export function getPlanFromVariant(variantId: string | number | null) {
  if (!variantId) return null;

  if (variantId == LEMON_VARIANTS.pro) return "pro";
  if (variantId == LEMON_VARIANTS.premium) return "premium";

  return null;
}