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
  // };
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
  res.json(resultFormat(true, null));
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
  res.json(resultFormat(true, null));
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
