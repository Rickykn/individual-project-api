const Service = require("../service");
const { Post, User } = require("../../lib/sequelize");
const fs = require("fs");
const res = require("express/lib/response");

class PostService extends Service {
  static getAllPosts = async (req) => {
    try {
      const { _limit = 30, _page = 1, _sortBy = "", _sortDir = "" } = req.query;

      delete req.query._limit;
      delete req.query._page;
      delete req.query._sortBy;
      delete req.query._sortDir;

      const findPosts = await Post.findAndCountAll({
        where: {
          ...req.query,
        },
        limit: _limit ? parseInt(_limit) : undefined,
        offset: (_page - 1) * _limit,
        include: User,
        order: _sortBy ? [[_sortBy, _sortDir]] : undefined,
      });

      if (!findPosts.rows.length) {
        return this.handleError({
          message: "No posts found",
          statusCode: 400,
        });
      }

      return this.handleSuccess({
        message: "Find all users",
        data: findPosts,
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };

  static createNewPost = async (req) => {
    try {
      const { caption, location } = req.body;
      const { token } = req;

      const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
      const filePath = "post_images";
      const { filename } = req.file;

      const newPost = await Post.create({
        image_url: `${uploadFileDomain}/${filePath}/${filename}`,
        caption,
        location,
        user_id: token.id,
      });

      return this.handleSuccess({
        message: "Post Created",
        statusCode: 201,
        data: newPost,
      });
    } catch (err) {
      console.log(err);
      fs.unlinkSync(__dirname + "/../public/posts/" + req.file.filename);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
  static deletePostById = async (req) => {
    try {
      const { id } = req.params;
      await Post.destroy({
        where: {
          id,
        },
      });
      return this.handleSuccess({
        message: "Deleted Success",
        statusCode: 200,
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

module.exports = PostService;
