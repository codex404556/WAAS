import configPromise from "@payload-config";
import { getPayload } from "payload";
import { auth, clerkClient } from "@clerk/nextjs/server";
import crypto from "crypto";
import type { User } from "@/payload-types";

export const resolvePayloadUser = async () => {
  type MinimalUserDoc = {
    id?: string | number;
    _id?: string | number;
    clerkId?: string | null;
  };

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

  const existing = userResult.docs[0] as MinimalUserDoc | undefined;
  let payloadUserId = existing?.id;
  if (payloadUserId) {
    return { payload, payloadUserId };
  }

  const clerkUser = await (await clerkClient()).users.getUser(userId);
  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    return { error: new Response("Missing email for Clerk user", { status: 400 }) };
  }

  const name = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();

  const byEmailResult = await payload.find({
    collection: "users",
    where: { email: { equals: primaryEmail } },
    limit: 1,
    depth: 0,
  });

  const existingByEmail = byEmailResult.docs[0] as MinimalUserDoc | undefined;
  if (existingByEmail?.id) {
    const existingClerkId =
      typeof existingByEmail.clerkId === "string"
        ? existingByEmail.clerkId.trim()
        : "";

    if (existingClerkId && existingClerkId !== userId) {
      console.error("Clerk to Payload user conflict", {
        payloadUserId: existingByEmail.id,
        primaryEmail,
        existingClerkId,
        incomingClerkId: userId,
      });
      return { error: new Response("Account conflict", { status: 409 }) };
    }

    if (!existingClerkId) {
      try {
        await payload.update({
          collection: "users",
          id: existingByEmail.id,
          data: {
            clerkId: userId,
            avatar: clerkUser.imageUrl || "",
            name: name || undefined,
          },
        });
      } catch (error) {
        console.error("Failed to link clerkId to existing Payload user", {
          primaryEmail,
          incomingClerkId: userId,
          payloadUserId: existingByEmail.id,
          error,
        });
        return {
          error: new Response("Failed to link customer account", { status: 500 }),
        };
      }
    }

    return { payload, payloadUserId: existingByEmail.id };
  }

  const randomPassword = crypto.randomBytes(24).toString("hex");
  try {
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

    const userDoc = created as User | undefined;
    payloadUserId = userDoc?.id;
  } catch (error) {
    console.error("Failed to create Payload user for Clerk customer", {
      primaryEmail,
      incomingClerkId: userId,
      error,
    });
    return {
      error: new Response("Failed to provision customer account", { status: 500 }),
    };
  }

  if (!payloadUserId) {
    return { error: new Response("User not found", { status: 404 }) };
  }

  return { payload, payloadUserId };
};
