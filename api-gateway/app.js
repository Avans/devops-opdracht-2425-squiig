import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig.js";
import createError from "http-errors";

import passport from "./auth/passport.js";
import checkRole from "./auth/authorization.js";

import submissionsRouter from "./routes/submissions.js";
import targetsRouter from "./routes/targets.js";
import authcRouter from "./auth/authenticationRouter.js";
import readRouter from "./routes/read.js";

import promBundle from "express-prom-bundle";

const metricsMiddleware = promBundle({
  includePath: true,
  includeStatusCode: true,
  normalizePath: true,
  promClient: {
    collectDefaultMetrics: { },
  },
});

import client from "prom-client";
const gauge = new client.Gauge({
  name: "apigateway_http_requests_in_progress",
  help: "Number of http requests in progress to the API Gateway",
});

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.json());
app.use(passport.initialize());
app.use(metricsMiddleware);

app.use((req, res, next) => {
  gauge.inc(1);
  res.on("close", () => {
    gauge.dec(1);
  });
  next();
});

/** Routes */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/users", authcRouter);
app.use(
  "/submissions",
  passport.authenticate("jwt", { session: false }),
  checkRole(["user", "admin"]),
  submissionsRouter
);
app.use(
  "/targets",
  passport.authenticate("jwt", { session: false }),
  checkRole(["user", "admin"]),
  targetsRouter
);
app.use(
  "/read",
  passport.authenticate("jwt", { session: false }),
  checkRole(["user", "admin"]),
  readRouter
);

// catch 404 and forward to error handler
app.use(async function (req, res, next) {
  next(createError(404, req.body));
});

// generic error handler
app.use((err, req, res, _next) => {
  const isDev = app.get("env") === "development";
  const msg = isDev
    ? err
    : "An unexpected error occurred. Please try again later.";
  res.status(err.status || 500).send(msg);
  if (isDev) {
    console.error(err);
  }
});

export default app;
