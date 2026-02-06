import { resolvePayloadUser } from "@/lib/resolvePayloadUser";

export const runtime = "nodejs";

export const PUT = async () => {
  const resolved = await resolvePayloadUser();
  if ("error" in resolved) {
    return resolved.error;
  }

  const { payload, payloadUserId } = resolved;
  const result = await payload.find({
    collection: "notifications",
    where: {
      user: { equals: payloadUserId },
      isRead: { equals: false },
    },
    limit: 1000,
    depth: 0,
  });

  const ids = result.docs
    .map((doc) => (doc as { id?: string; _id?: string }).id ?? (doc as { _id?: string })._id)
    .filter((id): id is string => Boolean(id));

  await Promise.all(
    ids.map((id) =>
      payload.update({
        collection: "notifications",
        id,
        data: { isRead: true },
        overrideAccess: true,
      })
    )
  );

  return new Response(null, { status: 204 });
};
