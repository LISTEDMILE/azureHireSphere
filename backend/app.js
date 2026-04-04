// const express = require("express");
// const hostRouter = require("./routes/hostRouter");
// const storeRouter = require("./routes/storeRouter");
// const authRouter = require("./routes/authRouter");
// const errorr = require("./controllers/errorrController");
// const rootDir = require("./utils/pathUtils");
// const path = require("path");
// const session = require("express-session");
// require("dotenv").config();
// const MongoDBStore = require("connect-mongodb-session")(session);
// const { default: mongoose } = require("mongoose");
// const DB_path = process.env.MONGO_URL;
// const PORT = process.env.PORT;

// const cors = require("cors");

// const app = express();

// const store = new MongoDBStore({
//   uri: DB_path,
//   collection: "sessions",
// });


// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://gray-bush-0323b2900.7.azurestaticapps.net");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }

//   next();
// });

// app.use(cors({
//     origin: process.env.FRONTEND_URL,
//   credentials: true,
// }));

// app.options("*", cors());

// app.use(express.static(path.join(rootDir, "public")));
// app.use(express.urlencoded());
// app.use(express.json());


// app.set("trust proxy", 1);




// app.use(
//   session({
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: false,
//     store: store,
//     cookie: {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production", // true in prod (HTTPS only)
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       maxAge: 1000 * 60 * 60 * 24,
//     },
//   })
// );

// app.use((req, res, next) => {
//   req.isLoggedIn = req.session.isLoggedIn;
//   req.user = req.session.user;
//   next();
// });

// app.use("/", authRouter);
// app.use("/host", hostRouter);
// app.use("/store", storeRouter);

// app.use(express.static(path.join(rootDir, "../frontend/")));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(rootDir, "../frontend/index.html"));
// });

// mongoose
//   .connect(DB_path)
//   .then(() => {
//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`Server Running at http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.log("error connecting to server", err);
//   });


const express = require("express");
const hostRouter = require("./routes/hostRouter");
const storeRouter = require("./routes/storeRouter");
const authRouter = require("./routes/authRouter");
const rootDir = require("./utils/pathUtils");
const path = require("path");
const session = require("express-session");
require("dotenv").config();
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");

const DB_path = process.env.MONGO_URL;
const PORT = process.env.PORT;

const app = express();

/* =========================
   🔥 FIX: HANDLE OPTIONS FIRST
   ========================= */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://gray-bush-0323b2900.7.azurestaticapps.net");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // 🔥 THIS LINE FIXES EVERYTHING
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

/* =====================

/* =========================
   BODY PARSING
   ========================= */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* =========================
   STATIC FILES
   ========================= */
app.use(express.static(path.join(rootDir, "public")));

/* =========================
   SESSION STORE
   ========================= */
const store = new MongoDBStore({
  uri: DB_path,
  collection: "sessions",
});

/* =========================
   TRUST PROXY (AZURE)
   ========================= */
app.set("trust proxy", 1);

/* =========================
   SESSION CONFIG
   ========================= */
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

/* =========================
   CUSTOM MIDDLEWARE
   ========================= */
app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn;
  req.user = req.session.user;
  next();
});

/* =========================
   ROUTES
   ========================= */
app.use("/", authRouter);
app.use("/host", hostRouter);
app.use("/store", storeRouter);

/* =========================
   FRONTEND SERVE
   ========================= */
app.use(express.static(path.join(rootDir, "../frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(rootDir, "../frontend/index.html"));
});

/* =========================
   DB + SERVER START
   ========================= */
mongoose
  .connect(DB_path)
  .then(() => {
    console.log("✅ DB Connected");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on PORT ${PORT} new`);
    });
  })
  .catch((err) => {
    console.log("❌ DB connection error:", err);
  });