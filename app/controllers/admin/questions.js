const express = require('express');
const sequelize = require('sequelize');

const dayjs = require('dayjs');
const _ = require('lodash');
const Aigle = require('aigle');
Aigle.mixin(_);

const router = express.Router();
const AWS = require('aws-sdk');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const {
  isLoggedIn,
} = require('../../helpers/checkLogin');

const db = require('../../models');
const {
  resultFormat,
} = require('../../helpers/formHelper');

router.get('/', isLoggedIn, async (req, res) => {
  const read = await db.questions.findAll({});
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
    if (!files.image) {
      const partId = parseInt(fields.partId, 10);
      const read = await db.questions.create({
        title: fields.title,
        content: fields.content,
        partId,
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
    const partId = parseInt(fields.partId, 10);
    const read = await db.questions.create({
      title: fields.title,
      content: fields.content,
      imgUrl,
      partId,
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
      const read = await db.questions.update({
        title: fields.title,
        content: fields.content,
      }, {
        where: {
          id: req.params.id,
        },
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
    const read = await db.questions.update({
      title: fields.title,
      content: fields.content,
      imgUrl,
    }, {
      where: {
        id: req.params.id,
      },
    });
    res.json(resultFormat(true, null, read));
    // unlink tmp files
    fs.unlinkSync(image.path);
  });
});

// 게시글 id에 해당하는 글 지우기 -> deletequestions에 넣기
router.delete('/:id', isLoggedIn, async (req, res) => {
  const {
    id,
  } = req.params;
  const result = await db.questions.destroy({
    where: {
      id,
    },
  });
  res.json(resultFormat(true, null, result));
});

router.get('/:id', isLoggedIn, async (req, res) => {
  const share = await db.toasts.findOne({
    where: {
      questionId: req.params.id,
      share: 1,
      userId: req.user.id,
    },
  });
  // if (parseInt(req.params.id, 10) === 0) {
  //   const query = `
  //     select
  //       * 
  //     from questions 
  //       join toasts on questions.id = toasts.questionId
  //       left join (select count(*) as keepsCount, toastId from keeps JOIN toasts on toasts.id = keeps.toastId ) as keeps on keeps.toastId = toasts.id
  //       left join (select count(*) as alertCount, toastId from alerts JOIN toasts on toasts.id = alerts.toastId ) as alerts on alerts.toastId = toasts.id
  //       where questions.id = ${req.params.id};
  //     `;
  //   const result = await db.sequelize.query(query, {
  //     type: sequelize.QueryTypes.SELECT,
  //   });
  //   res.json(resultFormat(true, null, result));
  // }

  if (share) {
    const query = `
      select
        *
      from questions 
        join toasts on questions.id = toasts.questionId
        left join (select count(*) as keepsCount, toastId from keeps JOIN toasts on toasts.id = keeps.toastId ) as keeps on keeps.toastId = toasts.id
        left join (select count(*) as alertCount, toastId from alerts JOIN toasts on toasts.id = alerts.toastId ) as alerts on alerts.toastId = toasts.id
        where questions.id = ${req.params.id}
        and toasts.share = 1;
      `;
    const result = await db.sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });


    res.json(resultFormat(true, null, result));
    return;
  } else {
    const query = `
      select
        * 
      from questions 
        join toasts on questions.id = toasts.questionId
        left join (select count(*) as keepsCount, toastId from keeps JOIN toasts on toasts.id = keeps.toastId ) as keeps on keeps.toastId = toasts.id
        left join (select count(*) as alertCount, toastId from alerts JOIN toasts on toasts.id = alerts.toastId ) as alerts on alerts.toastId = toasts.id
        where questions.id = ${req.params.id}
        and toasts.userId = ${req.user.id}
    `;
    const result = await db.sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });
    
    res.json(resultFormat(true, null, result));
    return;
  }
  res.json(resultFormat(false, 'return 되지 못했습니다.', result));
});


module.exports = router;
