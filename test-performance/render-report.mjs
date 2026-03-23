// QUICK AND DIRTY SCRIPT TO GENERATE A RAPORT.

import console from 'node:console';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectDir = path.resolve(process.cwd());
const resultsDir = path.join(projectDir, 'results');
const summaryPath = path.join(resultsDir, 'summary.json');
const reportPath = path.join(projectDir, 'REPORT.md');

if (!fs.existsSync(summaryPath)) {
  console.error(`Missing summary file at ${summaryPath}. Run the performance test first.`);
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
const testSetup = summary.testSetup || {};
const metrics = summary.metrics || {};
const duration = metrics.http_req_duration?.values || {};
const failed = metrics.http_req_failed?.values || {};
const requests = metrics.http_reqs?.values || {};
const iterations = metrics.iterations?.values || {};
const successResponses = metrics.success_responses?.values || {};
const rateLimitedResponses = metrics.rate_limited_responses?.values || {};
const successRate = metrics.success_rate?.values || {};
const rateLimitedRate = metrics.rate_limited_rate?.values || {};
const jsonChecks = summary.root_group?.checks?.find((check) => check.name === 'response is json');
const configuredDuration = testSetup.configuredDuration || summary.options?.duration || 'n/a';
const configuredVus = testSetup.vus || summary.options?.vus || 'n/a';
const requestInterval = formatIntervalSeconds(testSetup.requestIntervalSeconds);
const effectiveRuntime = summary.state?.testRunDurationMs
  ? `${(summary.state.testRunDurationMs / 1000).toFixed(2)} s`
  : 'n/a';

const report = `# Performance Test Report

## Test setup and assumptions

- Tool: ${testSetup.tool || 'k6'}
- Target API: ${testSetup.targetUrl || 'https://reqres.in/api/users?page=1'}
- Load model: ${configuredVus} concurrent virtual users
- Request pattern: each virtual user sends 1 GET request, then waits ${requestInterval} before the next request
- Configured duration: ${configuredDuration}
- Authentication note: ReqRes documents x-api-key as the preferred header for reliable automation runs. This setup reads that key from test-performance/.env${testSetup.apiKeyConfigured ? ' and it was present for this run' : ', but it was not present for this run'}.
- Environment note: results depend on the network path from the machine running the test to the public ReqRes endpoint.
- ReqRes API is rate limited on free tier so it will hit the exhaustion of free requests. Metrics reflect that.

## Captured metrics

| Metric | Value |
| --- | --- |
| P50 response time | ${formatMs(duration['p(50)'])} |
| P95 response time | ${formatMs(duration['p(95)'])} |
| P99 response time | ${formatMs(duration['p(99)'])} |
| Error rate | ${formatRate(failed.rate)} |
| Throughput | ${formatRps(requests.rate)} |
| Successful 200 responses | ${formatCount(successResponses.count)} |
| Success rate | ${formatRate(successRate.rate)} |
| Rate-limited 429 responses | ${formatCount(rateLimitedResponses.count)} |
| Rate-limited response rate | ${formatRate(rateLimitedRate.rate)} |
| JSON responses | ${formatCount(jsonChecks?.passes)} |
| Total requests | ${formatCount(requests.count)} |
| Completed iterations | ${formatCount(iterations.count)} |
| Effective test runtime | ${effectiveRuntime} |
| Configured VUs | ${formatCount(configuredVus)} |
`;

fs.writeFileSync(reportPath, report);

console.log(`Wrote ${reportPath}`);

function formatMs(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'n/a';
  }

  return `${value.toFixed(2)} ms`;
}

function formatRate(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'n/a';
  }

  return `${(value * 100).toFixed(2)}%`;
}

function formatRps(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'n/a';
  }

  return `${value.toFixed(2)} req/s`;
}

function formatCount(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'n/a';
  }

  return `${Math.round(value)}`;
}

function formatIntervalSeconds(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 'n/a';
  }

  return value === 1 ? '1 second' : `${value} seconds`;
}
