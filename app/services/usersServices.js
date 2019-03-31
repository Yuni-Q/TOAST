const {
  users,
  deleteUsers,
} = require('../models');
const cryptoHelper = require('../helpers/cryptoHelper')

module.exports = {

  usersFindOneEmail: ({
    email,
  }) => users.findOne({
    where: {
      email,
    },
  }),
  createUser: async (
    {
      email,
      password: pwd,
      nickName,
      age,
      gender,
      deviceToken,
      type,
    },
  ) => {
    const password = await cryptoHelper.makePssword(pwd);
    await users.create({
      email,
      password,
      nickName,
      age,
      gender,
      deviceToken,
      type,
    });
  },

  updateUser: async (
    {
      id,
    }, {
      email,
      password: pwd,
      nickName,
      age,
      gender,
      deviceToken,
      type,
    },
  ) => {
    const password = await cryptoHelper.makePssword(pwd);
    await users.update({
      email,
      password,
      nickName,
      age,
      gender,
      deviceToken,
      type,
    }, {
      where: {
        id,
      },
    });
  },

  deleteUser: async ({
    id,
  }) => {
    const user = await users.findOne({
      where: {
        id,
      },
    });
    await deleteUsers.create({
      id: user.id,
      nickName: user.nickName,
      email: user.email,
      password: user.password,
    });
    await users.destroy({
      where: {
        id,
      },
    });
  },
};
