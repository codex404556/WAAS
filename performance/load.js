import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  scenarios: {
    traffic: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "1m", target: 10 },
        { duration: "3m", target: 30 },
        { duration: "1m", target: 0 },
      ],
      gracefulRampDown: "30s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500"],
  },
};

export default function loadScenario() {
  const routes = [
    "/",
    "/shop",
    "/api/products?limit=20&depth=0",
    "/api/categories?limit=20",
    "/api/brands?limit=20",
  ];
  const route = routes[Math.floor(Math.random() * routes.length)];

  const res = http.get(`${BASE_URL}${route}`);
  check(res, { status_2xx: (r) => r.status >= 200 && r.status < 300 });

  sleep(1);
}
