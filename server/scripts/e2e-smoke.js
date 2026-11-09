// Smoke Test script for basic API connectivity verification.
// Run: node server/scripts/e2e-smoke.js

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/v1';

async function runSmokeTests() {
  console.log("Running basic smoke tests...");

  // 1. Health check
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.ok && data.status === 'ok') {
      console.log("✅ API Health check passed.");
    } else {
      console.error("❌ API Health check failed.");
    }
  } catch (err) {
    console.error("❌ API Health check error:", err.message);
  }

  // Note: Further tests require authenticated JWT tokens via Firebase Emulators,
  // which involves spinning up a client auth payload. For a CI/CD pipeline,
  // a supertest suite using a mocked auth middleware is recommended.
  console.log("Smoke test suite finished.");
}

runSmokeTests();
