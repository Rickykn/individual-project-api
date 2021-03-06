const Service = require("../service");
const {
  User,
  VerificationToken,
  ForgotPasswordToken,
} = require("../../lib/sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../lib/jwt");
const fs = require("fs");
const { nanoid } = require("nanoid");
const moment = require("moment");
const mustache = require("mustache");
const mailer = require("../../lib/mailer");

class authService extends Service {
  static register = async (req) => {
    try {
      const { username, email, password } = req.body;

      const isUsernameEmailTaken = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (isUsernameEmailTaken) {
        return this.handleError({
          message: "Username and Email has been taken",
          statusCode: 400,
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 5);
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      const verificationToken = nanoid(40);

      await VerificationToken.create({
        token: verificationToken,
        user_id: newUser.id,
        valid_until: moment().add(1, "hour"),
        is_valid: true,
      });

      const verificationLink = `http://localhost:2000/auth/verify/${verificationToken}`;

      const template = fs
        .readFileSync(__dirname + "/../../templates/verify.html")
        .toString();

      const renderedTemplate = mustache.render(template, {
        username,
        verify_url: verificationLink,
      });

      await mailer({
        to: email,
        subject: "Verify your account!",
        html: renderedTemplate,
      });

      return this.handleSuccess({
        message: "Registered User",
        statusCode: 201,
        data: newUser,
      });
    } catch (err) {
      console.log(err);

      this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
  static login = async (req) => {
    try {
      // const { username, password } = req.body;
      const { credential, password } = req.body;

      const findUser = await User.findOne({
        where: {
          [Op.or]: [{ username: credential }, { email: credential }],
        },
      });

      if (!findUser) {
        return this.handleError({
          message: "Wrong username or password",
          statusCode: 400,
        });
      }

      const isPasswordCorrect = bcrypt.compareSync(password, findUser.password);

      if (!isPasswordCorrect) {
        return this.handleError({
          message: "wrong username or password",
          statusCode: 400,
        });
      }

      delete findUser.dataValues.password;

      const token = generateToken({
        id: findUser.id,
        role: findUser.role,
      });

      return this.handleSuccess({
        message: "Logged in user",
        statusCode: 200,
        data: {
          user: findUser,
          token,
        },
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
  static keepLogin = async (req) => {
    try {
      const { token } = req;

      const renewedToken = generateToken({ id: token.id });

      const findUser = await User.findByPk(token.id);

      if (!findUser) {
        return this.handleError({
          message: "User not found",
          statusCode: 400,
        });
      }
      delete findUser.dataValues.password;

      return this.handleSuccess({
        message: "Renewed user token",
        statusCode: 200,
        data: {
          user: findUser,
          token: renewedToken,
        },
      });
    } catch (err) {
      console.log(err);

      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static verifyUser = async (req) => {
    try {
      const { token } = req.params;

      const findToken = await VerificationToken.findOne({
        where: {
          token,
          is_valid: true,
          valid_until: {
            [Op.gt]: moment().utc(),
          },
        },
      });

      if (!findToken) {
        return this.handleError({
          message: "Your token is invalid",
          statusCode: 400,
        });
      }

      await User.update(
        { is_verified: true },
        {
          where: {
            id: findToken.user_id,
          },
        }
      );

      findToken.is_valid = false;
      findToken.save();

      return this.handleRedirect({
        link: `http://localhost:3000/verification_page`,
      });
    } catch (err) {
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static resendVerificationEmail = async (req) => {
    try {
      const { id } = req.token;

      await VerificationToken.update(
        { is_valid: false },
        {
          where: {
            is_valid: true,
            user_id: id,
          },
        }
      );

      const verificationToken = nanoid(40);

      await VerificationToken.create({
        token: verificationToken,
        is_valid: true,
        user_id: id,
        valid_until: moment().add(1, "hour"),
      });

      const findUser = await User.findByPk(id);

      const verificationLink = `http://localhost:2000/auth/verify/${verificationToken}`;

      const template = fs
        .readFileSync(__dirname + "/../../templates/verify.html")
        .toString();

      const renderedTemplate = mustache.render(template, {
        username: findUser.username,
        verify_url: verificationLink,
      });

      await mailer({
        to: findUser.email,
        subject: "Verify your account!",
        html: renderedTemplate,
      });

      return this.handleSuccess({
        message: "Resent verification email",
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static sendForgotPasswordEmail = async (req) => {
    try {
      const { email } = req.body;

      const findUser = await User.findOne({
        where: {
          email,
        },
      });

      const passwordToken = nanoid(40);

      await ForgotPasswordToken.update(
        { is_valid: false },
        {
          where: {
            user_id: findUser.id,
            is_valid: true,
          },
        }
      );

      await ForgotPasswordToken.create({
        token: passwordToken,
        valid_until: moment().add(1, "hour"),
        is_valid: true,
        user_id: findUser.id,
      });

      const forgotPasswordLink = `http://localhost:3000/reset_password?fp_token=${passwordToken}`;

      const template = fs
        .readFileSync(__dirname + "/../../templates/forgot.html")
        .toString();

      const renderedTemplate = mustache.render(template, {
        username: findUser.username,
        forgot_password_url: forgotPasswordLink,
      });

      await mailer({
        to: findUser.email,
        subject: "Forgot password!",
        html: renderedTemplate,
      });

      return this.handleSuccess({
        statusCode: 201,
        message: "Email has been sent",
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static ChangePassword = async (req) => {
    try {
      const { password, forgotPasswordToken } = req.body;
      console.log(password);
      console.log(forgotPasswordToken);

      const findToken = await ForgotPasswordToken.findOne({
        where: {
          token: forgotPasswordToken,
          is_valid: true,
          valid_until: {
            [Op.gt]: moment().utc(),
          },
        },
      });

      if (!findToken) {
        return this.handleError({
          statusCode: 400,
          message: "Invalid token",
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 5);

      await User.update(
        { password: hashedPassword },
        {
          where: {
            id: findToken.user_id,
          },
        }
      );
      return this.handleSuccess({
        statusCode: 200,
        message: "Change password success",
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
}

module.exports = authService;
