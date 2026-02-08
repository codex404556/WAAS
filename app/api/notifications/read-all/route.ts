import { resolvePayloadUser } from "@/lib/resolvePayloadUser";
import type { Notification } from "@/payload-types";

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

  const ids = (result.docs as Notification[])
    .map((doc) => doc.id)
    .filter((id): id is number => typeof id === "number");

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
