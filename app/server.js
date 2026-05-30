const express = require("express");
const client  = require("prom-client");
const app     = express();

const PORT        = process.env.PORT        || 3000;
const APP_VERSION = process.env.APP_VERSION || "v1.0.0";
const APP_COLOR   = (process.env.APP_COLOR  || "blue").toLowerCase();
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
  httpRequests.labels("GET", "/health", "200", APP_COLOR, APP_VERSION).inc();
  res.status(200).json({ status: "healthy", color: APP_COLOR, version: APP_VERSION });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/", (req, res) => {
  httpRequests.labels("GET", "/", "200", APP_COLOR, APP_VERSION).inc();
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Blue-Green Demo | ${APP_COLOR.toUpperCase()}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: ${COLOR_HEX};
      color: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 2rem;
    }
    .env   { font-size: clamp(3rem, 10vw, 6rem); font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; }
    .sub   { font-size: 1.25rem; opacity: 0.85; margin-top: 0.5rem; }
    .badge { margin-top: 1.5rem; padding: 0.5rem 1.75rem; border: 2px solid rgba(255,255,255,0.8); border-radius: 9999px; font-size: 1.1rem; font-weight: 600; }
    .meta  { margin-top: 2.5rem; opacity: 0.55; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="env">${APP_COLOR}</div>
  <p class="sub">Zero-Downtime Blue-Green Deployment on AWS EKS</p>
  <div class="badge">Version: ${APP_VERSION}</div>
  <p class="meta">Served by the ${APP_COLOR} environment &nbsp;|&nbsp; Node.js + Express</p>
</body>
</html>`);
});

app.listen(PORT, () =>
  console.log(`[bluegreen] port=${PORT} color=${APP_COLOR} version=${APP_VERSION}`)
);
