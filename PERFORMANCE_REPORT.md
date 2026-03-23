# Performance Test Report

## Test setup and assumptions

- Tool: k6
- Target API: https://reqres.in/api/users?page=1
- Load model: 100 concurrent virtual users
- Request pattern: each virtual user sends 1 GET request, then waits 1 second before the next request
- Configured duration: 2s
- Authentication note: ReqRes documents x-api-key as the preferred header for reliable automation runs. This setup reads that key from test-performance/.env and it was present for this run.
- Environment note: results depend on the network path from the machine running the test to the public ReqRes endpoint.
- ReqRes API is rate limited on free tier so it will hit the exhaustion of free requests. Metrics reflect that.
 
## Captured metrics

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
