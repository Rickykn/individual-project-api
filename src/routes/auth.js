const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");
const authService = require("../services/auth");
const router = require("express").Router();

router.post("/login", async (req, res) => {
  try {
    const serviceResult = await authService.login(req);

    if (!serviceResult) throw serviceResult;
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

router.post("/register", async (req, res) => {
  try {
    const serviceResult = await authService.register(req);

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

router.get("/refresh-token", authorizedLoggedInUser, async (req, res) => {
  try {
    const serviceResult = await authService.keepLogin(req);

    if (!serviceResult) throw serviceResult;

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
