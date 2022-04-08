const { Comment, User } = require("../../lib/sequelize");
const Service = require("../service");

class CommentService extends Service {
  static getCommentByPostId = async (req) => {
    try {
      const { postId } = req.params;

      const findCommentByPostId = await Comment.findAll({
        where: { post_id: postId },
        include: User,
      });

      return this.handleSuccess({
        message: "Find Comment",
        statusCode: 200,
        data: findCommentByPostId,
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
