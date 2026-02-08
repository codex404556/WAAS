import configPromise from "@payload-config";
import { getPayload } from "payload";
import { auth } from "@clerk/nextjs/server";

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

  const userDoc = userResult.docs[0] as { id?: string; _id?: string } | undefined;
  const payloadUserId = userDoc?.id ?? userDoc?._id;
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
    collection: "addresses" as never,
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

  const created = await resolved.payload.create({
    collection: "addresses" as never,
    data: {
      ...data,
      user: resolved.payloadUserId as unknown as string,
    } as unknown,
    overrideAccess: true,
  });

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
      collection: "addresses" as never,
      where: {
        user: { equals: resolved.payloadUserId },
        defaulte: { equals: true },
      },
      limit: 100,
      depth: 0,
    });

    await Promise.all(
      currentDefaults.docs
        .map(
          (doc) =>
            (doc as { id?: string; _id?: string }).id ??
            (doc as { _id?: string })._id
        )
        .filter((id): id is string => Boolean(id) && id !== data.addressId)
        .map((id) =>
          resolved.payload.update({
            collection: "addresses" as never,
            id,
            data: { defaulte: false },
            overrideAccess: true,
          })
        )
    );
  }

  const updated = await resolved.payload.update({
    collection: "addresses" as never,
    id: data.addressId,
    data: {
      name: data.name,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      defaulte: data.defaulte,
    },
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
    collection: "addresses" as never,
    id: data.addressId,
    overrideAccess: true,
  });

  return new Response(null, { status: 204 });
};
