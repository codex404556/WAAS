import type { ReactNode } from "react";
import { headers as getHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@/payload.config";
import DashboardApp from "./app";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headers = await getHeaders();
  const payloadConfig = await config;
  const payload = await getPayload({ config: payloadConfig });
  const { user } = await payload.auth({ headers });

  if (!user) {
    redirect("/login");
  }

  return <DashboardApp>{children}</DashboardApp>;
}
