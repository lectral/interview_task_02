# bee_talents

## Table of Contents

1. [End-To-End Tests (Playwright)](#end-to-end-tests-playwright)
2. [Performance Testing (k6)](#performance-testing-k6)
3. [Performance Report](#performance-report)

## End-To-End Tests (Playwright)

Playwright covers a compact Sauce Demo flow with TypeScript-based specs, fixtures, actions, and page objects. The suite currently validates login and cart checkout flows and is configured to run locally or inside Docker with Chromium.

### Stack

- Playwright Test
- TypeScript
- ESLint
- Docker
- GitHub Actions

### Running (docker)

From the repository root:

```bash
npm install
npm run test:docker
```

For Playwright UI mode in Docker:

```bash
npm run test:docker:ui
```

What this does:

- builds the image defined by the repository Dockerfile
- installs dependencies with `npm ci` inside the container when needed
- runs Chromium tests through `xvfb-run`

### Github Actions

The existing CI workflow runs on `push`, `pull_request`, and manual dispatch. It:

- installs Node.js 22 dependencies with `npm ci`
- restores and reuses the Playwright browser cache
- installs Chromium when the cache is cold
- runs `npm test` with `CI=true`
- uploads the HTML Playwright report and raw test artifacts

## Performance Testing (k6)

The performance setup is a standalone k6 project that targets the ReqRes users endpoint. It simulates constant virtual users, records success and rate-limit behavior, and writes a machine-readable summary used to generate the report.

### Stack

- k6
- Node.js for report rendering (dirty script)
- Docker fallback via `grafana/k6`

### Running (docker)

Create `test-performance/.env` with the ReqRes credentials if you need authenticated runs:

```bash
REQRES_API_KEY=your_key_here
REQRES_ENV=prod
```

Run from the performance folder:

```bash
cd test-performance
./run-k6.sh run users-page.js
```

If local `k6` is unavailable, the script automatically falls back to Docker and runs the same workload with the official `grafana/k6` image.

To regenerate the markdown report:

```bash
cd test-performance
node render-report.mjs
```

## Performance Report

[IMPORTANT] ReRes Free tier is rate limited to 250 requests per month so ~65% of requests hit the limit. This is the reason for low duration of the tests to get actual results. 

### Test setup and assumptions

- Tool: k6
- Target API: `https://reqres.in/api/users?page=1`
- Load model: `100` concurrent virtual users
- Request pattern: `1` GET request per virtual user, then `1s` wait
- Configured duration: `2s` - it should provide some real metrics before hitting the FREE TIER limit.
- Authentication: `x-api-key` loaded from `test-performance/.env`
- Environment note: results depend on the network path to the public ReqRes service
- Service note: ReqRes free tier rate limiting affects the results

### Captured metrics

| Metric | Value |
| --- | --- |
| P50 response time | 94.70 ms |
| P95 response time | 257.07 ms |
| P99 response time | 281.70 ms |
| Error rate | 65.52% |
| Throughput | 18.17 req/s |
| Successful 200 responses | 40 |
| Success rate | 34.48% |
| Rate-limited 429 responses | 76 |
| Rate-limited response rate | 65.52% |
| JSON responses | 116 |
| Total requests | 116 |
| Completed iterations | 116 |
| Effective test runtime | 6.39 s |
| Configured VUs | 100 |

### Interpretation of results

The latency numbers are acceptable for the requests that were actually served: sub-100 ms median and sub-300 ms tail latency are not signs of a slow endpoint. The dominant issue is not server processing time, but capacity and quota enforcement.

What the run shows:

- the endpoint stayed responsive for accepted traffic
- the workload was too aggressive for the target service tier
- most failures were explicit rate-limit responses rather than timeouts or malformed responses
- throughput is artificially capped by `429` responses, so it should not be treated as the system's true sustainable throughput

Due to rate limiting it is not a clean measurement of application performance under the intended load.

### Potential optimization suggestions-
- [IMPORTANT] Rerun on higher duraction (~60s) and non free tier api-key to ensure real results
- Reduce the test load for public ReqRes runs so the scenario measures latency instead of quota exhaustion.
- Point k6 at a self-hosted or higher-quota environment if you want meaningful results at `100` VUs.
- Add thresholds for `429` rates explicitly so rate limiting fails the scenario with a clearer signal.
- Capture separate metrics for `200`, `429`, and transport errors to make report interpretation faster.
- Warm up the target before the measured interval if you want more stable tail-latency numbers.
