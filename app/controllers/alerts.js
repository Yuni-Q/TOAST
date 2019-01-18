const express = require('express');
const sequelize = require('sequelize');

const router = express.Router();
const {
  isLoggedIn,
} = require('../helpers/checkLogin');

const db = require('../models');
const {
  resultFormat,
} = require('../helpers/formHelper');


router.get('/', isLoggedIn, async (req, res) => {
  const read = await db.parts.findAll({});
  res.json(resultFormat(true, null, read));
});


router.post('/', async (req, res) => {
  const {
    title,
    content,
    tostId,
  } = req.body;
  const result = await db.parts.create({
    title,
    content,
    tostId,
    userId: req.user.id,
  });
  res.json(resultFormat(true, null, result));
});

router.put('/:id', isLoggedIn, async (req, res) => {
  const {
    title,
    content,
    tostId,
  } = req.body;
  const result = await db.parts.update(
    {
      title,
      content,
      tostId,
      userId: req.user.id,
    },
    {
      where: {
        id: req.params.id,
      },
    },
  );
  res.json(resultFormat(true, null, result));
});

// 게시글 id에 해당하는 글 지우기 -> deleteparts에 넣기
router.delete('/:id', isLoggedIn, async (req, res) => {
  const {
    id,
  } = req.params;
  // await db.deleteparts.create({
  // });
  const result = await db.parts.destroy({
    where: {
      id,
    },
  });
  res.json(resultFormat(true, null, result));
});

router.get('/:id', isLoggedIn, async (req, res) => {
  const query = `
    select
      * 
    from parts 
      join parts on parts.id = tosts.partId
      where parts.id = ${req.params.id};
    `;
  const result = await db.sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });
  res.json(resultFormat(true, null, result));
});


module.exports = router;
