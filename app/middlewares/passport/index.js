
const local = require('./localStrategy');
const { Users } = require('../../models');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    // 첫번째인자 error
    done(null, user.id);
  });

  // 매 요청 시 실행
  passport.deserializeUser(async (id, done) => {
    const user = await Users.findOne({ where: { id } });
    done(null, user.dataValues);
  });

  local(passport);
};
