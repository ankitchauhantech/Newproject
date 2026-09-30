require('dotenv').config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const expressLayouts = require("express-ejs-layouts");

const app = express();

// View engine
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", false); // Default to no layout, we will specify layout per route if needed

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override
app.use(methodOverride("_method"));

// Session
app.use(
  session({
    secret: "ankit-chauhan-cms-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

// Flash messages
app.use(flash());

// Global variables middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.session.user || null;
  next();
});

// Database initialization
const db = require("./config/database");
db.init();

// Routes
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render("404", { title: "Page Not Found", activePage: "" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Ankit Chauhan - CMS Developer Portfolio`);
  console.log(`\n📋 Pages:`);
  console.log(`   🏠 Home     → http://localhost:${PORT}/`);
  console.log(`   👤 About    → http://localhost:${PORT}/about`);
  console.log(`   ⚡ Services  → http://localhost:${PORT}/services`);
  console.log(`   🖥️  Portfolio → http://localhost:${PORT}/portfolio`);
  console.log(`   📝 Blog     → http://localhost:${PORT}/blog`);
  console.log(`   📬 Contact  → http://localhost:${PORT}/contact`);
  console.log(`\n🔐 Auth:`);
  console.log(`   Login    → http://localhost:${PORT}/auth/login`);
  console.log(`   Register → http://localhost:${PORT}/auth/register`);
  console.log(`\n⚙️  Admin Panel → http://localhost:${PORT}/admin/dashboard`);
  console.log(`   Email: ankit@ankitchauhan.dev | Password: admin123\n`);
});