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

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.json());
app.use(passport.initialize());

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
app.use((err, req, res, next) => {
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
