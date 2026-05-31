const express = require("express");
const client  = require("prom-client");
const app     = express();

const PORT        = process.env.PORT        || 3000;
const APP_VERSION = process.env.APP_VERSION || "v1.0.0";
const APP_COLOR   = (process.env.APP_COLOR  || "blue").toLowerCase();
const FORCE_ERROR = process.env.FORCE_ERROR === "true";
const COLOR_HEX   = APP_COLOR === "green" ? "#2C9E5E" : "#1C6EA4";

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests by route, status, color and version",
  labelNames: ["method", "route", "status", "color", "version"],
  registers: [register],
});

const envGauge = new client.Gauge({
  name: "bluegreen_environment_info",
  help: "Current environment color and version",
  labelNames: ["color", "version"],
  registers: [register],
});
envGauge.labels(APP_COLOR, APP_VERSION).set(1);

app.get("/health", (req, res) => {
  if (FORCE_ERROR) {
    httpRequests.labels("GET", "/health", "500", APP_COLOR, APP_VERSION).inc();
    return res.status(500).json({
      status: "unhealthy",
      color: APP_COLOR,
      version: APP_VERSION,
      error: "Simulated failure for automated rollback test",
    });
  }
  httpRequests.labels("GET", "/health", "200", APP_COLOR, APP_VERSION).inc();
  res.status(200).json({ status: "healthy", color: APP_COLOR, version: APP_VERSION });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/", (req, res) => {
  if (FORCE_ERROR) return res.status(500).send("Internal Server Error");
  httpRequests.labels("GET", "/", "200", APP_COLOR, APP_VERSION).inc();
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Blue-Green Demo | ${APP_COLOR.toUpperCase()}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui; background: ${COLOR_HEX}; color: #fff;
           display: flex; flex-direction: column; align-items: center;
           justify-content: center; min-height: 100vh; text-align: center; padding: 2rem; }
    .env   { font-size: clamp(3rem,10vw,6rem); font-weight: 800; text-transform: uppercase; }
    .badge { margin-top: 1.5rem; padding: 0.5rem 1.75rem;
             border: 2px solid rgba(255,255,255,0.8); border-radius: 9999px; }
  </style>
</head>
<body>
  <div class="env">${APP_COLOR}</div>
  <p>Zero-Downtime Blue-Green Deployment on AWS EKS</p>
  <div class="badge">Version: ${APP_VERSION}</div>
</body>
</html>`);
});

app.listen(PORT, () =>
  console.log(`[bluegreen] port=${PORT} color=${APP_COLOR} version=${APP_VERSION} force_error=${FORCE_ERROR}`)
);
