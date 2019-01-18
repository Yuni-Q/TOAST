const express = require('express');

const router = express.Router();
const {
  isLoggedIn,
} = require('../helpers/checkLogin');

const db = require('../models');
const {
  resultFormat,
} = require('../helpers/formHelper');


router.get('/', isLoggedIn, async (req, res) => {
  const read = await db.alerts.findAll({});
  res.json(resultFormat(true, null, read));
});


router.post('/', isLoggedIn, async (req, res) => {
  const {
    title,
    content,
    toastId,
  } = req.body;
  const result = await db.alerts.create({
    title,
    content,
    toastId,
    userId: req.user.id,
  });
  res.json(resultFormat(true, null, result));
});

router.put('/:id', isLoggedIn, async (req, res) => {
  const {
    title,
    content,
    toastId,
  } = req.body;
  const result = await db.alerts.update(
    {
      title,
      content,
      toastId,
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

// 게시글 id에 해당하는 글 지우기 -> deletealerts에 넣기
router.delete('/:id', isLoggedIn, async (req, res) => {
  const {
    id,
  } = req.params;
  // await db.deletealerts.create({
  // });
  const result = await db.alerts.destroy({
    where: {
      id,
    },
  });
  res.json(resultFormat(true, null, result));
});

router.get('/:id', isLoggedIn, async (req, res) => {
  const result = await db.alerts.findOne({
    where: {
      id: req.params.id,
    },
  });
  res.json(resultFormat(true, null, result));
});


module.exports = router;
