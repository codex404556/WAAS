import { resolvePayloadUser } from "@/lib/resolvePayloadUser";

export const runtime = "nodejs";

export const GET = async () => {
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
    limit: 1,
    depth: 0,
  });

  return Response.json({ count: result.totalDocs });
};
