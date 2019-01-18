const express = require('express');
const jwt = require('jsonwebtoken');
const {
  users,
} = require('../models');
const {
  resultFormat,
} = require('../helpers/formHelper');

const {
  isLoggedIn,
  isNotLoggedIn,
} = require('../helpers/checkLogin');

const router = express.Router();

router.post('/', isNotLoggedIn, async (req, res) => {
  const {
    email,
    password,
  } = req.body;
  const secret = req.app.get('jwt-secret');

  const user = await users.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    res.json(resultFormat(false, '이메일이 존재하지 않습니다.'));
    return;
  }

  if (user.password === password) {
    const t = new Promise((resolve, reject) => {
      jwt.sign(
        {
          id: user.id,
          nickName: user.nickName,
          email: user.email,
        },
        secret, {
          expiresIn: '7d',
          issuer: 'ONEPIC',
          subject: 'userInfo',
        }, (err, tt) => {
          if (err) reject(err);
          resolve(tt);
        },
      );
    });
    let result;
    await t.then(async (token) => {
      result = {
        token,
      };
      console.log(result.token);
      await users.update({
        token,
        email,
      }, {
        where: {
          email,
        },
      });
      res.json(resultFormat(true, null, result));
    });
    return;
  }
  res.json(resultFormat(false, '이미 존재하는 이메일 입니다'));
});

router.delete('/', isLoggedIn, async (req, res) => {
  try {
    console.log('user', req.user);
    await users.update({
      token: null,
    }, {
      where: {
        id: req.user.id,
      },
    });
  } catch (error) {
    res.json(resultFormat(false, '에러가 발생했습니다.', error));
    return;
  }
  res.json(resultFormat(true, null));
});

router.post('/snsLogin', isLoggedIn, async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = users.findOne({ where: { email, token } });
    if (!user) {
      users.create({ email, token });
    }
  } catch (err) {
    res.json(resultFormat(false, '에러가 발생했습니다', err));
  }
  res.json(resultFormat(true, null));
});

module.exports = router;
