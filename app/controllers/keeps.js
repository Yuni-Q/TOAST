const express = require('express');
const sequelize = require('sequelize');
const db = require('../models');
const {
  isLoggedIn,
} = require('../helpers/checkLogin');
const {
  resultFormat,
} = require('../helpers/formHelper');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
  const query = `
    select
      * 
    from keeps 
      join toasts on keeps.toastId = toasts.id
      where keeps.userId = ${req.user.id};
    `;
  const result = await db.sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });
  res.json(resultFormat(true, null, result));
});


router.post('/', isLoggedIn, async (req, res) => {
  const {
    id: userId,
  } = req.user;
  const {
    toastId,
  } = req.body;
  const like = await db.keeps.findOne({
    where: {
      userId,
      toastId,
    },
  });
  const result = like ? await db.keeps.destroy({
    where: {
      userId,
      toastId,
    },
  }) : await db.keeps.create({
    userId,
    toastId,
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
