const mysql = require("mysql2");
const bcrypt = require("bcryptjs");

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'akk-12',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Wrapper to make mysql2 behave somewhat like sqlite3 for our existing code
const db = {
  run: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    // Replace ? with ?, mysql uses ?, same as sqlite
    pool.query(sql, params, (err, results) => {
      if (callback) callback(err);
    });
  },
  all: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.query(sql, params, (err, results) => {
      if (callback) callback(err, results);
    });
  },
  get: (sql, params, callback) => {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    pool.query(sql, params, (err, results) => {
      if (callback) callback(err, results && results.length > 0 ? results[0] : undefined);
    });
  },
  serialize: (callback) => {
    callback();
  }
};

const init = () => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Error connecting to MySQL:", err.message);
      return;
    }
    console.log("✅ Connected to MySQL database 'akk-12'");
    
    // Convert SQLite AUTOINCREMENT to MySQL AUTO_INCREMENT
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        avatar VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS services (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        icon_color VARCHAR(50),
        features TEXT,
        active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS projects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        tech_stack VARCHAR(255),
        image VARCHAR(255),
        live_url VARCHAR(255),
        github_url VARCHAR(255),
        featured TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS posts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content LONGTEXT NOT NULL,
        image VARCHAR(255),
        category VARCHAR(100),
        tags VARCHAR(255),
        author_id INT,
        author_name VARCHAR(255),
        views INT DEFAULT 0,
        published TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS contacts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS testimonials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        designation VARCHAR(255),
        company VARCHAR(255),
        message TEXT NOT NULL,
        rating INT DEFAULT 5,
        avatar VARCHAR(255),
        active TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    let completed = 0;
    queries.forEach(query => {
      connection.query(query, (err) => {
        if (err) console.error("Error creating table:", err.message);
        completed++;
        if (completed === queries.length) {
          connection.release();
          seedData();
        }
      });
    });
  });
};

function seedData() {
  // Seed admin user
  db.get("SELECT * FROM users WHERE role = 'admin'", (err, row) => {
    if (!row) {
      const hash = bcrypt.hashSync("ankit@202@", 10);
      db.run(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ["Ankit Chauhan", "ankitchauhan.mobrilz@gmail.com", hash, "admin"]
      );
      console.log("✅ Admin user created: ankitchauhan.mobrilz@gmail.com / ankit@202@");
    }
  });

  // Seed services
  db.get("SELECT COUNT(*) as count FROM services", (err, row) => {
    if (row && row.count === 0) {
      const services = [
        [
          "WordPress Development",
          "Custom WordPress themes and plugins built from scratch. Full site development, theme customization, and migrations.",
          "🌐",
          "purple",
          "Custom Theme Development,Plugin Development & Integration,Elementor / Gutenberg Expert,WordPress Security & Optimization"
        ],
        [
          "Headless CMS Development",
          "Modern, decoupled CMS architecture for maximum performance and flexibility. API-first approach with React/Next.js frontend.",
          "⚡",
          "blue",
          "Strapi CMS Setup & Config,Contentful / Sanity Integration,REST & GraphQL APIs,Next.js + CMS Integration"
        ],
        [
          "E-Commerce Solutions",
          "Complete e-commerce stores with WooCommerce, product management, payment gateways, and order management systems.",
          "🛒",
          "green",
          "WooCommerce Development,Payment Gateway Integration,Custom Shop Features,Inventory Management"
        ],
        [
          "SEO & Performance",
          "Technical SEO audits, on-page optimization, Core Web Vitals improvement, and speed optimization.",
          "🔍",
          "pink",
          "Technical SEO Audit,Core Web Vitals Optimization,Page Speed Optimization,Yoast SEO Configuration"
        ]
      ];
      services.forEach((s) => {
        db.run("INSERT INTO services (title, description, icon, icon_color, features) VALUES (?, ?, ?, ?, ?)", s);
      });
      console.log("✅ Sample services seeded");
    }
  });

  // Seed projects
  db.get("SELECT COUNT(*) as count FROM projects", (err, row) => {
    if (row && row.count === 0) {
      const projects = [
        [
          "E-Commerce CMS Platform",
          "A full-featured content management system for e-commerce businesses with product management, order tracking, and analytics dashboard.",
          "CMS",
          "WordPress, WooCommerce, PHP, MySQL",
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
          "#",
          "#",
          1
        ],
        [
          "Corporate Headless Website",
          "A blazing fast corporate website built with Next.js on the frontend and Strapi CMS on the backend.",
          "Headless CMS",
          "Next.js, Strapi, Tailwind CSS, GraphQL",
          "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
          "#",
          "#",
          1
        ],
        [
          "Real Estate Portal",
          "Custom WordPress development with advanced property search, agent dashboards, and interactive maps.",
          "WordPress",
          "WordPress, PHP, Google Maps API",
          "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
          "#",
          "#",
          0
        ]
      ];
      projects.forEach((s) => {
        db.run("INSERT INTO projects (title, description, category, tech_stack, image, live_url, github_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", s);
      });
      console.log("✅ Sample projects seeded");
    }
  });

  // Seed posts
  db.get("SELECT COUNT(*) as count FROM posts", (err, row) => {
    if (row && row.count === 0) {
      const posts = [
        [
          "Why Headless CMS is the Future of Web Development",
          "why-headless-cms-is-future",
          "Discover how decoupling your frontend from the backend can lead to better performance and flexibility.",
          "<p>Traditional CMS architectures have served us well, but the demands of modern web development require more flexibility. Headless CMS separates the content repository from the presentation layer...</p><h2>Benefits of Headless Architecture</h2><ul><li>Omnichannel content delivery</li><li>Better performance with modern frameworks</li><li>Enhanced security</li><li>Developer flexibility</li></ul><p>By using APIs to deliver content, developers can use their favorite tools like React, Vue, or Next.js to build lightning-fast user interfaces.</p>",
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
          "Headless CMS",
          "Architecture, CMS, Next.js",
          1,
          "Ankit Chauhan",
          145
        ],
        [
          "Top 10 Essential WordPress Plugins for 2024",
          "top-10-essential-wordpress-plugins",
          "Boost your WordPress site's performance, security, and SEO with these must-have plugins.",
          "<p>With over 60,000 plugins in the WordPress repository, finding the right ones can be overwhelming. Here are the top plugins you need for a robust website...</p>",
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
          "WordPress",
          "Plugins, WordPress, Guide",
          1,
          "Ankit Chauhan",
          89
        ]
      ];
      posts.forEach((s) => {
        db.run("INSERT INTO posts (title, slug, excerpt, content, image, category, tags, published, author_name, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", s);
      });
      console.log("✅ Sample posts seeded");
    }
  });
}

module.exports = { db, init };
