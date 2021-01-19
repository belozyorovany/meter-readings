const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

module.exports = new LocalStrategy(
    {usernameField: 'email', session: false},
    async function(email, password, done) {
      try {
        user = await User.findOne({email: email });

        if (!user) {
          done(null, false, 'No such user');
          return;
        }

        passwordMatch = await user.checkPassword(password);

        if (!passwordMatch) {
          done(null, false, 'Invalid password');
          return;
        }

        const isVerified = await user.checkVerified();

        if (!isVerified) {
          done(null, false, 'Please confirm your email');
          return;
        }

        done(null, user);
      } catch(err) {
        done(err);
      }
    }
);
