import configPromise from "@payload-config";
import { getPayload } from "payload";
import { auth, clerkClient } from "@clerk/nextjs/server";
import crypto from "crypto";
import type { User } from "@/payload-types";

export const resolvePayloadUser = async () => {
  const { userId } = await auth();
  if (!userId) {
    return { error: new Response("Unauthorized", { status: 401 }) };
  }

  const payload = await getPayload({ config: configPromise });
  const userResult = await payload.find({
    collection: "users",
    where: { clerkId: { equals: userId } },
    limit: 1,
    depth: 0,
  });

  let userDoc = userResult.docs[0] as User | undefined;
  let payloadUserId = userDoc?.id;
  if (!payloadUserId) {
    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const primaryEmail =
      clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
      )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      return { error: new Response("Missing email for Clerk user", { status: 400 }) };
    }

    const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
    const randomPassword = crypto.randomBytes(24).toString("hex");

    const created = await payload.create({
      collection: "users",
      data: {
        name: name || primaryEmail,
        email: primaryEmail,
        avatar: clerkUser.imageUrl || "",
        clerkId: clerkUser.id,
        role: "user",
        password: randomPassword,
      },
    });

    userDoc = created as User | undefined;
    payloadUserId = userDoc?.id;
  }

  if (!payloadUserId) {
    return { error: new Response("User not found", { status: 404 }) };
  }

  return { payload, payloadUserId };
};
