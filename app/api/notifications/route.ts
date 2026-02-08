import { resolvePayloadUser } from "@/lib/resolvePayloadUser";
import type { Notification } from "@/payload-types";

export const runtime = "nodejs";

export const GET = async (request: Request) => {
  const resolved = await resolvePayloadUser();
  if ("error" in resolved) {
    return resolved.error;
  }

  const { payload, payloadUserId } = resolved;
  const { searchParams } = new URL(request.url);
  const limit = Math.max(1, Number(searchParams.get("limit") ?? 10));
  const skipParam = Number(searchParams.get("skip") ?? "0");
  const pageParam = Number(searchParams.get("page") ?? "0");
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const page =
    pageParam > 0 ? pageParam : Math.floor(Math.max(0, skipParam) / limit) + 1;

  const where = {
    user: { equals: payloadUserId },
    ...(unreadOnly ? { isRead: { equals: false } } : {}),
  };

  const result = await payload.find({
    collection: "notifications",
    where,
    limit,
    page,
    sort: "-createdAt",
    depth: 0,
  });

  const notifications = (result.docs as Notification[]).map((doc) => ({
    ...doc,
    _id: doc.id,
  }));

  return Response.json({
    notifications,
    total: result.totalDocs,
    currentPage: result.page,
    totalPages: result.totalPages,
    hasMore: result.hasNextPage,
  });
};

export const DELETE = async () => {
  const resolved = await resolvePayloadUser();
  if ("error" in resolved) {
    return resolved.error;
  }

  const { payload, payloadUserId } = resolved;
  const result = await payload.find({
    collection: "notifications",
    where: { user: { equals: payloadUserId } },
    limit: 1000,
    depth: 0,
  });

  const ids = (result.docs as Notification[])
    .map((doc) => doc.id)
    .filter((id): id is number => typeof id === "number");

  await Promise.all(
    ids.map((id) =>
      payload.delete({
        collection: "notifications",
        id,
        overrideAccess: true,
      })
    )
  );

  return new Response(null, { status: 204 });
};
