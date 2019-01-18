
const LocalStrategy = require('passport-local').Strategy;
const { Users } = require('../../models');
const crypto = require('../../helpers/cryptoHelper');

module.exports = async (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password',
  }, async (userName, password, done) => {
    try {
      const exUser = await Users.findOne({ where: { userName } });
      if (exUser) {
        if (exUser.dataValues.isDelete === true) {
          done(null, false, { message: '탈퇴한 회원입니다.' });
          return;
        }
        console.log('password', password);
        const pwd = await crypto.makePssword(password);
        console.log('pwd', pwd);
        const result = await (pwd === (exUser.password));
        if (result) {
          done(null, exUser);
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      done(error);
    }
  }));
};
