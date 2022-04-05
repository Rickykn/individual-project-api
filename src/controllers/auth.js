const { Op } = require("sequelize");
const { User } = require("../lib/sequelize");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { generateToken } = require("../lib/jwt");

const authControllers = {
  registerUser: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      const isUsernameEmailTaken = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (isUsernameEmailTaken) {
        return res.status(400).json({
          message: "Username and Email has been taken",
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 5);
      await User.create({
        username,
        email,
        password: hashedPassword,
      });

      return res.status(201).json({
        message: "Registered user",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Server Error",
      });
    }
  },
  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;

      const findUser = await User.findOne({
        where: {
          username,
        },
      });

      if (!findUser) {
        return res.status(400).json({
          message: "Wrong username or password",
        });
      }

      const isPasswordCorrect = bcrypt.compareSync(password, findUser.password);

      if (!isPasswordCorrect) {
        return res.status(400).json({
          message: "Wrong username or password",
        });
      }

      delete findUser.dataValues.password;

      const token = generateToken({
        id: findUser.id,
        role: findUser.role,
      });

      return res.status(200).json({
        message: "Logged in user",
        result: {
          user: findUser,
          token,
        },
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Server Error",
      });
    }
  },
  keepLogin: async (req, res) => {
    try {
      const { token } = req;

      const renewedToken = generateToken({ id: token.id });

      const findUser = await User.findByPk(token.id);

      delete findUser.dataValues.password;

      return res.status(200).json({
        message: "Renewed user token",
        result: {
          user: findUser,
          token: renewedToken,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
};

module.exports = authControllers;
