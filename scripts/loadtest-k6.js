// Haq AI — K6 Load & Performance Testing Script
// Simulates concurrent MSME business owners calculating statutory interest,
// viewing cases, and downloading evidence packs.

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up to 20 VUs
    { duration: '1m', target: 100 },  // Peak load: 100 concurrent MSMEs
    { duration: '30s', target: 100 }, // Sustained peak
    { duration: '20s', target: 0 },   // Cool-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<800'], // 95% of requests under 300ms
    http_req_failed: ['rate<0.001'],               // Error rate < 0.1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';
const DEMO_TOKEN = 'test-token-demo';

export default function () {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DEMO_TOKEN}`,
  };

  // 1. Health check
  const healthRes = http.get(`${BASE_URL}/api/healthz`);
  check(healthRes, {
    'healthz status is 200': (r) => r.status === 200,
  });

  // 2. Fetch Cases list
  const casesRes = http.get(`${BASE_URL}/api/cases`, { headers });
  check(casesRes, {
    'cases status is 200': (r) => r.status === 200,
  });

  // 3. Evidence Pack Generation for case_demo_1
  const evidenceRes = http.get(`${BASE_URL}/api/cases/case_demo_1/evidence-pack`, { headers });
  check(evidenceRes, {
    'evidence pack status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
