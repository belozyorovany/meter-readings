const { v4: uuid } = require('uuid');
const config = require('../config');
const validator = require('email-validator');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');

module.exports.register = async (ctx, next) => {
  if (!validator.validate(ctx.request.body.email)) {
    ctx.status = 400;
    ctx.body = {errors: {email: 'Invalid email'}};
    return;
  }

  try {
    let user = await User.findOne({email: ctx.request.body.email});

    if (user) {
      ctx.status = 400;
      ctx.body = {errors: {email: 'Such email already exists'}};
      return next();
    }

    const token = uuid();

    user = await User.create({
      verificationToken: token,
      email: ctx.request.body.email,
      displayName: ctx.request.body.displayName
    });

    await user.setPassword(ctx.request.body.password);
    await user.save();

    await sendMail({
      template: 'confirmation',
      to: user.email,
      subject: 'Please confirm your email',
      locals: {token: token, port: config.port}
    });

    ctx.status = 200;
    ctx.body = {status: 'ok'};
  } catch(err) {
    throw(err);
  }
};

module.exports.confirm = async (ctx, next) => {
  try {
    const user =  await User.findOne({verificationToken: ctx.params.verificationToken});

    if (!user) {
      ctx.status = 400;
      ctx.body = {error: 'Your link is invalid or out of date'};
      return;
    }

    await user.verify();
    await user.save();

    ctx.status = 200;
    ctx.body = 'Registration complete';
  } catch(err) {
    throw(err);
  }
};
