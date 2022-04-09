const { Comment, User } = require("../../lib/sequelize");
const Service = require("../service");

class CommentService extends Service {
  static getCommentByPostId = async (req) => {
    try {
      const { _limit = 30, _page = 1, _sortBy = "", _sortDir = "" } = req.query;
      const { postId } = req.params;

      delete req.query._limit;
      delete req.query._page;
      delete req.query._sortBy;
      delete req.query._sortDir;

      const findCommentByPostId = await Comment.findAndCountAll({
        where: {
          ...req.query,
          post_id: postId,
        },
        limit: _limit ? parseInt(_limit) : undefined,
        offset: (_page - 1) * _limit,
        include: User,
        distinct: true,
        order: _sortBy ? [[_sortBy, _sortDir]] : undefined,
      });

      return this.handleSuccess({
        message: "Find Comment",
        statusCode: 200,
        data: findCommentByPostId,
      });
    } catch (err) {
      console.log(err);
      return this.handleError({
        message: "Server Error",
        statusCode: 500,
      });
    }
  };
  static createComment = async (req) => {
    try {
      const { comment_content, post_id } = req.body;
      const { token } = req;

      const newComment = await Comment.create({
        comment_content,
        user_id: token.id,
        post_id,
      });

      return this.handleSuccess({
        message: "Success Comment this post",
        statusCode: 201,
        data: newComment,
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

module.exports = CommentService;
