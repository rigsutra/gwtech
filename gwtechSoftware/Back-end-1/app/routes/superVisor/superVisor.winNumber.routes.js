const { authJwt } = require("../../middlewares");
const controller = require("../../controllers/superVisor/superVisor.winNumber.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });

  // Read all
  app.post(
    "/api/superVisor/getwiningnumber",
    [authJwt.verifyToken],
    controller.readWinningNumber
  );
};
