const express = require("express");
const router = express.Router();
const { db } = require("../config/database");
const nodemailer = require("nodemailer");

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Home Page
router.get("/", (req, res) => {
  db.all("SELECT * FROM projects WHERE featured = 1 LIMIT 3", (err, projects) => {
    db.all("SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT 3", (err2, posts) => {
      db.all("SELECT * FROM testimonials WHERE active = 1", (err3, testimonials) => {
        db.all("SELECT * FROM services WHERE active = 1 LIMIT 4", (err4, services) => {
          res.render("pages/home", {
            title: "Ankit Chauhan - CMS Developer",
            projects: projects || [],
            posts: posts || [],
            testimonials: testimonials || [],
            services: services || [],
            activePage: "home",
          });
        });
      });
    });
  });
});

// About Page
router.get("/about", (req, res) => {
  res.render("pages/about", {
    title: "About - Ankit Chauhan",
    activePage: "about",
  });
});

// Services Page
router.get("/services", (req, res) => {
  db.all("SELECT * FROM services WHERE active = 1", (err, services) => {
    res.render("pages/services", {
      title: "Services - Ankit Chauhan",
      services: services || [],
      activePage: "services",
    });
  });
});

// Portfolio Page
router.get("/portfolio", (req, res) => {
  db.all("SELECT * FROM projects ORDER BY created_at DESC", (err, projects) => {
    res.render("pages/portfolio", {
      title: "Portfolio - Ankit Chauhan",
      projects: projects || [],
      activePage: "portfolio",
    });
  });
});

// Single Project
router.get("/portfolio/:id", (req, res) => {
  db.get("SELECT * FROM projects WHERE id = ?", [req.params.id], (err, project) => {
    if (!project) return res.redirect("/portfolio");
    res.render("pages/project-single", {
      title: `${project.title} - Ankit Chauhan`,
      project,
      activePage: "portfolio",
    });
  });
});

// Blog Page
router.get("/blog", (req, res) => {
  db.all("SELECT p.*, u.name as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.published = 1 ORDER BY p.created_at DESC", (err, posts) => {
    res.render("pages/blog", {
      title: "Blog - Ankit Chauhan",
      posts: posts || [],
      activePage: "blog",
    });
  });
});

// Single Blog Post
router.get("/blog/:slug", (req, res) => {
  db.get(
    "SELECT p.*, u.name as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id WHERE p.slug = ? AND p.published = 1",
    [req.params.slug],
    (err, post) => {
      if (!post) return res.redirect("/blog");
      // Increment views
      db.run("UPDATE posts SET views = views + 1 WHERE slug = ?", [req.params.slug]);
      db.all(
        "SELECT * FROM posts WHERE published = 1 AND slug != ? ORDER BY created_at DESC LIMIT 3",
        [req.params.slug],
        (err2, relatedPosts) => {
          res.render("pages/blog-single", {
            title: `${post.title} - Ankit Chauhan`,
            post,
            relatedPosts: relatedPosts || [],
            activePage: "blog",
          });
        }
      );
    }
  );
});

// Contact Page
router.get("/contact", (req, res) => {
  res.render("pages/contact", {
    title: "Contact - Ankit Chauhan",
    activePage: "contact",
  });
});

// Contact Form Submit
router.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    req.flash("error_msg", "Please fill all required fields.");
    return res.redirect("/contact");
  }
  db.run(
    "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)",
    [name, email, subject, message],
    (err) => {
      if (err) {
        req.flash("error_msg", "Something went wrong. Please try again.");
        return res.redirect("/contact");
      }
      
      // Send email
      const mailOptions = {
        from: `"${name}" <${email}>`,
        to: process.env.EMAIL_USER, // Super admin email
        subject: `New Contact from Website: ${subject || 'No Subject'}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          // Don't show error to user, as DB save was successful
        }
      });

      req.flash("success_msg", "Thank you! Your message has been sent. I'll get back to you soon.");
      res.redirect("/contact");
    }
  );
});

module.exports = router;
