var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/userSchema');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
// var FacebookTokenStrategy = require('passport-facebook-token');
var jwt = require('jsonwebtoken');//used to create, sign and verify tokens

var config = require('./config');


exports.local = passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

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
    console.log('verify admin req.user.admin : '+req.user.admin);
    //console.log(req);
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

// exports.facebookPassport = passport.use(new FacebookTokenStrategy({
//     clientID: config.facebook.clientId,
//     clientSecret: config.facebook.clientSecret
// }, (accessToken, refreshToken, profile, done) => {
//     User.findOne({facebookId: profile.id}, (err, user) => {
//         if (err) {
//             return done(err, false);
//         }
//         if (!err && user !== null) {
//             return done(null, user);
//         }
//         else {
//             user = new User({ username: profile.displayName });
//             user.facebookId = profile.id;
//             user.firstname = profile.name.givenName;
//             user.lastname = profile.name.familyName;
//             user.save((err, user) => {
//                 if (err)
//                     return done(err, false);
//                 else
//                     return done(null, user);
//             })
//         }
//     });
// }
// ));