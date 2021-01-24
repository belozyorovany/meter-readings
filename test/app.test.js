const common = require('./common');
const connection = common.connection;

describe('The test-test app', () => {
  after(() => {
    connection.close();
  });

  require('./tests/authenticationTest');
  require('./tests/loginTest');
  require('./tests/sessionTest');
  require('./tests/registerTest');
  require('./tests/errorHandlingTest');
});
