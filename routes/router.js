const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();

router.get("/", (req, res) => {
  return res.render("homepage");
});

router.get("/:videoId", (req, res) => {
  let prep = req.params.videoId;
  return res.render("player", { prep: prep });
});

router.post("/handleQuery", (req, res) => {
  let prep = req.body.query.match(
    /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
  )
    ? req.body.query.match(
        /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
      )[2]
    : "N2kyzdw_RWs";
  return res.redirect("/" + prep);
});

module.exports = router;
