const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();

router.get("/video/:videoId", (req, res) => {
  let prep = req.params.videoId;
  return res.render("player", { prep: prep });
});

router.post("/handleQuery", (req, res) => {
  let query = req.body.query.match(
    /^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/
  );

  let prep = query ? query[2] : "N2kyzdw_RWs";

  return res.redirect("/video/" + prep);
});

router.get("/:path*?", (req, res) => {
  return req.params.path == "offline.html"
    ? res.render("offline")
    : res.render("homepage");
});

module.exports = router;
