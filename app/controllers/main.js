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
    select
      books.title as bookTitle,
      parts.title as partTitle,
      parts.id as partId,
      questions.title as questionTitle,
      questions.id as questionId,
      questions.content as time,
      toasts.title as title,
      toasts.content as content,
      toasts.share as share,
      toasts.userId as userId,
      imgUrl,
      fileUrl
    from toasts 
      join questions on questions.id = toasts.questionId
      join parts on parts.id = questions.partId
      join books on books.id = parts.bookId
    where toasts.userId = ${req.user.id}
      and books.id = ${req.params.id}
    order by toasts.updatedAt DESC
  `;
  const toasts = await db.sequelize.query(query1, {
    type: sequelize.QueryTypes.SELECT,
  });
  let list = _.groupBy(toasts, function (item) {
    return item.partTitle;
  });

  _.forEach(list, function (value, key) {
    list[key] = _.groupBy(list[key], function (item) {
      return item.questionTitle;
    });
  });

  const jsonString = JSON.stringify(list);

  const result = JSON.parse(jsonString)

  await Aigle.forEach(Object.keys(result), async (key) => {
  //  Object.keys(result).forEach((key) => {
    await Aigle.forEach(Object.keys(result[key]), async (k) => {
    //  Object.keys(result[key]).forEach(async (k) => {
      const me = result[key][k];
        result[key][k] = {}
        result[key][k].me = me;
      const index =  result[key][k].me.findIndex(i => i.share == true);
      if (index >= 0) {
        const query2 = `
            select
              books.title as bookTitle,
              parts.title as partTitle,
              parts.id as partId,
              questions.title as questionTitle,
              questions.id as questionId,
              questions.content as time,
              toasts.title as title,
              toasts.content as content,
              toasts.share as share,
              toasts.userId as userId,
              imgUrl,
              fileUrl
            from toasts 
              join questions on questions.id = toasts.questionId
              join parts on parts.id = questions.partId
              join books on books.id = parts.bookId
            where toasts.userId != ${req.user.id}
              and questions.id = ${result[key][k].me[0].questionId}
              and share = 1
            order by toasts.updatedAt DESC
      `;
        const otherToasts = await db.sequelize.query(query2, {
          type: sequelize.QueryTypes.SELECT,
        });
        result[key][k].other = otherToasts;
      }
    })
  })

  // result[parts[i].title][j][questions[j].title].me = toasts;
  res.json(resultFormat(true, null, result));
});

// router.get('/books/:id', isLoggedIn, async (req, res) => {
//   const result = {};

//   const parts = await db.parts.findAll({ where: { bookId: req.params.id } });

//   for (let i = 0; i < parts.length; i++) {
//     result[parts[i].title] = [];
//     const questions = await db.questions.findAll({ where: { partId: parts[i].id } });
//     for (let j = 0; j < questions.length; j++) {
//       result[parts[i].title][j] = { [questions[j].title]: { me: [], other: []}};
//       const query1 = `
//         select
//           * 
//         from toasts 
//         where questionId = ${questions[j].id}
//           and userId = ${req.user.id}
//         ORDER BY
//           updatedAt
//       `;
//       const toasts = (await db.sequelize.query(query1, {
//           type: sequelize.QueryTypes.SELECT,
//         }))
//       result[parts[i].title][j][questions[j].title].me = toasts;
//       if (toasts.length > 0) {
//         const query2 = `
//           select
//             * 
//           from toasts 
//           where questionId = ${questions[j].id}
//             userId != ${req.user.id}
//           ORDER BY
//             updatedAt
//         `;
//         const otherToast = (await db.sequelize.query(query2, {
//           type: sequelize.QueryTypes.SELECT,
//         }))
//         result[parts[i].title][j][questions[j].title].other = otherToast;
//       }
//     }
//   }
//   res.json(resultFormat(true, null, result));
// });


module.exports = router;
