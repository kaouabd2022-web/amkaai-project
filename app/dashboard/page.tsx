import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UserButton } from "@clerk/nextjs";
import Notifications from "@/components/notifications";

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  let user = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        clerkId: userId,
        credits: 10,
        plan: "FREE",
      },
    });
  }

  const images = await db.image.count({
    where: { userId: user.clerkId },
  });

  const videos = await db.video.count({
    where: { userId: user.clerkId },
  });

  const voices = await db.voice.count({
    where: { userId: user.clerkId },
  });

  const payments = await db.payment.findMany();
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const recentImages = await db.image.findMany({
    where: { userId: user.clerkId },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const maxCredits =
    user.plan === "FREE" ? 10 :
    user.plan === "PRO" ? 100 :
    300;

  const used = maxCredits - user.credits;
  const percent = Math.min((used / maxCredits) * 100, 100);

  const isPro = user.plan !== "FREE";

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-10">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="flex items-center gap-4">
          <Notifications />
          <UserButton />
        </div>
      </div>

      {/* PLAN */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="bg-white/5 p-4 rounded-xl">
          Plan:
          <span className={`ml-2 font-bold ${
            isPro ? "text-cyan-400" : "text-gray-400"
          }`}>
            {user.plan}
          </span>
        </div>

        <div className="bg-white/5 p-4 rounded-xl">
          Credits:
          <span className="ml-2 text-green-400 font-bold">
            {user.credits}
          </span>
        </div>

        {isPro ? (
          <form action="/api/billing" method="POST">
            <button className="bg-yellow-500 px-5 py-2 rounded-xl text-black font-bold">
              Manage Subscription 💳
            </button>
          </form>
        ) : (
          <a
            href="/pricing"
            className="bg-cyan-500 px-5 py-2 rounded-xl text-black font-bold"
          >
            Upgrade 🚀
          </a>
        )}
      </div>

      {/* USAGE */}
      <div className="bg-white/5 p-4 rounded-xl max-w-md">
        <div className="flex justify-between text-sm mb-2">
          <span>Usage</span>
          <span>{used}/{maxCredits}</span>
        </div>

        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`${percent > 80 ? "bg-red-500" : "bg-cyan-500"} h-full`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card title="Images" value={images} />
        <Card title="Videos" value={videos} />
        <Card title="Voices" value={voices} />

        <div className="bg-green-500/20 p-6 rounded-xl">
          <p>Total Revenue</p>
          <p className="text-3xl font-bold">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* HISTORY */}
      <div>
        <h2 className="text-xl mb-4">Your Images</h2>

        {recentImages.length === 0 ? (
          <p className="text-gray-400">No images yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentImages.map((img) => (
              <img key={img.id} src={img.url} className="rounded-xl" />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-white/5 p-6 rounded-xl">
      <p className="text-gray-400">{title}</p>
      <p className="text-3xl">{value}</p>
    </div>
  );
}