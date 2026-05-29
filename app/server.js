const express = require("express");
const app = express();

const PORT        = process.env.PORT        || 3000;
const APP_VERSION = process.env.APP_VERSION || "v1.0.0";
const APP_COLOR   = (process.env.APP_COLOR  || "blue").toLowerCase();
const COLOR_HEX   = APP_COLOR === "green" ? "#2C9E5E" : "#1C6EA4";

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy", color: APP_COLOR, version: APP_VERSION,
  });
});

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html><html><head><title>${APP_COLOR}</title>
  <style>body{margin:0;font-family:system-ui;background:${COLOR_HEX};
  color:#fff;display:flex;flex-direction:column;align-items:center;
  justify-content:center;height:100vh;text-align:center}
  h1{font-size:5rem;text-transform:uppercase}
  .v{margin-top:1rem;padding:.5rem 1.5rem;border:2px solid #fff;border-radius:999px}
  </style></head><body>
  <h1>${APP_COLOR}</h1>
  <p>Zero-Downtime Blue-Green on AWS EKS</p>
  <div class="v">Version: ${APP_VERSION}</div>
  </body></html>`);
});

app.listen(PORT, () =>
  console.log(`color=${APP_COLOR} version=${APP_VERSION} port=${PORT}`)
);
