const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const path = require("path");
const app = express();
const pgSession = require("connect-pg-simple")(session);

const pool = require("./db/pool");
const indexRouter = require("./routes/indexRouter");
const authRouter = require("./routes/authRouter");
const uploadRouter = require("./routes/uploadRouter");
const errorHandler = require("./middlewares/errorMiddleware");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: "user_sessions",
    }),
    secret: process.env.SESSION_SECRET || "cats",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.session());

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = rows[0];
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Storing values into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Retrieve data from session in all routes
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    const user = rows[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use("/", authRouter);
app.use("/drive", indexRouter);
app.use("/upload", uploadRouter);
app.use(errorHandler);

app.listen(3000, () => console.log("Server started on http://localhost:3000"));
