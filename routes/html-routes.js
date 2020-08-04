// Requiring path to so we can use relative routes to our HTML files
const path = require("path");
const db = require("../models");

// Requiring our custom middleware for checking if a user is logged in
const isAuthenticated = require("../config/middleware/isAuthenticated");

module.exports = function(app) {
  app.get("/", (req, res) => {
    // If the user already has an account send them to the members page
    if (req.user) {
      return res.redirect("/home");
    }
    res.sendFile(path.join(__dirname, "../public/signup.html"));
  });

  app.get("/login", (req, res) => {
    // If the user already has an account send them to the members page
    if (req.user) {
      return res.redirect("/home");
    }
    res.sendFile(path.join(__dirname, "../public/login.html"));
  });

  // Here we've add our isAuthenticated middleware to this route.
  // If a user who is not logged in tries to access this route they will be redirected to the signup page
  app.get("/home", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "../public/home.html"));
  });

  // Send the user to the "About" page
  app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/about.html"));
  });

  // Render the "mylearns" page, where the user's past learns
  // are stored in a board-like database
  app.get("/mylearns", isAuthenticated, (req, res) => {
    db.page
      .findAll({
        where: {
          UserId: req.user.id
        },
        order: [["rating", "DESC"]]
      })
      .then(pageSet => {
        const hbsObject = {
          pages: pageSet
        };
        res.render("mylearns", hbsObject);
      })
      .catch(err => {
        console.log(err);
      });
  });

  // Highest rated learns page
  app.get("/toppages", isAuthenticated, (req, res) => {
    db.page
      .findAll({
        limit: 50,
        order: [["rating", "DESC"]]
      })
      .then(pageSet => {
        const hbsObject = {
          pages: pageSet
        };
        res.render("toppages", hbsObject);
      })
      .catch(err => {
        console.log(err);
      });
  });
};
