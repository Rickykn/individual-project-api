const { Op } = require("sequelize");
const { User } = require("../lib/sequelize");
const bcrypt = require("bcrypt");

const authControllers = {
  registerUser: async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        repeatPassword,
        bio,
        profile_picture,
      } = req.body;

      const isUsernameEmailTaken = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (!(password === repeatPassword)) {
        return res.status(400).json({
          message: "Password and the repeat password has to be the same",
        });
      }

      if (isUsernameEmailTaken) {
        return res.status(400).json({
          message: "Username and Email has been taken",
        });
      }
      const hashedPassword = bcrypt.hashSync(password, 5);
      await User.create({
        username,
        email,
        profile_picture,
        password: hashedPassword,
        bio,
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
};

module.exports = authControllers;
