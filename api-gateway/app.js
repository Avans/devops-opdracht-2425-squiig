const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");
const createError = require("http-errors");

require("./services/database.js").connectAndSeed();

const passport = require("./auth/passport.js");
const checkRole = require("./auth/authorization.js");

const submissionsRouter = require("./routes/submissions");
const targetsRouter = require("./routes/targets");
const authcRouter = require("./auth/authenticationRouter.js");
const readRouter = require("./routes/read");

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

module.exports = app;
