const express = require('express');

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
    const exUsers = await usersServices.usersFindOneUserName(req.body);
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
    const user = await users.findOne({ where: { id: req.params.id } });
    res.json(resultFormat(true, null, user));
  } catch (error) {
    res.json(resultFormat(false, error.message));
  }
});

router.put('/sns', isLoggedIn, async (req, res) => {
  try {
    // response.statusCode
    // response.headers
    // response.body
    if (req.body.sns === 'kakao') {
      let response = await request('https://kapi.kakao.com/v2/user/me', {
          // This example demonstrates all of the supported options.
          // Request method (uppercase): POST, DELETE, ...
          method: 'GET',
          // data: {
          //   properties: {"nickname":"홍길동","age":"22"},
          // },
          headers: {
            Authorization: `Bearer ${req.body.access_token}`,
            "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
          },
          // proxy: 'http://127.0.0.1:8000',
          // To create a new cookie jar.
          // cookieJar: true,
          // To use a custom/existing cookie jar.
          // https://www.npmjs.com/package/tough-cookie
          // cookieJar: new tough.CookieJar()
      });
//       키	설명	필수
// property_keys	사용자 정보의 키 리스트. JSON Array 형태.	X
// secure_resource	이미지 url을 https로 반환할지 여부. true/false	X
// property_keys로 요청할 수 있는 키 리스트입니다.

// 설정 > 사용자 관리 > 사용자 목록 및 프로퍼티 관리 에서 추가로 등록한 프로퍼티도 사용할 수 있습니다.

// Name	Description
// properties.nickname	카카오톡 또는 카카오스토리의 닉네임 정보
// properties.profile_image	640px * 640px 크기의 프로필 이미지 URL (2017/08/22 이전 가입자에 대해서는 480px * 480px ~ 1024px * 1024px 크기를 가질 수 있음)
// properties.thumbnail_image	110px * 110px 크기의 썸네일 프로필 이미지 URL (2017/08/22 이전 가입자에 대해서는 160px * 213px 크기를 가질 수 있음)
// kakao_account.email	사용자 카카오계정의 이메일 소유여부, 이메일 값, 이메일 인증여부, 이메일 유효여부
// kakao_account.age_range	사용자 카카오계정의 연령대 소유여부, 연령대 값
// kakao_account.birthday	사용자 카카오계정의 생일 소유여부, 생일 값
// kakao_account.gender	사용자 카카오계정의 성별 소유여부, 성별 값

// curl -v -X POST https://kapi.kakao.com/v2/user/me \
//   -H "Authorization: KakaoAK kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk" \
//   -d 'target_id_type=user_id&target_id=12345' \
  // -d 'property_keys=["kakao_account.email"]'

  // https://developers.kakao.com/docs/restapi/user-management#%EC%82%AC%EC%9A%A9%EC%9E%90-%EC%A0%95%EB%B3%B4-%EC%9A%94%EC%B2%AD
      console.log('kakao', response);
    } else {
        let response = await request(`https://graph.facebook.com/me?access_token=${req.body.access_token}`, {
        // This example demonstrates all of the supported options.
        // Request method (uppercase): POST, DELETE, ...
        method: 'GET',
        // data: {
        //   properties: {"nickname":"홍길동","age":"22"},
        // },
        // headers: {
        //   Authorization: `Bearer ${access_token}`,
        //   "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        // },
        // proxy: 'http://127.0.0.1:8000',
        // To create a new cookie jar.
        // cookieJar: true,
        // To use a custom/existing cookie jar.
        // https://www.npmjs.com/package/tough-cookie
        // cookieJar: new tough.CookieJar()
    });
    
      
    console.log('facebook', response);
      // return getJsonPojo(httpEntity, ResFacebookLoginPojo.class);
    
    }
  } catch (error) {
    res.json(resultFormat(false, error.message));
    return;
  }
  res.json(resultFormat(true, null));
});

module.exports = router;
