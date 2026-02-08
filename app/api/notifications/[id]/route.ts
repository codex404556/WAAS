import { resolvePayloadUser } from "@/lib/resolvePayloadUser";

export const runtime = "nodejs";

const getId = (doc?: { id?: string; _id?: string } | null) =>
  doc?.id ?? doc?._id;

export const DELETE = async (
  _request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const { id } = await context.params;
  const resolved = await resolvePayloadUser();
  if ("error" in resolved) {
    return resolved.error;
  }

  const { payload, payloadUserId } = resolved;
  const notification = await payload.findByID({
    collection: "notifications",
    id,
    depth: 0,
  });

  const notificationUser = getId(
    (notification as { user?: { id?: string; _id?: string } | string | null })
      .user as { id?: string; _id?: string } | null
  );

  if (!notificationUser || notificationUser !== payloadUserId) {
    return new Response("Forbidden", { status: 403 });
  }

  await payload.delete({
    collection: "notifications",
    id,
    overrideAccess: true,
  });

  return new Response(null, { status: 204 });
};
