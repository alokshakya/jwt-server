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



