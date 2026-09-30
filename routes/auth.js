const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { db } = require("../config/database");

// Login Page
router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("auth/login", {
    title: "Login - Ankit Chauhan",
    activePage: "login",
  });
});

// Login POST
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash("error_msg", "Please fill in all fields.");
    return res.redirect("/auth/login");
  }
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (!user) {
      req.flash("error_msg", "Invalid email or password.");
      return res.redirect("/auth/login");
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) {
        req.flash("error_msg", "Invalid email or password.");
        return res.redirect("/auth/login");
      }
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      };
      req.flash("success_msg", `Welcome back, ${user.name}!`);
      if (user.role === "admin") {
        res.redirect("/admin/dashboard");
      } else {
        res.redirect("/");
      }
    });
  });
});

// Register Page
router.get("/register", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("auth/register", {
    title: "Register - Ankit Chauhan",
    activePage: "register",
  });
});

// Register POST
router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push("Please fill in all fields.");
  }
  if (password !== password2) {
    errors.push("Passwords do not match.");
  }
  if (password && password.length < 6) {
    errors.push("Password must be at least 6 characters.");
  }

  if (errors.length > 0) {
    return res.render("auth/register", {
      title: "Register - Ankit Chauhan",
      errors,
      name,
      email,
      activePage: "register",
    });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (user) {
      errors.push("Email is already registered.");
      return res.render("auth/register", {
        title: "Register - Ankit Chauhan",
        errors,
        name,
        email,
        activePage: "register",
      });
    }
    bcrypt.hash(password, 10, (err, hash) => {
      db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hash],
        (err) => {
          if (err) {
            req.flash("error_msg", "Registration failed. Please try again.");
            return res.redirect("/auth/register");
          }
          req.flash("success_msg", "Registration successful! Please login.");
          res.redirect("/auth/login");
        }
      );
    });
  });
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

module.exports = router;
