const { paths } = require('./path/base');
const users = require('./path/users');
const signIn = require('./path/signIn');
const books = require('./path/books');
const likes = require('./path/likes');
// const { definitions } = require('./definitions/definitions');

Object.keys(users).forEach((key) => {
  paths[key] = users[key];
});

Object.keys(signIn).forEach((key) => {
  paths[key] = signIn[key];
});

Object.keys(books).forEach((key) => {
  paths[key] = books[key];
});

Object.keys(likes).forEach((key) => {
  paths[key] = likes[key];
});

module.exports = {
  swagger: '2.0',
  info: {
    title: "ONEPIC-Backend",
    version: "1.0.0",
    description: "Make Node.js",
  },
  license: {
    name: 'Apache 2.0',
    url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
  },
  schemes: [
    // 'https',
    'http',
  ],
  paths,
  securityDefinitions: {
    apiKey: {
      type: 'apiKey',
      name: 'api_token',
      in: 'query',
    },
  },
  // definitions,
};