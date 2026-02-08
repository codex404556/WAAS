import configPromise from "@payload-config";
import { getPayload } from "payload";
import { auth } from "@clerk/nextjs/server";
import type { User } from "@/payload-types";

export const runtime = "nodejs";

export const GET = async () => {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: "users",
    where: { clerkId: { equals: userId } },
    limit: 1,
    depth: 0,
  });

  const doc = result.docs[0] as User | undefined;
  const id = doc?.id;
  if (!id) {
    return new Response("User not found", { status: 404 });
  }

  return Response.json({ id });
};
