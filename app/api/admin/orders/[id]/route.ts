import configPromise from "@payload-config";
import { getPayload } from "payload";

export const runtime = "nodejs";

const requireAdmin = async (request: Request) => {
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return { error: new Response("Unauthorized", { status: 401 }) };
  }

  const role = (user as { role?: string }).role;
  if (role !== "admin") {
    return { error: new Response("Forbidden", { status: 403 }) };
  }

  return { payload };
};

export const PATCH = async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const resolved = await requireAdmin(request);
  if ("error" in resolved) {
    return resolved.error;
  }

  const { id } = await context.params;
  const { payload } = resolved;
  const body = (await request.json()) as {
    status?: "pending" | "cancelled" | "paid" | "completed";
  };

  const updated = await payload.update({
    collection: "orders",
    id,
    data: {
      status: body.status,
    },
  });

  return Response.json({ order: updated });
};

export const DELETE = async (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => {
  const resolved = await requireAdmin(request);
  if ("error" in resolved) {
    return resolved.error;
  }

  const { id } = await context.params;
  const { payload } = resolved;

  await payload.delete({
    collection: "orders",
    id,
  });

  return Response.json({ success: true });
};
