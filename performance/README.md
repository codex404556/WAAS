# k6 Localhost Testing

## 1) Start the app

Use production mode for more realistic performance:

```bash
npm run build
npm run start
```

If needed, you can run dev mode instead:

```bash
npm run dev
```

App URL: `http://localhost:3000`

## 2) Run smoke test

```bash
k6 run -e BASE_URL=http://localhost:3000 performance/smoke.js
```

## 3) Run load test

```bash
k6 run -e BASE_URL=http://localhost:3000 performance/load.js
```

## 4) Export summaries

```bash
k6 run -e BASE_URL=http://localhost:3000 --summary-export=performance/summary-smoke.json performance/smoke.js
k6 run -e BASE_URL=http://localhost:3000 --summary-export=performance/summary-load.json performance/load.js
```

## Notes

- Tests hit these routes: `/`, `/shop`, `/api/products`, `/api/categories`, `/api/brands`.
- Threshold failures return a non-zero exit code, which is suitable for CI gate checks.
