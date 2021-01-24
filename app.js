const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const {login} = require('./controllers/login');
const {register, confirm} = require('./controllers/register');
const { v4: uuid } = require('uuid');
const Session = require('./models/Session');

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

app.use((ctx, next) => {
  ctx.login = async function(user) {
    const token = uuid();
    await Session.create({token, user, lastVisit: new Date()});

    return token;
  };

  return next();
});

const router = new Router({prefix: '/api'});

router.use(async (ctx, next) => {
  const header = ctx.request.get('Authorization');
  if (!header) return next();

  const token = header.split(' ')[1];
  if (!token) return next();

  const session = await Session.findOne({token}).populate('user');
  if (!session) {
    ctx.throw(401, 'The authorization token invalid');
  }
  session.lastVisit = new Date();
  await session.save();

  ctx.user = session.user;
  return next();
});

router.post('/login', login);

router.post('/register', register);
router.get('/confirm/:verificationToken', confirm);

app.use(router.routes());

module.exports = app;
