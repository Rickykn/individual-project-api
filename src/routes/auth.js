const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");
const authService = require("../services/auth");
const router = require("express").Router();

router.post("/login", async (req, res) => {
  try {
    const serviceResult = await authService.login(req);

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

router.get("/verify/:token", async (req, res) => {
  try {
    const serviceResult = await authService.verifyUser(req);

    if (!serviceResult.success) throw serviceResult;

    return res.redirect(serviceResult.link);
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

router.post(
  "/resend-verification",
  authorizedLoggedInUser,
  async (req, res) => {
    try {
      const serviceResult = await authService.resendVerificationEmail(req);

      if (!serviceResult.success) throw serviceResult;

      return res.status(serviceResult.statusCode || 201).json({
        message: serviceResult.message,
      });
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        message: err.message,
      });
    }
  }
);

router.post("/forgot-password", async (req, res) => {
  try {
    const serviceResult = await authService.sendForgotPasswordEmail(req);

    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 201).json({
      message: serviceResult.message,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});

router.patch("/change-password", async (req, res) => {
  try {
    const serviceResult = await authService.ChangePassword(req);

    if (!serviceResult.success) throw serviceResult;

    return res.status(serviceResult.statusCode || 200).json({
      message: serviceResult.message,
    });
  } catch (err) {
    return res.status(err.statusCode || 500).json({
      message: err.message,
    });
  }
});
module.exports = router;
