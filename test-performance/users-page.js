import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const env = globalThis.__ENV || {};
const BASE_URL = env.BASE_URL || 'https://reqres.in';
const PAGE = env.PAGE || '1';
const TEST_DURATION = env.TEST_DURATION || '2s';
const VUS = Number(env.VUS || '100');
const REQUEST_INTERVAL_SECONDS = Number(env.REQUEST_INTERVAL_SECONDS || '1');
const API_KEY = env.REQRES_API_KEY || '';
const REQRES_ENV = env.REQRES_ENV || '';
const TARGET_URL = `${BASE_URL}/api/users?page=${PAGE}`;

const successResponses = new Counter('success_responses');
const rateLimitedResponses = new Counter('rate_limited_responses');
const jsonResponses = new Counter('json_responses');
const successRate = new Rate('success_rate');
const rateLimitedRate = new Rate('rate_limited_rate');

export const options = {
  vus: VUS,
  duration: TEST_DURATION,
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(50)<500', 'p(95)<1000', 'p(99)<1500'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(50)', 'p(95)', 'p(99)'],
};

export default function () {
  const headers = {
    Accept: 'application/json',
  };

  if (API_KEY) {
    headers['x-api-key'] = API_KEY;
  }

  if (REQRES_ENV) {
    headers['X-Reqres-Env'] = REQRES_ENV;
  }

  const response = http.get(TARGET_URL, {
    headers,
    tags: {
      name: 'list_users',
    },
  });

  const contentType = response.headers['Content-Type'] || response.headers['content-type'] || '';
  const isJson = contentType.includes('application/json');
  let payload = null;

  if (isJson) {
    jsonResponses.add(1);
    try {
      payload = response.json();
    } catch {
      payload = null;
    }
  }

  const isSuccess = response.status === 200;
  const isRateLimited = response.status === 429;

  successResponses.add(isSuccess ? 1 : 0);
  rateLimitedResponses.add(isRateLimited ? 1 : 0);
  successRate.add(isSuccess);
  rateLimitedRate.add(isRateLimited);

  check(response, {
    'status is 200': (res) => res.status === 200,
    'response is json': () => isJson,
    'body contains data array': () => Array.isArray(payload?.data),
  });

  sleep(REQUEST_INTERVAL_SECONDS);
}

export function handleSummary(data) {
  const summary = {
    ...data,
    testSetup: {
      tool: 'k6',
      targetUrl: TARGET_URL,
      vus: VUS,
      requestIntervalSeconds: REQUEST_INTERVAL_SECONDS,
      configuredDuration: TEST_DURATION,
      apiKeyConfigured: API_KEY !== '',
      reqresEnv: REQRES_ENV || null,
    },
  };

  return {
    'results/summary.json': JSON.stringify(summary, null, 2),
    stdout: textSummary(data),
  };
}

function textSummary(data) {
  const duration = data.metrics.http_req_duration?.values || {};
  const failed = data.metrics.http_req_failed?.values || {};
  const requests = data.metrics.http_reqs?.values || {};

  return [
    '',
    'ReqRes users endpoint performance summary',
    `Duration: ${TEST_DURATION}`,
    `P50: ${formatMs(duration['p(50)'])}`,
    `P95: ${formatMs(duration['p(95)'])}`,
    `P99: ${formatMs(duration['p(99)'])}`,
    `Error rate: ${formatRate(failed.rate)}`,
    `Throughput: ${formatRps(requests.rate)}`,
    '',
  ].join('\n');
}

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
