module.exports = {
  port: process.env.PORT || 5000,
  mongodb: {
    uri: (process.env.NODE_ENV === 'test') ?
      'mongodb://localhost/test-meter-readings' :
      'mongodb://localhost/meter-readings',
  },
  crypto: {
    iterations: (process.env.NODE_ENV === 'test' ? 1 : 12000),
    length: 128,
    digest: 'sha512',
  }
};
