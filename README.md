# jwt-server

## Simple Node JS APP with JWT authentication
### Packages Used: passport passport-local passport-local-mongoose passport-jwt jsonwebtoken

##### passport passport-jwt passport-local-mongoose passport-local Authentication

## Procedure of building project

1. Install `express-generator` globally by running command `npm install -g express-generator` .

2. Create `express` project by running command `express jwtApp` .

3. `cd jwtApp`.

4. `npm install` to install dependencies.

5. `npm start` to start initial server running on localhost:3000

6. Now create a folder named `models` to create `mongoDB` database models.

7. For creating `mongoDB` models we need `mongoose` package.

8. `npm install --save mongoose` to install mongoose package this package will also be required to connect to `mongoDB` database.

9. For `UserSchema` which we will use to store user information and authentication we need `passport-local-mongoose` package that simplifies building username and password login with Passport and also provides instance API like authenticate(password, [cb]) for authenticating user with password without passport-local but `passport-local-mongoose` internally uses `passport-local`.

10. Inside models folder create `UserSchema.js` which will define `UserSchema` for our user.

```javascript
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    facebookId: String,
    admin: {
        type: Boolean,
        default: false
    }

});

User.plugin(passportLocalMongoose); // this will add password hash


module.exports = mongoose.model('User', User);
```
11. Since we are using `passport` for authentication so initialize this in `app.js` file.

```javascript
//initializing passport for jwt
var passport = require('passport');
app.use(passport.initialize());
```

12. Also add code in `app.js` for connecting to the `mongoDB` database.

```javascript
const mongoose = require('mongoose');
const config = require('./config');
const mongoUrl = config.mongoUrl;
const connect = mongoose.connect(mongoUrl,{
  useNewUrlParser:true,
  useUnifiedTopology:true
});

connect.then( (db) => {
  console.log('Connected correctly to mongoDB database');
}, 
(err) => { 
console.log(err)
});

```

13. After this make a central `authentication` file which will deal with all authentication startegies. Create a file named `authenticate.js` inside jwtApp folder.

```javascript
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/userSchema');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');//used to create, sign and verify tokens

var config = require('./config');


exports.local = passport.use(new LocalStrategy(User.authenticate()));

// serializing and deserializing is not required because we are full dependent on JWT and not using sessions
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// below strategy works when not using passport-local-mongoose

// exports.local = passport.use(new LocalStrategy(
//     function(username, password, done) {
//       User.findOne({ username: username }, function (err, user) {
//         if (err) { return done(err); }
//         if (!user) { return done(null, false); }
//         // if (!user.verifyPassword(password)) { return done(null, false); } this line checks for pass
//         return done(null, user);
//       });
//     }
//   ));

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,
        {expiresIn: 3600});
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false});

exports.verifyAdmin = function(req,res, next){
    if(req.user.admin){
        return next();
    }
    else{
        var err = new Error('You are not authorized to perform this operation!');
        //console.log('err object');
        //console.log(err);
        res.statusCode= 403;
        res.setHeader('Content-Type', 'application/json');
        res.json({err: 'You are not authorized to perform this operation!'}); 
    }
}
```





