import configPromise from "@payload-config";
import { getPayload } from "payload";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import crypto from "crypto";

export const runtime = "nodejs";

const getPrimaryEmail = (event: WebhookEvent) => {
  if (event.type !== "user.created" && event.type !== "user.updated") {
    return "";
  }

  const { email_addresses, primary_email_address_id } = event.data;
  const primary = email_addresses.find(
    (email) => email.id === primary_email_address_id
  );

  return primary?.email_address || email_addresses[0]?.email_address || "";
};

const getDisplayName = (event: WebhookEvent) => {
  if (event.type !== "user.created" && event.type !== "user.updated") {
    return "";
  }

  const first = event.data.first_name || "";
  const last = event.data.last_name || "";
  const combined = `${first} ${last}`.trim();

  return combined || event.data.username || "";
};

const getPayloadId = (doc: { id?: string | number; _id?: string | number }) =>
  doc.id || doc._id || "";

export const POST = async (request: Request) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 });
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await getPayload({ config: configPromise });
  const body = await request.text();

  let event: WebhookEvent;
  try {
    const webhook = new Webhook(secret);
    event = webhook.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (error) {
    console.error("Clerk webhook verification failed", error);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const clerkId = event.data.id;
    const email = getPrimaryEmail(event);
    const name = getDisplayName(event);
    const avatar = event.data.image_url || "";

    if (!email) {
      return new Response("Missing email for Clerk user", { status: 400 });
    }

    const existingByClerkId = await payload.find({
      collection: "users",
      where: { clerkId: { equals: clerkId } },
      limit: 1,
      depth: 0,
    });

    const existing =
      existingByClerkId.docs[0] ||
      (
        await payload.find({
          collection: "users",
          where: { email: { equals: email } },
          limit: 1,
          depth: 0,
        })
      ).docs[0];

    if (existing) {
      const existingId = getPayloadId(existing);
      if (!existingId) {
        return new Response("Missing Payload user id", { status: 500 });
      }

      await payload.update({
        collection: "users",
        id: existingId,
        data: {
          name: name || existing.name,
          email,
          avatar,
          clerkId,
        },
      });
    } else {
      const randomPassword = crypto.randomBytes(24).toString("hex");

      await payload.create({
        collection: "users",
        data: {
          name: name || email,
          email,
          avatar,
          clerkId,
          role: "user",
          password: randomPassword,
        },
      });
    }
  }

  if (event.type === "user.deleted") {
    const clerkId = event.data.id;
    const existingByClerkId = await payload.find({
      collection: "users",
      where: { clerkId: { equals: clerkId } },
      limit: 1,
      depth: 0,
    });

    if (existingByClerkId.docs[0]) {
      const existingId = getPayloadId(existingByClerkId.docs[0]);
      if (!existingId) {
        return new Response("Missing Payload user id", { status: 500 });
      }

      await payload.delete({
        collection: "users",
        id: existingId,
      });
    }
  }

  return new Response("ok", { status: 200 });
};
