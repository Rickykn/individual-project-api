const CommentService = require("../services/comment");
const router = require("express").Router();
const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");

router.get("/:userId", async (req, res) => {
  try {
    const serviceResult = await CommentService.getCommentByUserId(req);

    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 200).json({
      message: serviceResult.message,
      result: serviceResult.data,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

router.post("/", authorizedLoggedInUser, async (req, res) => {
  try {
    const serviceResult = await CommentService.createComment(req);

    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 201).json({
      message: serviceResult.message,
      result: serviceResult.data,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

module.exports = router;
