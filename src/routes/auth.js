const authControllers = require("../controllers/auth");
const fileUploader = require("../lib/uploader");

const router = require("express").Router();
router.post("/login", authControllers.loginUser);
router.post("/register", authControllers.registerUser);

module.exports = router;
