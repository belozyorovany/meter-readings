const config = require('./config');
const app = require('./app');

app.listen(config.port, () => {
  console.log('App is running on port ' + config.port);
});
