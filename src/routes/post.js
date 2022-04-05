const { postControllers } = require("../controllers");
const PostService = require("../services/posts");
const fileUploader = require("../lib/uploader");
const router = require("express").Router();

// router.get("/", async (req, res) => {
//   try {
//     const serviceResult = await PostService.getAllPosts(req);
//     console.log(serviceResult);

//     if (!serviceResult.success) throw serviceResult;

//     return res.status(serviceResult.statusCode || 200).json({
//       message: serviceResult.message,
//       result: serviceResult.data,
//     });
//   } catch (err) {
//     return res.status(err.statusCode || 500).json({
//       message: err.message,
//     });
//   }
// });

router.get("/", postControllers.getAllPosts);
router.post(
  "/",
  fileUploader({
    destinationFolder: "posts",
    fileType: "image",
    prefix: "POST",
  }).single("post_image_file"),
  postControllers.createNewPost
);

module.exports = router;
