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
  const read = await db.books.findAll({});
  res.json(resultFormat(true, null, read));
});


router.post('/', isLoggedIn, async (req, res) => {
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
    if (!files.image) {
      const read = await db.books.create({
        title: fields.title,
        content: fields.content,
      });
      res.json(resultFormat(true, null, read));
      return;
    }

    const {
      image,
    } = files;
    const defaultPath = fileName;
    const imageUrl = defaultPath + path.parse(image.name).ext;

    // image upload
    // console.log('image path : ' + defaultPath + path.parse(image.name).ext);
    s3.upload({
      Bucket: 'yunhee',
      Key: imageUrl,
      ACL: 'public-read',
      Body: fs.createReadStream(image.path),
    }, (error, result) => {
      if (error) console.log(error);
      else console.log(result);
    });
    const baseUrl = 'https://yunhee.s3.amazonaws.com/';
    const imgUrl = baseUrl + imageUrl;
    const read = await db.books.create({
      title: fields.title,
      content: fields.content,
      imgUrl,
    });
    res.json(resultFormat(true, null, read));
    // unlink tmp files
    fs.unlinkSync(image.path);
  });
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
  form.parse(req, async (err, fields, files) => {
    if (!files.image) {
      const read = await db.books.update({
        title: fields.title,
        content: fields.content,
      }, {
        where: {
          id: req.params.id,
        },
      });
      res.json(resultFormat(true, null));
      return;
    }

    const {
      image,
    } = files;
    const defaultPath = fileName;
    const imageUrl = defaultPath + path.parse(image.name).ext;

    // image upload
    // console.log('image path : ' + defaultPath + path.parse(image.name).ext);
    s3.upload({
      Bucket: 'yunhee',
      Key: imageUrl,
      ACL: 'public-read',
      Body: fs.createReadStream(image.path),
    }, (error, result) => {
      if (error) console.log(error);
      else console.log(result);
    });
    const baseUrl = 'https://yunhee.s3.amazonaws.com/';
    const imgUrl = baseUrl + imageUrl;
    const read = await db.books.update({
      title: fields.title,
      content: fields.content,
      imgUrl,
    }, {
      where: {
        id: req.params.id,
      },
    });
    res.json(resultFormat(true, null));
    // unlink tmp files
    fs.unlinkSync(image.path);
  });
});

// 게시글 id에 해당하는 글 지우기 -> deletebooks에 넣기
router.delete('/:id', isLoggedIn, async (req, res) => {
  const {
    id,
  } = req.params;
  // await db.deletebooks.create({
  // });
  await db.books.destroy({
    where: {
      id,
    },
  });
  res.json(resultFormat(true, null));
});

router.get('/:id', isLoggedIn, async (req, res) => {
  // const query = `
  // SELECT 
  //   B.title as bookTitle,
  //   P.title as partTitle,
  //   P.id as partId,
  //   Q.title as questionTitle,
  //   Q.id as questionId,
  //   Q.content as time,
  //   T.title as title,
  //   T.content as content,
  //   T.share as share,
  //   T.userId as userId,
  //   B.imgUrl as imgUrl,
  //   T.fileUrl as fileUrl,
  //   T.updatedAt as updatedAt
  // FROM books AS B
  // INNER JOIN parts AS P
  //   ON B.id = P.bookId
  // INNER JOIN questions AS Q
  //   ON P.id = Q.partId
  // left outer JOIN toasts AS T
  //   ON Q.id = T.questionId
  //     AND T.userId = ${req.user.id}
  // WHERE B.id = ${req.params.id}
  // GROUP BY Q.id;
  //   `;
  const query = `
    SELECT 
      P.title as partTitle,
      P.id as partId
    FROM books AS B
    INNER JOIN parts AS P
      ON B.id = P.bookId
    WHERE B.id = ${req.params.id}    
  `;
  const result = await db.sequelize.query(query, {
    type: sequelize.QueryTypes.SELECT,
  });
  res.json(resultFormat(true, null, result));
});


module.exports = router;
