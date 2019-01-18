const express = require('express');
const db = require('../models');
const {
  isLoggedIn,
} = require('../helpers/checkLogin');
const {
  resultFormat,
} = require('../helpers/formHelper');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
  const read = await db.keeps.findAll({
    where: {
      id: req.user.id,
    },
  });
  res.json(resultFormat(true, null, read));
});


router.post('/', isLoggedIn, async (req, res) => {
  const {
    id: userId,
  } = req.user;
  const {
    tostId,
  } = req.body;
  const like = await db.keeps.findOne({
    where: {
      userId,
      tostId,
    },
  });
  const result = like ? await db.keeps.destroy({
    where: {
      userId,
      tostId,
    },
  }) : await db.keeps.create({
    userId,
    tostId,
  });
  res.json(resultFormat(true, null, result));
});


router.delete('/:id', isLoggedIn, async (req, res) => {
  try {
    const {
      id,
    } = req.params;
    await db.keeps.destroy({
      where: {
        id,
      },
    });
    res.json(resultFormat(true, null));
  } catch (error) {
    res.json(resultFormat(false, '에러발생', error));
  }
});

module.exports = router;
