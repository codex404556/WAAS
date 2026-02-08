import configPromise from "@payload-config";
import { getPayload, type Where } from "payload";

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

export const GET = async (request: Request) => {
  const resolved = await requireAdmin(request);
  if ("error" in resolved) {
    return resolved.error;
  }

  const { payload } = resolved;
  const { searchParams } = new URL(request.url);

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const sort = searchParams.get("sort") || "-createdAt";
  const depth = Number(searchParams.get("depth") || "1");
  const status = searchParams.get("where[status][equals]");
  const paymentStatus = searchParams.get("where[paymentStatus][equals]");

  const where: Where = {};
  if (status) {
    where.status = { equals: status };
  }
  if (paymentStatus) {
    where.paymentStatus = { equals: paymentStatus };
  }

  const result = await payload.find({
    collection: "orders",
    page,
    limit,
    sort,
    depth,
    where,
  });

  return Response.json(result);
};
