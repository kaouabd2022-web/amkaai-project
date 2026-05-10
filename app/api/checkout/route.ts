import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { Paddle } from "@paddle/paddle-node-sdk";

if (!process.env.PADDLE_API_KEY) {
  throw new Error("Missing PADDLE_API_KEY");
}

const paddle = new Paddle(process.env.PADDLE_API_KEY);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user?.email || !user.customerId) {
      return NextResponse.json(
        { error: "User not ready" },
        { status: 400 }
      );
    }

    const { plan } = await req.json();

    const priceId =
      plan === "premium"
        ? process.env.PADDLE_PREMIUM_KEY
        : process.env.PADDLE_PRO_KEY;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId" },
        { status: 500 }
      );
    }

    const transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customerId: user.customerId,
      customData: { userId, plan },
    });

    const url = transaction?.checkout?.url;

    if (!url) {
      return NextResponse.json(
        { error: "Checkout failed" },
        { status: 500 }
      );
    }

    await db.abandonedCheckout.create({
      data: {
        userId,
        email: user.email,
        checkoutUrl: url,
        transactionId: transaction.id,
      },
    });

    return NextResponse.json({ url });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}