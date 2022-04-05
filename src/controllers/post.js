const { Post, User } = require("../lib/sequelize");

const postControllers = {
  getAllPosts: async (req, res) => {
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
        // include: User,
        order: _sortBy ? [[_sortBy, _sortDir]] : undefined,
      });

      if (!findPosts.rows.length) {
        return res.status(400).json({
          message: "not found",
        });
      }

      return res.status(200).json({
        message: "Find posts",
        result: findPosts,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  createNewPost: async (req, res) => {
    try {
      const { caption, location } = req.body;

      const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
      const filePath = "post_images";
      const { filename } = req.file;

      const newPost = await Post.create({
        image_url: `${uploadFileDomain}/${filePath}/${filename}`,
        caption,
        location,
        // user_id: req.token.id,cap
      });

      return res.status(201).json({
        message: "Post created",
        result: newPost,
      });
    } catch (err) {
      console.log(err);
      fs.unlinkSync(__dirname + "/../public/posts/" + req.file.filename);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
};

module.exports = postControllers;
