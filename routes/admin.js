const express = require("express");
const router = express.Router();
const { db } = require("../config/database");

// Admin auth middleware
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  req.flash("error_msg", "Access denied. Admin only.");
  res.redirect("/auth/login");
};

// Dashboard
router.get("/dashboard", isAdmin, (req, res) => {
  db.get("SELECT COUNT(*) as count FROM projects", (err, projects) => {
    db.get("SELECT COUNT(*) as count FROM posts", (err2, posts) => {
      db.get("SELECT COUNT(*) as count FROM contacts WHERE status = 'unread'", (err3, messages) => {
        db.get("SELECT COUNT(*) as count FROM users", (err4, users) => {
          db.all("SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5", (err5, recentMessages) => {
            res.render("admin/dashboard", { layout: "admin/layout",
              title: "Admin Dashboard - Ankit Chauhan",
              stats: {
                projects: projects ? projects.count : 0,
                posts: posts ? posts.count : 0,
                messages: messages ? messages.count : 0,
                users: users ? users.count : 0,
              },
              recentMessages: recentMessages || [],
              activePage: "dashboard",
            });
          });
        });
      });
    });
  });
});

// Messages
router.get("/messages", isAdmin, (req, res) => {
  db.all("SELECT * FROM contacts ORDER BY created_at DESC", (err, messages) => {
    res.render("admin/messages", { layout: "admin/layout",
      title: "Messages - Admin",
      messages: messages || [],
      activePage: "messages",
    });
  });
});

// Mark message as read
router.post("/messages/:id/read", isAdmin, (req, res) => {
  db.run("UPDATE contacts SET status = 'read' WHERE id = ?", [req.params.id], () => {
    res.redirect("/admin/messages");
  });
});

// Services Management
router.get("/services", isAdmin, (req, res) => {
  db.all("SELECT * FROM services ORDER BY created_at DESC", (err, services) => {
    res.render("admin/services", { layout: "admin/layout",
      title: "Services - Admin",
      services: services || [],
      activePage: "services",
    });
  });
});

// Add Service Page
router.get("/services/add", isAdmin, (req, res) => {
  res.render("admin/service-form", { layout: "admin/layout",
    title: "Add Service - Admin",
    service: null,
    activePage: "services",
  });
});

// Add Service POST
router.post("/services/add", isAdmin, (req, res) => {
  const { title, description, icon, icon_color, features, active } = req.body;
  db.run(
    "INSERT INTO services (title, description, icon, icon_color, features, active) VALUES (?, ?, ?, ?, ?, ?)",
    [title, description, icon, icon_color, features, active ? 1 : 0],
    (err) => {
      if (err) req.flash("error_msg", "Failed to add service.");
      else req.flash("success_msg", "Service added successfully!");
      res.redirect("/admin/services");
    }
  );
});

// Edit Service
router.get("/services/edit/:id", isAdmin, (req, res) => {
  db.get("SELECT * FROM services WHERE id = ?", [req.params.id], (err, service) => {
    if (!service) return res.redirect("/admin/services");
    res.render("admin/service-form", { layout: "admin/layout",
      title: "Edit Service - Admin",
      service,
      activePage: "services",
    });
  });
});

// Update Service
router.post("/services/edit/:id", isAdmin, (req, res) => {
  const { title, description, icon, icon_color, features, active } = req.body;
  db.run(
    "UPDATE services SET title=?, description=?, icon=?, icon_color=?, features=?, active=? WHERE id=?",
    [title, description, icon, icon_color, features, active ? 1 : 0, req.params.id],
    (err) => {
      if (err) req.flash("error_msg", "Failed to update service.");
      else req.flash("success_msg", "Service updated successfully!");
      res.redirect("/admin/services");
    }
  );
});

