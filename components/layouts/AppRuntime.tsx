"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";

const AppRuntime = () => {
  const [showToaster, setShowToaster] = useState(false);

  useEffect(() => {
    const onIdle = () => setShowToaster(true);

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(onIdle, { timeout: 1200 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(onIdle, 400);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  return (
    <>
      {showToaster ? <Toaster /> : null}
      <Analytics />
      <SpeedInsights />
    </>
  );
};

export default AppRuntime;
