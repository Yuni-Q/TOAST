const express = require('express');
const nodemailer = require('nodemailer');
const uuidv1 = require('uuid/v1');
const request = require('sync-request');

const {
  resultFormat,
} = require('../helpers/formHelper');
const {
  isLoggedIn,
  isNotLoggedIn,
} = require('../helpers/checkLogin');
const usersServices = require('../services/usersServices');
const {
  users,
} = require('../models');

const router = express.Router();

router.put('/sns', isNotLoggedIn, async (req, res) => {
  let response = {
    nickName: null,
    email: null,
    gender: null,
    year: null,
  };
  try {
    if (req.body.sns === 'kakao') {
      const kakaoResponse = await request('GET', 'https://kapi.kakao.com/v2/user/me', {
          headers: {
            Authorization: `Bearer ${req.body.accessToken}`,
          },
      });
      const bufferOriginal = kakaoResponse.body.toString('utf8')
      const json = JSON.parse(bufferOriginal);
      response.nickName = json.properties.nickname;
      response.email = json.kakao_account.email;
      response.gender = json.kakao_account.gender;
      await users.create({
        email: response.email,
        nickName: response.nickName,
        gender: response.gender,
        deviceToken: req.body.accessToken,
        type: req.body.sns,
      });
      res.json(resultFormat(true, null, response));
      return;
    } else {
      const facebookResponse = await request('GET', `https://graph.facebook.com/me?access_token=${req.body.accessToken}&fields=id,name,gender,birthday,email`);
      const bufferOriginal = facebookResponse.body.toString('utf8')
      const json = JSON.parse(bufferOriginal);
      response.nickName = json.name;
      response.email = json.email;
      response.year = (json.birthday).split('/')[2];
      response.gender = json.gender;
      await users.create({
        email: response.email,
        nickName: response.nickName,
        age: response.year,
        gender: response.gender,
        deviceToken: req.body.accessToken,
        type: req.body.sns,
      });
      res.json(resultFormat(true, null, response));
      return;
    }
  } catch (error) {
    res.json(resultFormat(false, error.message));
    return;
  }
  res.json(resultFormat(false, 'kakao나 facebook이 아닙니다.'));
});

router.post("/email", async (req, res, next) => {
  const email = req.body.email;
  const token = uuidv1();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: global.config.email.id, // gmail 계정 아이디를 입력 
      pass: global.config.email.pwd // gmail 계정의 비밀번호를 입력
    }
  });
  const mailOptions = {
    from: global.config.email.id, // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디) 
    // to: email , // 수신 메일 주소 
    to: email,
    subject: '안녕하세요, TOAST입니다. 이메일 인증을 해주세요.',
    html: `<p>아래의 링크를 클릭해주세요 !</p>
           <a href='http://13.113.246.46:8080/users/auth?email=${email}&token=${token}'>인증하기</a>`
  };
  await users.update({
    authToken: token,
  }, {
    where: {
      email,
    },
  });
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return res.json(resultFormat(false, error));
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.json(resultFormat(true, null));
})

router.get("/auth", async (req, res, next) => {
  const { email } = req.query;
  const user = await users.findOne({
    where: {
      email,
    }
  });
  if (user && user.authToken === req.query.token) {
    await users.update({
      auth: 1,
    }, {
      where: {
        email,
      },
    });
    return res.send('인증 성공');
  }
  res.send('인증 실패');
})

router.get('/', isLoggedIn, async (req, res) => {
  try {
    const user = await users.findAll({});
    console.log(user);
    res.json(resultFormat(true, null, user));
  } catch (error) {
    res.json(resultFormat(false, error.message));
  }
});

router.post('/', isNotLoggedIn, async (req, res) => {
  try {
    const exUsers = await usersServices.usersFindOneEmail(req.body);
    if (exUsers) {
      res.json(resultFormat(400, '이미 가입 된 유저 name 입니다.'));
      return;
    }
    await usersServices.createUser(req.body);
    res.json(resultFormat(true, null));
  } catch (error) {
    res.json(resultFormat(false, error.message));
  }
});

router.put('/', isLoggedIn, async (req, res) => {
  try {
    await usersServices.updateUser(req.user, req.body);
  } catch (error) {
    res.json(resultFormat(false, error.message));
    return;
  }
  res.json(resultFormat(true, null));
});

router.delete('/', isLoggedIn, async (req, res) => {
  try {
    await usersServices.deleteUser(req.user);
  } catch (error) {
    res.json(resultFormat(false, error.message));
    return;
  }
  res.json(resultFormat(true, null));
});

router.get('/:id', isLoggedIn, async (req, res) => {
  try {
    const user = await users.findOne({
      where: {
        id: req.params.id
      }
    });
    res.json(resultFormat(true, null, user));
  } catch (error) {
    res.json(resultFormat(false, error.message));
  }
});

module.exports = router;
