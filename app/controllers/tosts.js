const express = require('express');
const sequelize = require('sequelize');

const router = express.Router();
const AWS = require('aws-sdk');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const {
  isLoggedIn,
} = require('../helpers/checkLogin');

const db = require('../models');
const {
  resultFormat,
} = require('../helpers/formHelper');


router.get('/', isLoggedIn, async (req, res) => {
  const read = await db.tosts.findAll({});
  res.json(resultFormat(true, null, read));
});


router.post('/', async (req, res) => {
  AWS.config.update({
    accessKeyId: global.config.AWSAccessKeyId,
    secretAccessKey: global.config.AWSSecretKey,
  });
  const s3 = new AWS.S3();
  const form = new formidable.IncomingForm();

  // make upload dirName
  // const dirName = '';
  let possible = '0123456789abcdef';
  // for (var i = 0; i < 4; i++) dirName += possible.charAt(Math.floor(Math.random() * possible.length));
  // dirName = dirName + '-' + new Date().toISOString().substr(0, 10);

  // make upload fileName
  let fileName = '';
  possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i += 1) fileName += possible.charAt(Math.floor(Math.random() * possible.length));

  // 서버에 업로드 완료 후
  form.parse(req, async (err, fields, files) => {
    if (!files.file) {
      const questionId = parseInt(fields.questionId, 10);
      const share = parseInt(fields.share, 10);
      const userId = parseInt(fields.userId, 10);
      const read = await db.tosts.create({
        title: fields.title,
        content: fields.content,
        questionId,
        share,
        userId,
      });
      res.json(resultFormat(true, null, read));
      return;
    }

    const {
      file,
    } = files;
    const defaultPath = fileName;
    const url = defaultPath + path.parse(file.name).ext;

    // file upload
    // console.log('file path : ' + defaultPath + path.parse(file.name).ext);
    s3.upload({
      Bucket: 'yunhee',
      Key: url,
      ACL: 'public-read',
      Body: fs.createReadStream(file.path),
    }, (error, result) => {
      if (error) console.log(error);
      else console.log(result);
    });
    const baseUrl = 'https://yunhee.s3.amazonaws.com/';
    const fileUrl = baseUrl + url;
    const questionId = parseInt(fields.questionId, 10);
    const share = parseInt(fields.share, 10);
    const result = await db.tosts.create({
      title: fields.title,
      content: fields.content,
      fileUrl,
      questionId,
      share,
    });
    res.json(resultFormat(true, null, result));
    // unlink tmp files
    fs.unlinkSync(file.path);
  });
});

router.get('/users', isLoggedIn, async (req, res) => {
  const query = `
      select
        * 
      from tosts 
        left join (select count(*) as keepsCount, tostId from keeps JOIN tosts on tosts.id = keeps.tostId ) as keeps on keeps.tostId = tosts.id
        left join (select count(*) as alertCount, tostId from alerts JOIN tosts on tosts.id = alerts.tostId ) as alerts on alerts.tostId = tosts.id
        where tosts.userId = ${req.user.id}
      `;
  const result = await db.sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });
  res.json(resultFormat(true, null, result));
});

router.put('/:id', isLoggedIn, async (req, res) => {
  AWS.config.update({
    accessKeyId: global.config.AWSAccessKeyId,
    secretAccessKey: global.config.AWSSecretKey,
  });
  const s3 = new AWS.S3();
  const form = new formidable.IncomingForm();

  // make upload dirName
  // const dirName = '';
  let possible = '0123456789abcdef';
  // for (var i = 0; i < 4; i++) dirName += possible.charAt(Math.floor(Math.random() * possible.length));
  // dirName = dirName + '-' + new Date().toISOString().substr(0, 10);

  // make upload fileName
  let fileName = '';
  possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 8; i += 1) fileName += possible.charAt(Math.floor(Math.random() * possible.length));

  // 서버에 업로드 완료 후
  form.parse(req, isLoggedIn, async (err, fields, files) => {
    if (!files.file) {
      const share = parseInt(fields.share, 10);
      const read = await db.tosts.update({
        title: fields.title,
        content: fields.content,
        share,
      }, {
        where: {
          id: req.params.id,
        },
      });
      res.json(resultFormat(true, null, read));
      return;
    }

    const {
      file,
    } = files;
    const defaultPath = fileName;
    const url = defaultPath + path.parse(file.name).ext;

    // file upload
    // console.log('file path : ' + defaultPath + path.parse(file.name).ext);
    s3.upload({
      Bucket: 'yunhee',
      Key: url,
      ACL: 'public-read',
      Body: fs.createReadStream(file.path),
    }, (error, result) => {
      if (error) console.log(error);
      else console.log(result);
    });
    const baseUrl = 'https://yunhee.s3.amazonaws.com/';
    const fileUrl = baseUrl + url;
    const share = parseInt(fields.share, 10);
    const read = await db.tosts.update({
      title: fields.title,
      content: fields.content,
      fileUrl,
      share,
    }, {
      where: {
        id: req.params.id,
      },
    });
    res.json(resultFormat(true, null, read));
    // unlink tmp files
    fs.unlinkSync(file.path);
  });
});

// 게시글 id에 해당하는 글 지우기 -> deletetosts에 넣기
router.delete('/:id', isLoggedIn, async (req, res) => {
  const {
    id,
  } = req.params;
  // await db.deletetosts.create({
  // });
  const result = await db.tosts.destroy({
    where: {
      id,
    },
  });
  res.json(resultFormat(true, null, result));
});

router.get('/:id', isLoggedIn, async (req, res) => {
  const result = await db.tosts.findOne({
    where: {
      id: req.params.id,
    },
  });
  res.json(resultFormat(true, null, result));
});

module.exports = router;
