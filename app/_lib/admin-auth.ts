import "server-only";

import { headers } from "next/headers";
import { auth } from "@/auth";

export async function hasAdminSession(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return Boolean(session?.user);
  } catch {
    return false;
  }
}
