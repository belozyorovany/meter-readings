const common = require('../common');
const expect = common.expect;
const options = common.options;
const app = require('../../app');
const User = require('../../models/User');
const axios = require('axios');
const request = axios.create({
  responseType: 'json',
  validateStatus: () => true,
});
const transportEngine = require('../../libs/sendMail').transportEngine;
const get = require('lodash/get');

function getRegisterResponse(userData) {
  return request({
      method: 'post',
      url: `${options.serverURL}/register`,
      data: userData,
    });
}

function getConfirmResponse(token) {
  return request({
    method: 'get',
    url: `${options.serverURL}/confirm/${token}`,
  })
}

describe('Registration: a new user can register', () => {
  let server;

  before((done) => {
    server = app.listen(options.port, done);
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  after(async () => {
    await User.deleteMany();
    server.close();
  });

  describe('Email should be valid', () => {
    it('Should get error if email is empty', async () => {
      const userData = {
        email: 'user@mail',
        displayName: 'user',
        password: 'qwerty',
      };

      const response = await getRegisterResponse(userData);

      expect(response.status).to.equal(400);
      expect(response.data).to.eql({errors: {email: 'Invalid email'}});
    });

    it('Should get error if email is invalid', async () => {
      const userData = {
        email: 'user@mail',
        displayName: 'user',
        password: 'qwerty',
      };

      const response = await getRegisterResponse(userData);

      expect(response.status).to.equal(400);
      expect(response.data).to.eql({errors: {email: 'Invalid email'}});
    });

    it('Should get error if user is already exists', async () => {
      const userData = {
        email: 'newuser@mail.com',
        displayName: 'newuser',
        password: 'qwerty',
      };

      const user = new User(userData);
      await user.setPassword(userData.password);
      await user.save();

      const response = await getRegisterResponse(userData);

      expect(response.status).to.equal(400);
      expect(response.data).to.eql({errors: {email: 'Such email already exists'}});
    });
  });

  describe('New user can register', () => {
    it('New user is created. The user has a verification token. The email is sent.', async () => {
      const userData = {
        email: 'newuser@mail.com',
        displayName: 'newuser',
        password: 'qwerty',
      };
      let envelope;
      transportEngine.on('envelope', (_envelope) => {
        envelope = _envelope;
      });

      const response = await getRegisterResponse(userData);

      const user = await User.findOne({email: userData.email});

      expect(response.status).to.equal(200);
      expect(response.data, 'The server response contains the "status" field').to.eql({status: 'ok'});

      expect(get(envelope, 'to[0]'), 'The letter is sent to the specified email').to
        .equal(userData.email);

      expect(user.verificationToken, 'The new user has the "verificationToken" field').to.exist;
      expect(user.passwordHash, 'The new user has the "passwordHash" field').to.exist;
      expect(user.salt, 'The new user has the "salt" field').to.exist;
    });
  });

  describe('New user can confirm registration', () => {
    it('The user who didn`t confirm registration can`t authenticate', async () => {
      const userData = {
        email: 'user@mail.com',
        displayName: 'user',
        password: 'qwerty',
        verificationToken: 'token',
      };

      const user = new User(userData);
      await user.setPassword(userData.password);
      await user.save();

      const response = await request({
          method: 'post',
          url: `${options.serverURL}/login`,
          data: {
            email: userData.email,
            password: userData.password
          },
        });

      expect(response.status).to.equal(400);
      expect(response.data).to.eql({error: 'Please confirm your email'});
    });

    it('Should get error if token is invalid', async () => {
      const userData = {
        email: 'user@mail.com',
        displayName: 'user',
        password: 'qwerty',
        verificationToken: 'token',
      };

      const user = new User(userData);
      await user.setPassword(userData.password);
      await user.save();

      const response = await getConfirmResponse('wrong_token');

      expect(response.status).to.equal(400);
      expect(response.data).to.eql({error: 'Your link is invalid or out of date'});
    });

    it('User confirms registration with valid token', async () => {
      const userData = {
        email: 'user@mail.com',
        displayName: 'user',
        password: 'qwerty',
        verificationToken: 'token',
      };

      const user = new User(userData);
      await user.setPassword(userData.password);
      await user.save();

      const response = await getConfirmResponse(userData.verificationToken);

      expect(response.status).to.equal(200);
      expect(response.data).to.equal('Registration complete');
    });
  });
});
