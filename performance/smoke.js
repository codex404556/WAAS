import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1200"],
  },
};

export function setup() {
  const res = http.get(`${BASE_URL}/api/products?limit=1&depth=0`);
  let productSlug = null;

  if (res.status === 200) {
    const json = res.json();
    productSlug = json?.docs?.[0]?.slug || null;
  }

  return { productSlug };
}

export default function smokeScenario(data) {
  const responses = http.batch([
    ["GET", `${BASE_URL}/`],
    ["GET", `${BASE_URL}/shop`],
    ["GET", `${BASE_URL}/api/products?limit=20&depth=0`],
    ["GET", `${BASE_URL}/api/categories?limit=20`],
    ["GET", `${BASE_URL}/api/brands?limit=20`],
  ]);

  responses.forEach((res, i) => {
    check(res, {
      [`req_${i}_status_2xx`]: (r) => r.status >= 200 && r.status < 300,
    });
  });

  if (data.productSlug) {
    const pdp = http.get(`${BASE_URL}/product/${data.productSlug}`);
    check(pdp, { pdp_status_2xx: (r) => r.status >= 200 && r.status < 300 });
  }

  sleep(1);
}
