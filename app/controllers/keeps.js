const express = require('express');
const sequelize = require('sequelize');
const _ = require('lodash');

const db = require('../models');
const {
  isLoggedIn,
} = require('../helpers/checkLogin');
const {
  resultFormat,
} = require('../helpers/formHelper');

const router = express.Router();

router.get('/me', isLoggedIn, async (req, res) => {
  const result = {
    me: [],
    other: [],
  }
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
      keepsCount,
      alertCount,
      imgUrl,
      fileUrl,
      toasts.updatedAt as updatedAt
    from toasts 
      join questions on questions.id = toasts.questionId
      join parts on parts.id = questions.partId
      join books on books.id = parts.bookId
      left join (select count(*) as keepsCount, toastId from keeps JOIN toasts on toasts.id = keeps.toastId ) as K on K.toastId = toasts.id
      left join (select count(*) as alertCount, toastId from alerts JOIN toasts on toasts.id = alerts.toastId ) as A on A.toastId = toasts.id
    where toasts.userId = ${req.user.id}
      and share = 1
    order by toasts.updatedAt DESC
  `;
  const toasts = await db.sequelize.query(query1, {
    type: sequelize.QueryTypes.SELECT,
  });
  const sortToasts = toasts.sort(function (a, b) { return b.updatedAt - a.updatedAt });
  const list = {
    parts: [],
  }
  _.forEach(sortToasts, async (toast) => {
    toast.updatedAt = Date.parse(toast.updatedAt);
    _.forEach(list.parts, (dataP, index) => {
      if (dataP.partTitle === toast.partTitle) {
        _.forEach(dataP.questions, (dataQ, index2) => {
          if (dataQ.questionTitle === toast.questionTitle) {
            dataQ.toasts.push(toast)
          } else if (dataP.questions.length - 1 === index2) {
            dataP.questions.push({
              questionTitle: toast.questionTitle,
              toasts: [toast],
            });
          }
        })
      } else if (list.parts - 1 === index) {
        list.parts.push({
          partTitle: toast.partTitle,
          questions: [
            {
              questionTitle: toast.questionTitle,
              toasts: [toast],
            }
          ]
        })
      }
    })
    if (list.parts.length === 0) {
      list.parts.push({
        partTitle: toast.partTitle,
        questions: [
          {
            questionTitle: toast.questionTitle,
            toasts: [toast],
          }
        ]
      })
    }
  })
  result.me = list;

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
      keepsCount,
      alertCount,
      imgUrl,
      fileUrl,
      toasts.updatedAt as updatedAt
    from keeps
      join toasts on toasts.id = keeps.toastId
      join questions on questions.id = toasts.questionId
      join parts on parts.id = questions.partId
      join books on books.id = parts.bookId
      left join (select count(*) as keepsCount, toastId from keeps JOIN toasts on toasts.id = keeps.toastId ) as K on K.toastId = toasts.id
      left join (select count(*) as alertCount, toastId from alerts JOIN toasts on toasts.id = alerts.toastId ) as A on A.toastId = toasts.id
    where keeps.userId = ${req.user.id}
    order by toasts.updatedAt DESC
  `;
  const toasts2 = await db.sequelize.query(query2, {
    type: sequelize.QueryTypes.SELECT,
  });
  const sortToasts2 = toasts2.sort(function (a, b) { return b.updatedAt - a.updatedAt });
  const list2 = {
    parts: [],
  }
  _.forEach(sortToasts2, async (toast) => {
    toast.updatedAt = Date.parse(toast.updatedAt);
    _.forEach(list2.parts, (dataP, index) => {
      if (dataP.partTitle === toast.partTitle) {
        _.forEach(dataP.questions, (dataQ, index2) => {
          if (dataQ.questionTitle === toast.questionTitle) {
            dataQ.toasts.push(toast)
          } else if (dataP.questions.length - 1 === index2) {
            dataP.questions.push({
              questionTitle: toast.questionTitle,
              toasts: [toast],
            });
          }
        })
      } else if (list2.parts - 1 === index) {
        list2.parts.push({
          partTitle: toast.partTitle,
          questions: [
            {
              questionTitle: toast.questionTitle,
              toasts: [toast],
            }
          ]
        })
      }
    })
    if (list2.parts.length === 0) {
      list2.parts.push({
        partTitle: toast.partTitle,
        questions: [
          {
            questionTitle: toast.questionTitle,
            toasts: [toast],
          }
        ]
      })
    }
  })
  result.other = list2;

  res.json(resultFormat(true, null, result));
});


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

router.put('/', isLoggedIn, async (req, res) => {
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
