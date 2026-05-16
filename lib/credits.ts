// lib/credits.ts

import { db } from "@/lib/db";
import { AI_COSTS, AIType } from "@/lib/config";

//////////////////////////////////////////////////
// 🧠 TYPES
//////////////////////////////////////////////////

type UseCreditsOptions = {
  reference?: string; // jobId / requestId
};

//////////////////////////////////////////////////
// 🚀 MAIN FUNCTION (SMART + SAFE)
//////////////////////////////////////////////////

export async function useCredits(
  userId: string,
  type: AIType,
  options?: UseCreditsOptions
) {
  const cost = AI_COSTS[type];

  if (!cost) {
    throw new Error("Invalid AI type");
  }

  const reference = options?.reference || null;

  const result = await db.$transaction(async (tx) => {
    //////////////////////////////////////////////////
    // 💸 SAFE DEDUCTION (NO NEGATIVE)
    //////////////////////////////////////////////////
    const update = await tx.user.updateMany({
      where: {
        id: userId,
        credits: {
          gte: cost,
        },
      },
      data: {
        credits: {
          decrement: cost,
        },
      },
    });

    if (update.count === 0) {
      throw new Error("Not enough credits");
    }

    //////////////////////////////////////////////////
    // 📊 USAGE LOG (PENDING for refund system)
    //////////////////////////////////////////////////
    const usage = await tx.usage.create({
      data: {
        userId,
        type,
        cost,
        status: "pending",   // 🔥 مهم
        refunded: false,
        reference,
      },
    });

    //////////////////////////////////////////////////
    // 🔎 GET UPDATED BALANCE
    //////////////////////////////////////////////////
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    return {
      usage,
      credits: user?.credits ?? 0,
    };
  });

  return {
    success: true,
    cost,
    usageId: result.usage.id,
    reference,
    remainingCredits: result.credits,
  };
}

//////////////////////////////////////////////////
// ✅ MARK SUCCESS (بعد نجاح AI)
//////////////////////////////////////////////////

export async function markUsageSuccess(reference: string) {
  if (!reference) return;

  await db.usage.updateMany({
    where: {
      reference,
      status: "pending",
    },
    data: {
      status: "completed",
    },
  });
}

//////////////////////////////////////////////////
// 💸 REFUND SYSTEM (SMART)
//////////////////////////////////////////////////

export async function refundCredits(reference: string) {
  if (!reference) {
    throw new Error("Missing reference for refund");
  }

  return await db.$transaction(async (tx) => {
    //////////////////////////////////////////////////
    // 🔎 FIND USAGE
    //////////////////////////////////////////////////
    const usage = await tx.usage.findFirst({
      where: { reference },
    });

    if (!usage) {
      throw new Error("Usage not found");
    }

    //////////////////////////////////////////////////
    // 🛑 PREVENT DOUBLE REFUND
    //////////////////////////////////////////////////
    if (usage.refunded) {
      return { skipped: true };
    }

    //////////////////////////////////////////////////
    // 💸 REFUND CREDITS
    //////////////////////////////////////////////////
    await tx.user.update({
      where: { id: usage.userId },
      data: {
        credits: {
          increment: usage.cost,
        },
      },
    });

    //////////////////////////////////////////////////
    // 🧾 UPDATE USAGE
    //////////////////////////////////////////////////
    await tx.usage.update({
      where: { id: usage.id },
      data: {
        refunded: true,
        status: "failed",
      },
    });

    return {
      success: true,
      refundedCredits: usage.cost,
    };
  });
}

//////////////////////////////////////////////////
// 🔍 HELPERS
//////////////////////////////////////////////////

export async function getUserCredits(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user) throw new Error("User not found");

  return user.credits;
}

export async function addCredits(userId: string, amount: number) {
  return await db.user.update({
    where: { id: userId },
    data: {
      credits: {
        increment: amount,
      },
    },
  });
}