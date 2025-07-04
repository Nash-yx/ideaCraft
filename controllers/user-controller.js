const userController = {
  signupPage: (req, res) => {
    res.render("signup");
  },
  signup: (req, res) => {
    res.send("signup");
  },
  loginPage: (req, res) => {
    res.render("login");
  },
  login: (req, res) => {
    res.send("login");
  },
};

module.exports = userController;
