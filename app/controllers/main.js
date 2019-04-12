const express = require('express');
const sequelize = require('sequelize');
const dayjs = require('dayjs');

const {
  isLoggedIn,
} = require('../helpers/checkLogin');

const router = express.Router();

const db = require('../models');
const {
  resultFormat,
} = require('../helpers/formHelper');


router.get('/', isLoggedIn, async (req, res) => {
  const result = {};

  const query = `
    select
      books.title as bookTitle,
      parts.title as partTitle,
      questions.title as questionTitle,
      questions.content as time,
      imgUrl,
      fileUrl
    from toasts 
      join questions on questions.id = toasts.questionId
      join parts on parts.id = questions.partId
      join books on books.id = parts.bookId
    where toasts.userId = ${req.user.id}
    order by toasts.createdAt DESC
    limit 5
  `;
  result.toasts = await db.sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });

  const time = dayjs().set('hour', 0).set('minute', 0).set('second', 0)
    .add(-9, 'hour')
    .format('YYYY-MM-DD HH:mm:ss');
  const query2 = `
    select
      * 
    from toasts 
    where createdAt >= '${time}'
  `;
  result.count = (await db.sequelize.query(query2, {
    type: sequelize.QueryTypes.SELECT,
  })).length;
  console.log(resultFormat(true, null, result));
  res.json(resultFormat(true, null, result));
});

module.exports = router;
