const common = require('../common');
const expect = common.expect;
const options = common.options;
const app = require('../../app');
const User = require('../../models/User');
const users = require('../../data/users');
const axios = require('axios');
const request = axios.create({
  responseType: 'json',
  validateStatus: () => true,
});

describe('Registered user gets token when authorized', () => {
  let server;

  before((done) => {
    server = app.listen(options.port, done);
  });

  beforeEach(async () => {
    await User.deleteMany();

    for (const user of users.users) {
      const u = new User(user);
      await u.setPassword(user.password);
      await u.save();
    }
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  after(() => {
    server.close();
  });

  it('Gets valid token passing correct credentials', async () => {
    const userData = {
      email: 'user1@mail.com',
      password: 'qwerty',
    };

    const response = await request({
      method: 'post',
      url: `${options.serverURL}/login`,
      data: userData,
    });

    expect(response.status).to.equal(200);
    expect(response.data).to.have.property('token');
  });
});
