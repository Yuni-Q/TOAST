const express = require('express');
const sequelize = require('sequelize');
const dayjs = require('dayjs');
const _ = require('lodash');
const Aigle = require('aigle');
Aigle.mixin(_);

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

router.get('/books/:id', isLoggedIn, async (req, res) => {
  const query1 = `
  SELECT 
    B.title as bookTitle,
    P.title as partTitle,
    P.id as partId,
    Q.title as questionTitle,
    Q.id as questionId,
    Q.content as time,
    T.title as title,
    T.content as content,
    T.share as share,
    T.userId as userId,
    B.imgUrl as imgUrl,
    T.fileUrl as fileUrl,
    T.updatedAt as updatedAt
  FROM books AS B
  INNER JOIN parts AS P
    ON B.id = P.bookId
  INNER JOIN questions AS Q
    ON P.id = Q.partId
  INNER JOIN toasts AS T
    ON Q.id = T.questionId
      AND T.userId = ${req.user.id}
  WHERE B.id = ${req.params.id}
  
    
  UNION ALL

  SELECT 
    B.title as bookTitle,
    P.title as partTitle,
    P.id as partId,
    Q.title as questionTitle,
    Q.id as questionId,
    Q.content as time,
    ORI.title as title,
    ORI.content as content,
    ORI.share as share,
    ORI.userId as userId,
    B.imgUrl as imgUrl,
    ORI.fileUrl as fileUrl,
    ORI.updatedAt as updatedAt
  FROM books AS B
    INNER JOIN parts AS P
      ON B.id = P.bookId
    INNER JOIN questions AS Q
      ON P.id = Q.partId
    INNER JOIN toasts AS ORI
      ON Q.id = ORI.questionId
  WHERE ORI.share = 1
    AND B.id = ${req.params.id}
    AND ORI.userId != ${req.user.id}
    AND ORI.questionId IN (SELECT DISTINCT T.questionId
      FROM books AS B
      INNER JOIN parts AS P
        ON B.id = P.bookId
      INNER JOIN questions AS Q
        ON P.id = Q.partId
      INNER JOIN toasts AS T
        ON Q.id = T.questionId
            AND T.userId = ${req.user.id}
            AND T.share = 1);
  `;
  const toasts = await db.sequelize.query(query1, {
    type: sequelize.QueryTypes.SELECT,
  });

  const sortToasts = toasts.sort(function(a, b){return b.updatedAt-a.updatedAt})
  
  let result = _.groupBy(sortToasts, function (item) {
    return item.partTitle;
  });

  _.forEach(result, function (value, key) {
    result[key] = _.groupBy(result[key], function (item) {
      return item.questionTitle;
    });
  });

  _.forEach(result, function (value, key) {
    _.forEach(result[key], function (value, k) {
      result[key][k] = _.groupBy(result[key][k], function (i) {
      if (i.userId === req.user.id) return "me";
      else return "other";
    })
  })
})
  res.json(resultFormat(true, null, result));
});

module.exports = router;
