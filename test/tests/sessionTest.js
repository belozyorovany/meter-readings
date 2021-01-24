const common = require('../common');
const expect = common.expect;
const options = common.options;
const users = require('../../data/users');
const app = require('../../app');
const axios = require('axios');
const request = axios.create({
  responseType: 'json',
  validateStatus: () => true,
});
const User = require('../../models/User');
const Session = require('../../models/Session');

describe('Authenticated user can access to a resctricted area', () => {
  let server;

  before(async () => {
    await User.deleteMany();
    await Session.deleteMany();

    for (const user of users.users) {
      const u = new User(user);
      await u.setPassword(user.password);
      await u.save();
    }

    server = await app.listen(options.port);
  });

  beforeEach(async () => {
    await Session.deleteMany({});
  });

  after(async () => {
    await User.deleteMany();
    await Session.deleteMany();

    server.close();
  });

  describe('The session is created on user`s login with valid credentials', () => {
    let session, user;
    const credentials = {
      email: users.users[0].email,
      password: users.users[0].password,
    };

    it('User`s session doesn`t exist while user isn`t authenticated', async () => {
      user = await User.findOne({email: users.users[0].email});
      session = await Session.findOne({user: user._id});
      expect(session).to.be.null;
    });

    it('Get a correct token using valid credentials', async () => {
      const response = await request({
        method: 'post',
        url: `${options.serverURL}/login`,
        data: credentials
      });

      session = await Session.findOne({user: user._id});

      expect(session.token).to.equal(response.data.token);
    });
  });
});
