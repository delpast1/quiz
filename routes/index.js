var express = require('express');
var router = express.Router();
var user = require('../app/user/index').user;
var authenticate = require('../app/middleware/index').authenticate;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/signin', user.login);
router.post('/signup', user.insertUser);
router.post('/update-information', [authenticate.requireSession, user.updateUserInfo]);
router.post('/change-password', [authenticate.requireSession, user.updatePassword]);

module.exports = router;
