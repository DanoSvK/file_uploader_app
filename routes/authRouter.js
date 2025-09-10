const passport = require("passport");
const { Router } = require("express");
const bcrypt = require("bcryptjs");
const authRouter = Router();
const controller = require("../controllers/dbController");

const pool = require("../db/pool");

authRouter.get("/", (req, res) => {
  res.redirect("/drive");
});

authRouter.get("/sign-up/check-input", async (req, res) => {
  const user = await controller.getUserByInput(req, res);
  console.log(user);
  res.json({ user });
});

// Sign-up
authRouter.get("/sign-up", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/drive");
  } else {
    res.render("sign-up", { title: "Sign up" });
  }
});

authRouter.get("/sign-in", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/drive");
  } else {
    res.render("sign-in", { title: "Sign in" });
  }
});

authRouter.post("/sign-up", async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [req.body.username, req.body.email, hashedPassword]
    );
    res.redirect("/sign-in");
  } catch (err) {
    console.error("❌ Sign-up error:", err);
    return next(err);
  }
});

// Log-in
authRouter.post(
  "/sign-in",
  passport.authenticate("local", {
    successRedirect: "/drive",
    failureRedirect: "/sign-in",
  })
);

// Log-out
authRouter.post("/sign-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/sign-in");
  });
});

module.exports = authRouter;
