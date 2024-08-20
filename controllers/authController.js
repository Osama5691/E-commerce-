const userModel = require("../models/user-model")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {generateToken}= require("../utils/generateToken");


module.exports.registerUser = async (req, res) => {
  try {
    let { email, password, fullname } = req.body;

    let user = await userModel.findOne({ email: email });
    if (user) { 
       req.flash("error","You already have an account, please log in")
       res.redirect("/")
    }
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        if (err) return res.send(err.message);
        else {
          let user = await userModel.create({
            email,
            password: hash,
            fullname
          });
          let token = generateToken(user)
          res.cookie("token", token);
          res.flash("/shop")
        }
      })
    });
  } catch (err) {
    res.send(err, message);
  }
}

module.exports.loginUser = async function(req, res) {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email: email });
    if (!user) {
        req.flash("error", "Email or Password incorrect");
        return res.redirect("/");
    }

    bcrypt.compare(password, user.password, function(err, result) {
        if (err) {
            req.flash("error", "An error occurred during login");
            return res.redirect("/");
        }

        if (result) {
            let token = generateToken(user);
            res.cookie("token", token);
            res.redirect("/shop");
        } else {
            req.flash("error", "Email or Password incorrect");
            return res.redirect("/");
        }
    });
};






module.exports.logout = function(req,res){
    res.cookie("token","");
    res.redirect("/");
}