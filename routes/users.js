var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/userSchema');
var passport = require('passport');
var authenticate = require('../authenticate');
var router = express.Router();

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin,function(req, res, next) {
  User.find({})
    .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
    }, (err) => next(err))
    .catch((err) => next(err));
});


router.post('/signup', function( req, res, next){
  //console.log('username from request : '+req.body.username);
  //console.log('password from request : '+req.body.password);
  User.register( new User({username: req.body.username}),
   req.body.password, (err,user) =>{
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type','application/json');
      res.json({  err: err});
    }
    else{
      if(req.body.firstname)
        user.firstname = req.body.firstname;
      if(req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err,user) => {
        if(err){
          res.statusCode = 500;
          res.setHeader('Content-Type','application/json');
          res.json({  err: err});
          return;
        }
        passport.authenticate('local')(req, res, () =>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status : 'Registration Successful!'});
      });
      
      });
    }
  });
});

// router.post('/login', passport.authenticate('local',{session:false}), (req,
//    res, next) => {
  
//   var token = authenticate.getToken({_id: req.user._id});
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'application/json');
//   res.json({success: true, token: token, status : 'You are Successfully logged in!'});   
// });

router.post('/login', (req, res, next) => {
 User.findOne({username:req.body.username},(err,user) =>
 {
   if(err)
   {
    res.statusCode = 500;
    res.setHeader('Content-Type','application/json');
    res.json({  err: err});
    return;
   }
   if(!user)
   {
    res.statusCode = 500;
    res.setHeader('Content-Type','application/json');
    res.json({  err: 'Username not found'});
    return;
   }
   if(user)
   {
     user.authenticate(req.body.password, (err,thisModel, passErr) =>{
      if(passErr)
      {
        console.log('passErr object :');
        console.log(passErr);
        res.statusCode = 500;
        res.setHeader('Content-Type','application/json');
        res.json({  err: passErr});
        return;
      }
      if(err !==null)
      {
        console.log('err object :');
        console.log(err);
        res.statusCode = 500;
        res.setHeader('Content-Type','application/json');
        res.json({  err: {name:"passwordMissing",message:"No Password Provided"}});
        return;
      }
      if(thisModel)
      {
        console.log('thisModel Object print :');
        console.log(thisModel);// thisModel contains fileds salt hash apart from other User Attributes
        var token = authenticate.getToken({_id: user._id});
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, token: token, status : 'You are Successfully logged in!'});  
      }
      
     })
   }
 })
//  var token = authenticate.getToken({_id: req.user._id});
//  res.statusCode = 200;
//  res.setHeader('Content-Type', 'application/json');
//  res.json({success: true, token: token, status : 'You are Successfully logged in!'});   
});


router.post('/change-password', authenticate.verifyUser, (req,res, next) => {
  User.findById(req.user._id, (err,user) => {
    if(err){
      console.log('err1');
      next(err);
    }
    if(user){
      user.changePassword(req.body.oldPassword,req.body.newPassword, (err,thisModel,passwordErr) => {
        if(err){
          console.log('err object :');
          console.log(err);
          res.statusCode = 500;
          res.setHeader('Content-Type','application/json');
          res.json({  err: {name:err.name,message:err.message}});
        }
        if(passwordErr){
          console.log('passErr object :');
          console.log(passErr);
          res.statusCode = 500;
          res.setHeader('Content-Type','application/json');
          res.json({  err: passErr});
          return;
        }
        if(thisModel){
          user.save( (err,user) => {
            if(err){
              console.log('err3');
              next(err);
            }
            if(user){
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({success: true, status : 'Password Changed Successfully!'});
            }
          })
        }
      })
    }
  });
    
});


module.exports = router;
