const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', (req, res) => {
  res.render('homepage')
})

router.post('/handleQuery', (req, res) => {
  let prep = req.body.query.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/)[2]
  let link = 'http://www.youtube.com/embed/' + prep
  res.render('player', { query: link, prep: prep })
})

module.exports = router