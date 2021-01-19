const common = require('../common');
const expect = common.expect;
const connection = common.connection;
const options = common.options;
const sinon = require('sinon');
const axios = require('axios');
const request = axios.create({
  responseType: 'json',
  validateStatus: () => true,
});
const app = require('../../app');
const Router = require('koa-router');

describe('Get 500 error when something was broken', () => {
  let server;

  before((done) => {
    const router = new Router({prefix: '/api'});

    router.get('/test', (ctx, next) => {
      sinon.fake.throws(new Error('Some Error'))();
    });

    app.use(router.routes());

    server = app.listen(options.port, done);
  });

  after(async () => {
    server.close();
  });

  it('Should get response with status code 500', async () => {
    const response = await request({
        method: 'get',
        url: `${options.serverURL}/test`,
      });

    expect(response.status).to.equal(500);
    expect(response.data).to.equal('Some error occured');
  });
});

// describe('Get 400 error on bad request', () => {
//   let server;
//
//   before((done) => {
//     server = app.listen(options.port, done);
//   });
//
//   after(async () => {
//     server.close();
//   });
//
//   it('Should get response with status code 400', async () => {
//     const response = await request({
//         method: 'get',
//         url: `${options.serverURL}/confirm/token`,
//       });
//
//     expect(response.status).to.equal(400);
//   });
// });
