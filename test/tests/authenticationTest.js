const common = require('../common');
const expect = common.expect;
const localStrategy = require('../../libs/strategies/local');
const User = require('../../models/User');
const users = require('../../data/users');

describe('Authentication: the registered user can authorize', () => {
  before(async () => {
    await User.deleteMany();

    for (const user of users.users) {
      const u = new User(user);
      await u.setPassword(user.password);
      await u.save();
    }
  });

  after(async () => {
    await User.deleteMany({});
  });

  it('The field "usernameField" should be equal to "email"', () => {
    expect(localStrategy._usernameField).to.equal('email');
  });

  it('The strategy should return an error if passed email doesn`t exist in the database', (done) => {
    localStrategy._verify('notexisting@mail.com', 'pass', (err, user, info) => {
      if (err) return done(err);

      expect(user).to.be.false;
      expect(info).to.equal('No such user');
      done();
    });
  });

  it('The strategy should return an error if the password doesn`t match', (done) => {
    localStrategy._verify('user1@mail.com', 'pass', (err, user, info) => {
      if (err) return done(err);

      expect(user).to.be.false;
      expect(info).to.equal('Invalid password');
      done();
    });
  });

  it('The strategy should return a user if the email and the password match', (done) => {
    localStrategy._verify('user1@mail.com', 'qwerty', (err, user, info) => {
      if (err) return done(err);

      expect(user.displayName).to.equal('user1');
      done();
    });
  });
});
