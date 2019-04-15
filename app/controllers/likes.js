const admin = require('firebase-admin');
const express = require('express');

const db = require('../models');
const { isLoggedIn } = require('../helpers/checkLogin');
const { resultFormat } = require('../helpers/formHelper');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res) => {
  const read = await db.likes.findAll({});
  res.json(resultFormat(true, null, read));
});


router.post('/', isLoggedIn, async (req, res) => {
  const { id: userId } = req.user;
  const { toastId } = req.body;
  const like = await db.likes.findOne({
    where: {
      userId,
      toastId,
    },
  });
  let result;
  if(like) {
    result = await db.likes.destroy({
      where: {
        userId,
        toastId,
      },
    })
  } else {
    const query = `
      select * from toasts
      join users
        on users.id = toasts.userId
      where toasts.id =${toastId};
    `;
    const toast = await db.sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    await db.likes.create({
      userId,
      toastId,
    });
    // const user = await db.users.findOne({
    //   where: {
    //     id: userId,
    //   },
    // });
    // if(user.subNoti) {
    //   // This registration token comes from the client FCM SDKs.
    //   var message = {
    //     notification: {
    //       title: '$GOOG up 1.43% on the day',
    //       body: '$GOOG gained 11.80 points to close at 835.67, up 1.43% on the day.'
    //     },
    //     token: toast.deviceToken,
    //   };

    //   // Send a message to the device corresponding to the provided
    //   // registration token.
    //   admin.messaging().send(message)
    //     .then((response) => {
    //       // Response is a message ID string.
    //       console.log('Successfully sent message:', response);
    //     })
    //     .catch((error) => {
    //       console.log('Error sending message:', error);
    //       res.json(resultFormat(false, '메세지가 올바로 전송 되지 않았습니다', {
    //         token: toast.deviceToken,
    //         toastId,
    //         userId,
    //       }));
    //       return;
    //     });
    // }
  }
  res.json(resultFormat(true, null, result));
});


router.delete('/:id', isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    await db.likes.destroy({
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
