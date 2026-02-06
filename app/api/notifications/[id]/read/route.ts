import { resolvePayloadUser } from "@/lib/resolvePayloadUser";

export const runtime = "nodejs";

const getId = (doc?: { id?: string; _id?: string } | null) =>
  doc?.id ?? doc?._id;

export const PUT = async (
  _request: Request,
  context: { params: { id: string } }
) => {
  const resolved = await resolvePayloadUser();
  if ("error" in resolved) {
    return resolved.error;
  }

  const { payload, payloadUserId } = resolved;
  const notification = await payload.findByID({
    collection: "notifications",
    id: context.params.id,
    depth: 0,
  });

  const notificationUser = getId(
    (notification as { user?: { id?: string; _id?: string } | string | null })
      .user as { id?: string; _id?: string } | null
  );

  if (!notificationUser || notificationUser !== payloadUserId) {
    return new Response("Forbidden", { status: 403 });
  }

  await payload.update({
    collection: "notifications",
    id: context.params.id,
    data: { isRead: true },
    overrideAccess: true,
  });

  return new Response(null, { status: 204 });
};
