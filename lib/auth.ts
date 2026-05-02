import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import type { Session } from "next-auth";

export async function getCurrentUser() {
  const session: Session | null = await getServerSession(authOptions);

  if (!session?.user) return null;

  return session.user;
}