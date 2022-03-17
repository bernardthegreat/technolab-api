const { Router } = require("express");
const authController = require("../controllers/authController");

const router = Router();

// router.get('/test', authController.test)
// router.post('/login', authController.login);
// router.post('/authenticate', authController.authenticate);
// router.post('/validate-token', authController.validateToken)

router.post("/authenticate", authController.authenticate);
router.post("/logout", authController.logout);

router.get("*", (req, res) => {
  res.status(404).send({ error: "API not found" });
});

module.exports = router;