// Delete Service
router.post("/services/delete/:id", isAdmin, (req, res) => {
  db.run("DELETE FROM services WHERE id = ?", [req.params.id], (err) => {
    if (err) req.flash("error_msg", "Failed to delete service.");
    else req.flash("success_msg", "Service deleted successfully!");
    res.redirect("/admin/services");
  });
});

// Projects Management
router.get("/projects", isAdmin, (req, res) => {
  db.all("SELECT * FROM projects ORDER BY created_at DESC", (err, projects) => {
    res.render("admin/projects", { layout: "admin/layout",
      title: "Projects - Admin",
      projects: projects || [],
      activePage: "projects",
    });
  });
});

// Add Project Page
router.get("/projects/add", isAdmin, (req, res) => {
  res.render("admin/project-form", { layout: "admin/layout",
    title: "Add Project - Admin",
    project: null,
    activePage: "projects",
  });
});

// Add Project POST
router.post("/projects/add", isAdmin, (req, res) => {
  const { title, description, category, tech_stack, image, live_url, github_url, featured } = req.body;
  db.run(
    "INSERT INTO projects (title, description, category, tech_stack, image, live_url, github_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [title, description, category, tech_stack, image, live_url, github_url, featured ? 1 : 0],
    (err) => {
      if (err) req.flash("error_msg", "Failed to add project.");
      else req.flash("success_msg", "Project added successfully!");
      res.redirect("/admin/projects");
    }
  );
});

// Edit Project
router.get("/projects/edit/:id", isAdmin, (req, res) => {
  db.get("SELECT * FROM projects WHERE id = ?", [req.params.id], (err, project) => {
    if (!project) return res.redirect("/admin/projects");
    res.render("admin/project-form", { layout: "admin/layout",
      title: "Edit Project - Admin",
      project,
      activePage: "projects",
    });
  });
});

// Update Project
router.post("/projects/edit/:id", isAdmin, (req, res) => {
  const { title, description, category, tech_stack, image, live_url, github_url, featured } = req.body;
  db.run(
    "UPDATE projects SET title=?, description=?, category=?, tech_stack=?, image=?, live_url=?, github_url=?, featured=? WHERE id=?",
    [title, description, category, tech_stack, image, live_url, github_url, featured ? 1 : 0, req.params.id],
    (err) => {
      if (err) req.flash("error_msg", "Failed to update project.");
      else req.flash("success_msg", "Project updated successfully!");
      res.redirect("/admin/projects");
    }
  );
});

// Delete Project
router.post("/projects/delete/:id", isAdmin, (req, res) => {
  db.run("DELETE FROM projects WHERE id = ?", [req.params.id], (err) => {
    if (err) req.flash("error_msg", "Failed to delete project.");
    else req.flash("success_msg", "Project deleted successfully!");
    res.redirect("/admin/projects");
  });
});

// Posts Management
router.get("/posts", isAdmin, (req, res) => {
  db.all("SELECT p.*, u.name as author_name FROM posts p LEFT JOIN users u ON p.author_id = u.id ORDER BY p.created_at DESC", (err, posts) => {
    res.render("admin/posts", { layout: "admin/layout",
      title: "Blog Posts - Admin",
      posts: posts || [],
      activePage: "posts",
    });
  });
});

// Add Post
router.get("/posts/add", isAdmin, (req, res) => {
  res.render("admin/post-form", { layout: "admin/layout",
    title: "Add Post - Admin",
    post: null,
    activePage: "posts",
  });
});

// Add Post POST
router.post("/posts/add", isAdmin, (req, res) => {
  const { title, content, excerpt, image, category, tags, published } = req.body;
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  db.run(
    "INSERT INTO posts (title, slug, content, excerpt, image, author_id, category, tags, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [title, slug, content, excerpt, image, req.session.user.id, category, tags, published ? 1 : 0],
    (err) => {
      if (err) req.flash("error_msg", "Failed to add post. Slug may already exist.");
      else req.flash("success_msg", "Blog post added successfully!");
      res.redirect("/admin/posts");
    }
  );
});

module.exports = router;
