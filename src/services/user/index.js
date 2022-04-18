const fs = require("fs");
const { User } = require("../../lib/sequelize");
const Service = require("../service");

class UserService extends Service {
  static editUserProfile = async (req) => {
    try {
      const { username, fullname, bio } = req.body;
      const { token } = req;

      const findUser = await User.findOne({ where: { username } });

      if (findUser) {
        return this.handleError({
          message: "Username already taken",
          statusCode: 400,
        });
      }
      const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
      const filePath = "profile_images";
      const filename = req.file?.filename;

      console.log(filename);

      await User.update(
        {
          username,
          profile_picture: req.file
            ? `${uploadFileDomain}/${filePath}/${filename}`
            : undefined,
          fullname,
          bio,
        },
        {
          where: { id: token.id },
        }
      );

      const newDataUser = await User.findByPk(token.id);

      return this.handleSuccess({
        message: "Edited Post",
        statusCode: 200,
        data: newDataUser,
      });
    } catch (err) {
      console.log(err);
      fs.unlinkSync(
        __dirname + "/../public/profile-picture/" + req.file.filename
      );
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static getUserById = async (req) => {
    try {
      const { id } = req.params;

      const data = await await User.findByPk(id);

      if (!data) {
        return this.handleError({
          message: "Post Not Found",
          statusCode: 400,
        });
      }

      return this.handleSuccess({
        message: "User Found",
        statusCode: 200,
        data: data,
      });
    } catch (err) {
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
}

module.exports = UserService;
