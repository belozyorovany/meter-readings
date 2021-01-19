const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const {login} = require('./controllers/login');
const {register, confirm} = require('./controllers/register');

const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
    try {
      await next();
    } catch(err) {
      if (err.status) {
        ctx.status = err.status;
        ctx.body = err.message;
        return;
      }

      console.log(err);
      ctx.status = 500;
      ctx.body = 'Some error occured';
    }
});

const router = new Router({prefix: '/api'});

router.post('/login', login);

router.post('/register', register);
router.get('/confirm/:verificationToken', confirm);

app.use(router.routes());

module.exports = app;
