// Requiring our models and passport as we've configured it
const db = require("../models");
const passport = require("../config/passport");
const { sequelize } = require("../models");
// const Sequelize = require("sequelize");

module.exports = function(app) {
  // Using the passport.authenticate middleware with our local strategy.
  // If the user has valid login credentials, send them to the members page.
  // Otherwise the user will be sent an error
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Sending back a password, even a hashed password, isn't a good idea
    res.json({
      email: req.user.email,
      id: req.user.id
    });
  });

  // Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
  // how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
  // otherwise send back an error
  app.post("/api/signup", (req, res) => {
    db.User.create({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    })
      .then(() => {
        res.redirect(307, "/api/login");
      })
      .catch(err => {
        res.status(401).json(err);
      });
  });

  // Route for logging user out
  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // Route for getting some data about our user to be used client side
  app.get("/api/user_data", (req, res) => {
    if (!req.user) {
      // The user is not logged in, send back an empty object
      res.json({});
    } else {
      // Otherwise send back the user's email and id
      // Sending back a password, even a hashed password, isn't a good idea
      res.json({
        email: req.user.email,
        id: req.user.id
      });
    }
  });

  // Unused
  // Route for grabbing data about a user's subjects
  // app.get("/api/categories", (req, res) => {
  //   if (!req.user) {
  //     // If the user isn't logged in, nothing will show up
  //     res.json();
  //   } else {
  //     // Otherwise, send info about the subjects the user will see
  //     db.category.findAll({}).then(dbCat => {
  //       res.json(dbCat);
  //     });
  //   }
  // });

  // Route for grabbing all pages for one user
  // User must be logged in for route to work
  app.get("/api/pages", (req, res) => {
    if (!req.user) {
      res.json();
    } else {
      db.page
        .findAll({
          where: {
            UserId: req.user.id
          }
        })
        .then(page => {
          res.json(page);
        });
    }
  });

  // Unused
  // Route for grabbing data about one subject using ID
  // app.get("/api/category/:id", (req, res) => {
  //   db.category
  //     .findOne({
  //       where: {
  //         id: req.params.id
  //       }
  //     })
  //     .then(dbCat => {
  //       res.json(dbCat);
  //     });
  // });

  // Unused
  // Route for grabbing data for one page using ID
  // app.get("/api/page/:id", (req, res) => {
  //   db.page
  //     .findOne({
  //       where: {
  //         id: req.params.id
  //       }
  //     })
  //     .then(page => {
  //       res.json(page);
  //     });
  // });

  // Route for finding a random subject
  app.get("/api/category", (req, res) => {
    db.category
      .findOne({
        order: sequelize.random()
      })
      .then(dbCat => {
        res.json(dbCat);
      });
  });

  // Route for getting most recent page to update it
  app.get("/api/page/mostrecent", (req, res) => {
    db.page
      .findAll({
        limit: 1,
        order: [['createdAt', 'DESC']]
      })
      .then(dbPage => {
        res.json(dbPage);
      });
  });

  // Create a subject
  app.post("/api/category/add", (req, res) => {
    db.category
      .create({
        name: req.body.name
      })
      .then(dbCat => {
        res.json(dbCat);
      });
  });

  // Create a page
  app.post("/api/page", (req, res) => {
    db.page
      .create({
        name: req.body.name,
        category: req.body.category,
        UserId: req.user.id
      })
      .then(page => {
        res.json(page);
      });
  });

  // Route for updating most recent page's rating
  app.put("/api/page/rate", (req, res) => {
    db.page
      .update(
        {
          rating: req.body.rating
        },
        {
        where: {
          id: req.body.id
        }
        })
      .then(dbPut => {
          res.json(dbPut);
      })
  })

  // Unused
  // Delete a subject
  // app.delete("/api/category/:id", (req, res) => {
  //   db.category
  //     .destroy({
  //       where: {
  //         id: req.params.id
  //       }
  //     })
  //     .then(dbCat => {
  //       res.json(dbCat);
  //     });
  // });

  // Delete a page based on ID
  app.delete("/api/page/:id", (req, res) => {
    db.page
      .destroy({
        where: {
          id: req.params.id
        }
      })
      .then(page => {
        res.json(page);
      });
  });
};
