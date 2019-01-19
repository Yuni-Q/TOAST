const { paths } = require('./path/base');
const alerts = require('./path/alerts');
const users = require('./path/users');
const signIn = require('./path/signIn');
const books = require('./path/books');
const likes = require('./path/likes');
const keeps = require('./path/keeps');
const parts = require('./path/parts');
const toasts = require('./path/toasts');
const questions = require('./path/questions');
const main = require('./path/main');

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

Object.keys(alerts).forEach((key) => {
  paths[key] = alerts[key];
});

Object.keys(keeps).forEach((key) => {
  paths[key] = keeps[key];
});

Object.keys(parts).forEach((key) => {
  paths[key] = parts[key];
});

Object.keys(toasts).forEach((key) => {
  paths[key] = toasts[key];
});

Object.keys(questions).forEach((key) => {
  paths[key] = questions[key];
});

Object.keys(main).forEach((key) => {
  paths[key] = main[key];
});

module.exports = {
  swagger: '2.0',
  info: {
    title: 'TOAST-Backend',
    version: '1.0.0',
    description: 'Make Node.js',
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
