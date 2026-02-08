import configPromise from "@payload-config";
import { getPayload } from "payload";
import { auth } from "@clerk/nextjs/server";
import type { Address, User } from "@/payload-types";

export const runtime = "nodejs";

const resolvePayloadUserId = async () => {
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

  const userDoc = userResult.docs[0] as User | undefined;
  const payloadUserId = userDoc?.id;
  if (!payloadUserId) {
    return { error: new Response("User not found", { status: 404 }) };
  }

  return { payload, payloadUserId };
};

export const GET = async () => {
  const resolved = await resolvePayloadUserId();
  if ("error" in resolved) {
    return resolved.error;
  }

  const addressesResult = await resolved.payload.find({
    collection: "addresses",
    where: { user: { equals: resolved.payloadUserId } },
    limit: 100,
    depth: 0,
  });

  return Response.json({ docs: addressesResult.docs });
};

export const POST = async (request: Request) => {
  const resolved = await resolvePayloadUserId();
  if ("error" in resolved) {
    return resolved.error;
  }

  const data = (await request.json()) as {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    defaulte?: boolean;
  };

  if (
    !data.name ||
    !data.address ||
    !data.city ||
    !data.state ||
    !data.zip
  ) {
    return new Response("Missing required address fields", { status: 400 });
  }

  const createArgs = {
    collection: "addresses",
    data: {
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      defaulte: data.defaulte ?? false,
      user: resolved.payloadUserId,
    },
    overrideAccess: true,
  } satisfies Parameters<typeof resolved.payload.create>[0];

  const created = await resolved.payload.create(createArgs);

  return Response.json(created);
};

export const PATCH = async (request: Request) => {
  const resolved = await resolvePayloadUserId();
  if ("error" in resolved) {
    return resolved.error;
  }

  const data = (await request.json()) as {
    addressId?: string;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    defaulte?: boolean;
  };
  if (!data.addressId) {
    return new Response("Missing addressId", { status: 400 });
  }

  if (data.defaulte) {
    const currentDefaults = await resolved.payload.find({
      collection: "addresses",
      where: {
        user: { equals: resolved.payloadUserId },
        defaulte: { equals: true },
      },
      limit: 100,
      depth: 0,
    });

    await Promise.all(
      (currentDefaults.docs as Address[])
        .map((doc) => doc.id)
        .filter((id): id is number => typeof id === "number")
        .filter((id) => String(id) !== data.addressId)
        .map((id) =>
          resolved.payload.update({
            collection: "addresses",
            id,
            data: { defaulte: false },
            overrideAccess: true,
          })
        )
    );
  }

  const updateData: Partial<Address> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.zip !== undefined) updateData.zip = data.zip;
  if (data.defaulte !== undefined) updateData.defaulte = data.defaulte;

  if (Object.keys(updateData).length === 0) {
    return new Response("No fields to update", { status: 400 });
  }

  const updated = await resolved.payload.update({
    collection: "addresses",
    id: data.addressId,
    data: updateData,
    overrideAccess: true,
  });

  return Response.json(updated);
};

export const DELETE = async (request: Request) => {
  const resolved = await resolvePayloadUserId();
  if ("error" in resolved) {
    return resolved.error;
  }

  const data = (await request.json()) as { addressId?: string };
  if (!data.addressId) {
    return new Response("Missing addressId", { status: 400 });
  }

  await resolved.payload.delete({
    collection: "addresses",
    id: data.addressId,
    overrideAccess: true,
  });

  return new Response(null, { status: 204 });
};
