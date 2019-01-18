const jwt = require('jsonwebtoken');
// const {
//   users,
// } = require('../models');
const {
  resultFormat,
} = require('../helpers/formHelper');

exports.isLoggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    console.log('token', token);
    if (!token) {
      res.json(resultFormat(false, '토큰이 없습니다.', token));
      return;
    }
    const user = new Promise(
      (resolve, reject) => {
        jwt.verify(token, req.app.get('jwt-secret'), (err, decoded) => {
          if (err) reject(err);
          resolve(decoded);
        });
      },
    );
    // const user = await users.findOne({ where: { token } });
    await user.then(
      (u) => {
        req.user = u;
      },
    );
    next();
  } catch (error) {
    res.json(resultFormat(false, '에러 발생.', error));
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  try {
    const token = req.headers.Authorization;
    if (token) {
      res.json(resultFormat(false, '토큰이 있는데요?', token));
      return;
    }
    next();
  } catch (error) {
    res.json(resultFormat(false, '에러 발생.', error));
  }
};
