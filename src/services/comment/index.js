const { Comment } = require("../../lib/sequelize");
const Service = require("../service");

class CommentService extends Service {
  static getCommentByUserId = async (req) => {
    try {
      const { userId } = req.params;

      const findCommentByUserId = await Comment.findAll({
        where: { user_id: userId },
      });

      return this.handleSuccess({
        message: "Find Comment",
        statusCode: 200,
        data: findCommentByUserId,
      });
    } catch (err) {
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
